---
layout: post
title: Building a Cross-Chain Bridge to Cosmos
excerpt: "In [**Part 1**](https://blog.anirudha.dev/building-a-cross-chain-bridge), we built a **LayerZero-powered bridge** for moving NFTs between **two EVM chains**. But what if we want to **bridge an NFT from Ethereum to Cosmos** (e.g., [Osmosis](https://osmosis.zone/), [Juno](https://junonetwork.io/), or [Stargaze](https://www.stargaze.zone/))?"
date: 2025-02-13
updatedDate: 2025-02-13
featuredImage: /images/posts/f2a8b867-b63b-471f-a173-e294fd9adb49.png
tags:
  - post
  - abstraction
  - interoperability
  - web3
  - cross-chain
  - evm
  - nft
  - cosmos
  - bridge
---

In [**Part 1**](https://blog.anirudha.dev/building-a-cross-chain-bridge), we built a **LayerZero-powered bridge** for moving NFTs between **two EVM chains**. But what if we want to **bridge an NFT from Ethereum to Cosmos** (e.g., [Osmosis](https://osmosis.zone/), [Juno](https://junonetwork.io/), or [Stargaze](https://www.stargaze.zone/))?

For this, let’s go with the setup:

* **LayerZero on the EVM side** (Ethereum, Base, Polygon, etc.)
    
* **IBC (Inter-Blockchain Communication)** on the Cosmos side
    

### **So, what are we doing?**

1. **EVM Side (Solidity)**
    
    * Locks the NFT in a Solidity contract
        
    * Sends a message to the Cosmos chain using LayerZero
        
2. **Cosmos Side (Rust-CosmWasm)**
    
    * Receives the message via an IBC contract
        
    * Mints a wrapped NFT on the Cosmos chain
        

Similarly, when transferring back:

1. **Burn wrapped NFT on Cosmos**
    
2. **Send an IBC message to Ethereum**
    
3. **Unlock the original NFT on Ethereum**
    

We'll extend our previous `BridgeA.sol` to support **sending messages to Cosmos** via **LayerZero**.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";

contract EVMCosmosBridge is NonblockingLzApp {
    ERC721 public nft;
    address public admin;

    event NFTLocked(address indexed user, uint256 tokenId);

    constructor(address _nft, address _lzEndpoint) NonblockingLzApp(_lzEndpoint) {
        admin = msg.sender;
        nft = ERC721(_nft);
    }

    function lockNFT(uint256 tokenId, uint16 destChainId, bytes memory receiver) external payable {
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");

        // Transfer NFT to the contract
        nft.transferFrom(msg.sender, address(this), tokenId);

        // Encode user + token ID to send to Cosmos
        bytes memory payload = abi.encode(msg.sender, tokenId);

        // Send message to Cosmos via LayerZero
        _lzSend(destChainId, payload, payable(msg.sender), address(0), bytes(""), msg.value);

        emit NFTLocked(msg.sender, tokenId);
    }

    function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory payload) internal override {
        (address user, uint256 tokenId) = abi.decode(payload, (address, uint256));

        // Unlock NFT on EVM when receiving from Cosmos
        nft.transferFrom(address(this), user, tokenId);
    }
}
```

So, what’s happening here?

1. The user initiates the process by calling the `lockNFT(tokenId, destChainId, receiver)` function. This function requires the user to specify the token ID of the NFT they want to lock, the destination chain ID where the NFT will be sent, and the receiver's address on the destination chain.
    
2. Once the function is called, the specified NFT is **transferred to the smart contract** and effectively **locked** within it. This means the user no longer has direct control over the NFT, as it is held securely by the contract.
    
3. After locking the NFT, a **LayerZero message** is created and sent to the Cosmos contract. This message contains encoded information about the user and the token ID, allowing the Cosmos network to understand which NFT is being transferred and who it belongs to.
    
4. Upon receiving the message, the Cosmos contract processes it and **mints a wrapped NFT** for the user. This wrapped NFT represents the original NFT on the Cosmos network, allowing the user to interact with it as if it were the original NFT, while the real NFT remains locked in the EVM contract.
    

Now, lets move to cosmos side. We need to receive IBC messages from Ethereum, mints a **wrapped NFT, and finally** burn the wrapped NFT when sending back to Ethereum.

```rust
use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, SubMsg, WasmMsg,
};
use cw721::{Cw721ExecuteMsg, MintMsg};
use crate::msg::{ExecuteMsg, InstantiateMsg};

// NFT Bridge Contract
#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    // Store NFT contract address in state
    let state = State { nft_contract: msg.nft_contract };
    CONFIG.save(deps.storage, &state)?;

    Ok(Response::new())
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::ReceiveNFT { sender, token_id } => receive_nft(deps, env, sender, token_id),
        ExecuteMsg::BurnAndSend { token_id, dest_chain_id } => burn_and_send(deps, env, info, token_id, dest_chain_id),
    }
}

// Receive NFT from Ethereum
fn receive_nft(deps: DepsMut, env: Env, sender: String, token_id: String) -> StdResult<Response> {
    let state = CONFIG.load(deps.storage)?;

    let mint_msg = WasmMsg::Execute {
        contract_addr: state.nft_contract.clone(),
        msg: to_binary(&Cw721ExecuteMsg::Mint(MintMsg {
            token_id: token_id.clone(),
            owner: sender.clone(),
            token_uri: Some("https://metadata-url"),
        }))?,
        funds: vec![],
    };

    Ok(Response::new().add_message(mint_msg))
}

