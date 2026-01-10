---
layout: post
title: Building a Cross-Chain Bridge
excerpt: "So, how about we learn how to build a **cross-chain bridge** that allows NFTs to move between two **EVM-compatible chains** (e.g., Ethereum & Base, Arbitrum, Optimism & Polygon). Unlike traditional bridges, which use an **off-chain relayer**, we will implement an **on-chain gateway** using [LayerZero](https://layerzero.network/), making the process **fully decentralised and trustless**."
date: 2025-02-09
updatedDate: 2025-02-09
featuredImage: /images/posts/7f6301ee-1c9c-437f-96a7-fa3c94ffcd78.png
tags:
  - post
  - abstraction
  - interoperability
  - web3
  - cross-chain
  - nft
  - bridge
---

> A **cross-chain bridge** is a protocol that allows assets, data, or smart contract states to be transferred between two or more decentralised networks. It enables interoperability between different blockchains, ensuring seamless movement of tokens, NFTs, and other digital assets across ecosystems.

So, how about we learn how to build a **cross-chain bridge** that allows NFTs to move between two **EVM-compatible chains** (e.g., Ethereum & Base, Arbitrum, Optimism & Polygon). Unlike traditional bridges, which use an **off-chain relayer**, we will implement an **on-chain gateway** using [LayerZero](https://layerzero.network/), making the process **fully decentralised and trustless**.

[*If you want to read more about decentralised bridges, check out my previously posted article.*](https://blog.anirudha.dev/decentralising-bridges)

NFTs and assets are often confined to their originating blockchain, limiting their interoperability and liquidity. A **cross-chain bridge** enables users to transfer NFTs between different chains, enhancing:

* **Liquidity** – NFTs can be traded across multiple ecosystems.
    
* **Utility** – Users can access different dApps on multiple chains.
    
* **Scalability** – Avoid congestion on expensive chains like Ethereum.
    

The base chain, where an NFT collection originates, plays a crucial role in determining the overall value and functionality of the NFTs.

1. **Security and Trust**: The base chain provides the foundational security for the NFT collection. A well-established chain like Ethereum offers robust security features, which can enhance the trustworthiness of the NFTs. While an L2 like Base can offer lower gas fee. There’s several factors that you can think of while deciding the base chain for your NFT collection.
    
2. **Network Effects**: The popularity and user base of the base chain can significantly impact the visibility and adoption of the NFT collection. A chain with a large community can drive more engagement and transactions.
    
3. **Ecosystem and Tools**: The base chain often dictates the available development tools and ecosystem support. A rich ecosystem with various dApps and services can add more utility to the NFTs, allowing them to be used in diverse applications.
    
4. **Transaction Costs**: The cost of transactions on the base chain can affect the affordability and frequency of NFT trades. Chains with lower fees can encourage more trading activity, while high fees might deter users.
    
5. **Interoperability**: The base chain's compatibility with other chains can determine how easily NFTs can be transferred across different networks. A chain that supports cross-chain protocols can enhance the liquidity and utility of the NFTs. It’s very important that you do not choose a chain which doesn’t allow access to outside network at all.
    
6. **Innovation and Upgrades**: The pace of innovation and the ability to implement upgrades on the base chain can influence the long-term viability and features of the NFT collection. Chains that are actively developed and improved can offer more advanced capabilities over time. Never go for a chain, which has stangant development or takes too long to iterate.
    

However, we can not expect all the users to remain on any single network. So, we need to prepare for the seemless moving around of assets cross-chain, thereby improving interoperability.

And of course, there are several approaches to achieve bridging, depending on how you structure your product. Let’s go ahead with a classic approach this time.

![](https://cdn.prod.website-files.com/5f75fe1dce99248be5a892db/65675d979a0831972f6df33a_65525236ec04b0422258c81d_6537cb2e61b41e734eb82148_What-Are-Cross-Chain-NFTs__2-V1.png)

## How It Works

1. **Lock the NFT** on **Chain A** (BridgeA contract).
    
2. **Send a cross-chain message** using LayerZero to **Chain B**.
    
3. **BridgeB contract receives the message** and **mints a wrapped NFT** on Chain B.
    
4. To **return the NFT**, the wrapped NFT is **burned** on Chain B, and a **message is sent back** to unlock the original NFT.
    

### 🏛 On-Chain Relayer (Our Approach)

✅ Fully decentralised, no external trust required.  
✅ All logic is enforced via smart contracts.  
✅ Works with protocols like LayerZero or Axelar.

### ⚡ Off-Chain Relayer

❌ Requires external nodes/validators to confirm transactions.  
❌ Can introduce centralisation and trust assumptions.  
❌ Relayers may become a point of failure.

Our **on-chain approach** ensures security and trustlessness by leveraging smart contracts for message passing. We’re using EVM chains for this example so the contracts preferrably written in solidity.

### NFT Contract

First, deploy an **ERC-721 NFT** contract on **both chains**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    
    constructor() ERC721("MyNFT", "MNFT") {}
    
    function mint(string memory tokenURI) external onlyOwner {
        _safeMint(msg.sender, nextTokenId);
        _setTokenURI(nextTokenId, tokenURI);
        nextTokenId++;
    }
}
```

### Bridge Contract (Chain A) – **Lock NFT & Send Message**

Create `BridgeA.sol` on **Chain A**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";

contract BridgeA is NonblockingLzApp {
    ERC721 public nft;
    address public admin;

    event NFTLocked(address indexed user, uint256 tokenId);

    constructor(address _nft, address _lzEndpoint) NonblockingLzApp(_lzEndpoint) {
        admin = msg.sender;
        nft = ERC721(_nft);
    }

    function lockNFT(uint256 tokenId, uint16 destChainId, bytes memory receiver) external payable {
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        nft.transferFrom(msg.sender, address(this), tokenId);
        bytes memory payload = abi.encode(msg.sender, tokenId);
        _lzSend(destChainId, payload, payable(msg.sender), address(0), bytes(""), msg.value);
        emit NFTLocked(msg.sender, tokenId);
    }

    function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory payload) internal override {}
}
```

### Bridge Contract (Chain B) – **Receive & Mint Wrapped NFT**

Create `BridgeB.sol` on **Chain B**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";

contract BridgeB is ERC721URIStorage, NonblockingLzApp {
    address public admin;
    uint256 public nextTokenId;

    event NFTMinted(address indexed user, uint256 tokenId);

    constructor(address _lzEndpoint) ERC721("WrappedNFT", "WNFT") NonblockingLzApp(_lzEndpoint) {
        admin = msg.sender;
    }

    function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory payload) internal override {
        (address user, uint256 tokenId) = abi.decode(payload, (address, uint256));
        _safeMint(user, nextTokenId);
        _setTokenURI(nextTokenId, "https://metadata-url");
        emit NFTMinted(user, nextTokenId);
        nextTokenId++;
    }
}
```

### Unlocking NFTs (Return to Chain A)

Modify `BridgeB.sol` to **burn the wrapped NFT and send it back**:

```solidity
function burnNFT(uint256 tokenId, uint16 destChainId) external payable {
    require(ownerOf(tokenId) == msg.sender, "Not NFT owner");
    _burn(tokenId);
    bytes memory payload = abi.encode(msg.sender, tokenId);
    _lzSend(destChainId, payload, payable(msg.sender), address(0), bytes(""), msg.value);
}
```

Modify `BridgeA.sol` to **release the original NFT**:

```solidity
function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory payload) internal override {
    (address user, uint256 tokenId) = abi.decode(payload, (address, uint256));
    nft.transferFrom(address(this), user, tokenId);
}
```

## Let’s test our Bridge:

1. **Deploy contracts** on two testnets (say, Base Sepolia & Polygon Amoy).
    
2. **Mint an NFT** on Chain A.
    
3. **Lock & transfer the NFT** using the bridge.
    
4. **Verify minting of wrapped NFT** on Chain B.
    
5. **Burn wrapped NFT** to return to Chain A.
    

## Future Improvements that can be made:

### **Multi-Chain Support**

To enhance the functionality and reach of our bridge, we can consider adding support for additional EVM-compatible chains. This would involve integrating with popular networks like Binance Smart Chain, Avalanche, and Fantom, which would allow users to transfer NFTs across a wider range of platforms. Furthermore, expanding beyond EVM-compatible chains to include other blockchain ecosystems, such as Solana, Cosmos, and Polkadot, could significantly broaden the bridge's capabilities. This expansion would require developing interoperability solutions to handle the unique characteristics and consensus mechanisms of these different blockchains. By doing so, we would enable seamless NFT transfers across a diverse array of blockchain networks, providing users with greater flexibility and access to a wider audience. This strategic enhancement could position our bridge as a leading solution in the rapidly evolving multi-chain NFT landscape.

### **Cross-Chain Fees**

Implementing gas abstraction can significantly enhance the user experience by making transactions more seamless and user-friendly. Gas abstraction involves creating a system where users do not need to worry about paying gas fees directly in cryptocurrency. Instead, the system can handle these fees on behalf of the users, possibly by integrating a third-party service or using a relayer network. This approach can simplify the transaction process, especially for users who are not familiar with blockchain technology or do not hold the native cryptocurrency required for gas fees. By abstracting gas fees, developers can create a more intuitive and accessible platform, encouraging broader adoption and reducing barriers for entry into the blockchain ecosystem. Additionally, this can be particularly beneficial in scenarios involving cross-chain interactions, where users might otherwise need to manage multiple cryptocurrencies for gas fees on different chains.

### **Decentralised Governance**

Decentralised Autonomous Organisations (DAOs) can play a crucial role in managing and governing bridge policies. By introducing DAO-controlled bridge policies, we can ensure that the decision-making process is transparent, democratic, and community-driven. This means that all stakeholders, including developers, users, and investors, can participate in proposing, discussing, and voting on changes to the bridge's operational rules and guidelines. Such a system can enhance trust and accountability, as decisions are made collectively rather than by a centralised authority. Additionally, DAO governance can adapt more quickly to the evolving needs of the community and the market, allowing for more responsive and flexible policy adjustments. By leveraging the power of DAOs, we can create a more resilient and adaptable bridge infrastructure that aligns with the interests and values of its users.

> Note that this was for learning purposes only. The real contracts will have to consider several security issues and vulnerabilities which we’ve assumed here, as part of the happy path. But it’s a start and would love to see at least some of you try it out and build more decentralised bridges. The bridges ecosystem is both quickly evolving and stagnant at the same time. Cross-chain messaging protocols have certainly pulled in a pin off the race for building decent decentralised bridges, but we’ve quite a few improvement yet to be made to achieve true trustless systems.

![](/images/posts/4478b09b-d6bd-41b6-bb44-eb8c84b82d53.jpeg)