// Burn and Send Back to Ethereum
fn burn_and_send(deps: DepsMut, env: Env, info: MessageInfo, token_id: String, dest_chain_id: u16) -> StdResult<Response> {
    let state = CONFIG.load(deps.storage)?;

    let burn_msg = WasmMsg::Execute {
        contract_addr: state.nft_contract.clone(),
        msg: to_binary(&Cw721ExecuteMsg::Burn { token_id: token_id.clone() })?,
        funds: vec![],
    };

    // Send IBC message back to Ethereum
    let ibc_msg = IbcMsg::SendPacket {
        channel_id: "channel-0".to_string(),
        data: to_binary(&CrossChainPayload { sender: info.sender.to_string(), token_id })?,
        timeout: IbcTimeout::with_timestamp(env.block.time.plus_seconds(300)),
    };

    Ok(Response::new().add_message(burn_msg).add_message(ibc_msg))
}
```

So, what’s happening here?

1. **Receive Message** from Ethereum → This step involves receiving a message from the Ethereum blockchain, which triggers the process of creating a new wrapped NFT on the current blockchain. This NFT represents the original asset from Ethereum.
    
2. **Mint Wrapped NFT** → After receiving the message, the system mints a new wrapped NFT. This involves executing a minting function that creates a token with a unique ID and assigns it to the specified owner, linking it to metadata that describes the asset.
    
3. **Burn Wrapped NFT** when sending back → When the wrapped NFT needs to be returned to Ethereum, it is first burned. This means the token is destroyed on the current blockchain to ensure it cannot be used again, maintaining the integrity of the asset's representation.
    
4. **Send IBC Message** back to Ethereum → Finally, an Inter-Blockchain Communication (IBC) message is sent back to Ethereum. This message includes details about the burned token and the intended recipient on Ethereum, ensuring the asset can be accurately reconstructed on its original chain.
    

A bigger problem in cosmos ecosystem is that each project uses their custom developed cw-standard. It’s not a problem per-say but it poses higher risks towards interoperability, vulnerability risks and so on.

## **🔑 Best Practices & Optimisations**

✅ **Security First:**

* Add **role-based access** for admins.
    
* Ensure **proper NFT ownership checks** before burning/minting.
    

✅ **Gas Optimisation:**

* Use **batch transactions** for handling multiple NFTs.
    
* Compress payload data before sending cross-chain.
    

✅ **Scalability:**

* Support multiple **Cosmos chains** by using **ICS-721 (NFT standard for Cosmos IBC)**.
    

![](/images/posts/26f8ca87-06af-47d8-8cbc-a6d68fd02a6f.webp)

There’s a few token bridges that operate today. Haven’t tested them all myself but they seem reliable.

* [Axelar](https://www.axelar.network/blog/cosmos-bridge-explained)
    
* [Gravity bridge](https://blog.cosmos.network/gravity-is-an-essential-force-of-the-cosmos-aligning-all-planets-in-orbits-in-the-composable-b1ca17de18cc)
    
* [Squid router](https://www.squidrouter.com/squid-school/Cosmos-to-EVM-swap-guide#section-1)
    
* [Evmos](https://docs.evmos.org/protocol)
    

There might be more.

The future of Cosmos–EVM bridges is shaping up to be a game-changer, not just for developers but for the entire blockchain space. Right now, we see fragmented ecosystems, Ethereum, with its massive DeFi and NFT markets, and Cosmos, with its modular, interoperable chains. Bridging these two worlds is more than just about moving assets, it’s about unlocking new possibilities for seamless cross-chain interactions. Imagine a future where an NFT minted on Ethereum can be used in a Cosmos-based game, or where DeFi users on Cosmos can access Ethereum’s liquidity pools without even realising they’re using two different chains. That’s the kind of frictionless experience these bridges are working toward.

One of the biggest shifts we’re likely to see is the rise of generalised cross-chain smart contracts. Right now, most bridges focus on asset transfers. Locking tokens on one side and minting wrapped versions on the other. But what if dApps could execute Solidity contracts from Cosmos-based chains or trigger CosmWasm contracts from Ethereum? That would mean truly decentralised applications that function across multiple chains, rather than being siloed into one ecosystem. We’re already seeing early versions of this with Axelar’s General Message Passing and Cosmos Interchain Accounts, but the technology is still in its early days. Once these solutions become more mature, developers will no longer have to build separate versions of their dApps for different chains. Just build once and let the bridge handle the communication.

Security is another major aspect that’s bound to improve. Traditional bridges have been some of the biggest targets for hacks, often due to their reliance on trusted relayers or multi-sig setups. The future will likely bring more trustless designs, possibly using zk-SNARKs or other cryptographic proofs to validate transactions across chains without needing intermediaries. This will not only make bridges safer but also reduce centralisation risks. Additionally, optimised gas fee mechanisms could make cross-chain transactions more affordable, encouraging wider adoption.

Ultimately, the future of Cosmos–EVM bridges is about making blockchain technology feel invisible. Users shouldn’t have to think about which chain they’re on, they should just be able to interact with applications, own assets, and move seamlessly across networks. The end goal isn’t just interoperability, it’s a fully decentralised, interconnected metaverse where blockchains function as one unified system rather than competing silos.
