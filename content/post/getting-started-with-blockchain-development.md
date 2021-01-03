---
title: "Getting Started With Blockchain Development"
description: "Get started with blockchain development"
date: 2020-07-07T12:57:21+05:30
author: "Ani"
categories: ["blockchain", "development"]
tags: ["blockchain", "development", "getting-started"]
image: "blockchain-banner.jpg"
---

![Getting Started With Blockchain Development](https://miro.medium.com/max/1400/1*LvSeIS6S6_MR5b9ARjiGTA@2x.png "Getting Started With Blockchain Development")
About time you’ve heard about Blockchain and want to a dig into the development phases of it. _Respect that._ Though on your first few google searches you’ve probably got about a million of tutorials, articles and resources and now you’re just about on the verge of giving up on it and moving on. _Can’t blame you._ But before you gave up forever, you somehow seem to have stumbled across just about one more article and believe it or not, you’ve chosen wisely.

Clearly blockchain technology has lots to offer and way too many pathways to get started with. We’re going to take the journey from every possible way and hopefully, one of these would pick you right up from where you stand today.

_Word of the wise, if you’re new to development in general and have no clue as to what blockchain is, we recommend to read a few introductory articles before coming back here._

> Blockchain is a decentralised network and a distributed database.

It started off as being public only, with Bitcoin and Ethereum bringing up the names to the masses. Eventually, private blockchains like Hyperledger also gained traction given enterprises heavily adopting it throughout their processes. Now, there’s all sorts of classifications based on data structure or how consensus is formed.

!["Blockchain Types"](https://miro.medium.com/max/1400/1*j6DZ2kmypPkEJs-wGmepMg.png "Here’s a brief overview on the classification based on the architecture of the blockchain.")

So, where to get started from? Well, that largely depends on your area of interest really. Here’s a few areas to get started with:

## Smart Contract Development

If you’re a programmer, this is one of the easiest to get started with. Smart Contracts are just pieces of codes that run on the blockchain. In that way, we can classify a Hello World program also as smart contract. Of course, it’s neither smart not a contract in this case.

> “A smart contract is a set of promises, specified in digital form, including protocols within which the parties perform on these promises.”
— Nick Szabo

Every blockchain has it’s own language or syntax to write smart contract on. Ethereum uses Solidity, Hyperledger uses Chaincode, Cardano uses Plutus and so on.

Here’s an example smart contract in Solidity. This is a simple smart contract designed to store a certain value, in this case, `storedData`.
```
pragma solidity ^0.4.0;
contract SimpleStorage {
    uint storedData;
    function set(uint x) public {
        storedData = x;
    }
    function get() public constant returns (uint) {
        return storedData;
    }
}
```
There are two functions, `set()` and `get()`. `get()` will get whatever value is stored and `set()` takes a parameter `x` and stores it in the blockchain.
Pretty straightforward, right?

Here’s a more complex one:
```
pragma solidity ^0.4.19;
contract Escrow {
    address public buyer;
    address public seller;
    address public arbiter;
    address owner;
    function Escrow(address _seller, address _arbiter) {
        buyer = msg.sender;
        seller = _seller;
        arbiter = _arbiter;
    }
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    function payoutToSeller() {
        if(msg.sender == buyer || msg.sender == arbiter) {
            seller.transfer(this.balance);
        }
    }
    function refundToBuyer() {
        if(msg.sender == seller || msg.sender == arbiter) {
            buyer.transfer(this.balance);
        }
    }
    function getBalance() constant returns (uint) {
        return this.balance;
    }
    function setSeller(address _seller) public {
        seller = _seller;
    }
    function setArbiter(address _arbiter) public {
        arbiter = _arbiter;
    }
    function getSeller() public constant returns (address) {
        return seller;
    }
    function getArbiter() public constant returns (address) {
        return arbiter;
    }
}
```

This is an Escrow smart contract as the name suggests. We’ve defined a buyer, seller and an arbiter. The arbiter usually is the smart contract address itself, because the entire point of blockchain is to remove middlemen (or so they said). Learn more about [smart contracts in this article](https://blog.acycliclabs.com/posts/why-are-smart-contracts-so-important.html).

Ideally, we use smart contracts to write conditional statements which might help solve interoperability issues or accountability related stuff. But of course, if you just want to write a summation smart contract, that’s cool too.

## Consensus Algorithm

So, once you know how to input and output data to blockchain, the next thing is to get the data transaction approved on chain.

> A consensus mechanism is a fault-tolerant mechanism that is used in computer and blockchain systems to achieve the necessary agreement on a single data value or a single state of the network among distributed processes or multi-agent systems.

Consensus is important to maintain the decentralised nature of the network. Before data can be written to the distributed database, a given number of nodes/entities has to agree over the validity of the transaction. If majority agrees, the data is recorded, otherwise discarded.

There are several consensus mechanisms out there. Some of the popular ones are POW, POS, POA, etc. So, if you’re into deep algorithms and research, this is an extremely exciting work. Read more about various [consensus mechanisms in blockchain here](https://blog.acycliclabs.com/posts/consensus-mechanisms-in-blockchain.html).

If you see a new way to validate a transaction or data, by which you can achieve synchronicity and data sanity, that can be a possible consensus mechanism. Once you’ve formularised what it does, start working on how it does it. The mathematical algorithm basically. To define the proof that you just created. These sometimes takes years to formalise. Post it on popular cryptographic forums and seek contribution help from fellow mathematicians.

## Library Development

If you are pretty advanced with programming languages and want to integrate your native language with smart contracts, then library development is the right place to get started with.

Since the smart contracts are usually in the blockchain’s native language, it’s very difficult for day-to-day work to transpile every single piece of code explicity and write a mirror code to execute the same. Most popular blockchains provide support for common languages like python, javascript, golang, etc.

Ethereum has [web3.js](https://github.com/ethereum/web3.js) and [web3.py](https://github.com/ethereum/web3.py) to help javascript and python developers easily interact with blockchain. You can start writing in your native language as well, for which the Ethereum Foundation might not have written already. Of course, if your library is good enough, they might ending up adding it to their official repo.

## Protocols Development

Protocols form the base layer on top of which decentralised network work. There is vast range of protocols and we need to define our scope of work to which protocols we might be referring to.

Coming from traditional programming background, you must be aware of web protocols such as HTTP (Hypertext Transfer Protocol) or TCP/IP (Transmission Control Protocol/Internet Protocol). The idea with these protocols were to provide a governance layer or setup “some rules” over how and what type of data is transmitted. Similarly we can write our own protocols for the decentralised network about the way of transactions, the form data, mode of transmission, the duration of open channels and so on. Given the use-case, protocols can form the very base layer on top of which modern decentralised applications are built.

To develop protocols, you can start with writing simple stuff like and gradually write more complex logic. Some example protocols to get started with are listed here.

Develop a protocol for:
1. End-to-end encrypted communication.
2. Interoperability amongst various blockchains.
3. Token exchange.
4. Track a product life-cycle.
5. Maintain user access
..the list goes on. But now you have a general idea of where to get started with. Read more here about [protocols](https://www.worth.com/understanding-protocol-wars-and-what-they-mean-for-blockchain/).

## Network

So, you’re coming from OS and Networking background. Since blockchain is a basic level decentralised network, it might be a great place to start.

You might recall some basic level network topologies such as star, mesh, ring, tree, bus, etc. Well, decentralised networks are not much different as far as network architecture goes on. Various blockchains have experimented with different forms of it at various levels to achieve desired results. The key idea is to have a secure connection amongst the nodes with least possible latency. A complete loss-less connection is still far fetched idea so you’ve a lot of places to contribute here.

Side chains sometimes form completely different topologies to achieve results at faster processing. Mostly though connects through a p2p network so there’s no brokers in between.

![Network Evolution](https://miro.medium.com/max/1276/1*r_z0P195PUcPiz7RkaCjkw.jpeg "Network Evolution")

A good place to start with network development would be to read the whitepapers of various blockchains and figure out what everyone’s doing and probably you will able to plug in your thoughts in one or more of them to come up with something original. Do not be afraid to experiment.
IIT Kanpur, IIT Chennai, IISC Bengaluru have research centres working actively on this area where you can also join as research fellowship programs and complete your thesis. Our community platforms are also a good way to work with others researching around the same.

## Infrastructure

You like infrastructure development. You’ve probably worked on micro-services and monoliths and now looking to find your place in blockchain ecosystem.

!["Blockchain Architecture Layers"](https://miro.medium.com/max/1400/1*SbjqBHnpwbbhpub4XNcd5Q.png "Blockchain Architecture Layers")

Unlike traditional architecture, the infrastructure of decentralised system has nothing to do with the dapps at all. All your infra knowledge will be put together to work on node clusters to setup a robust scalable model of the decentralised network. Think about how you can run nodes from the largest of VMs or docker or kuberenetes setup to the smallest of microchips as an Arduino Uno or Raspberry Pi 2. Ideally, a blockchain database becomes way to large for a small Raspberry Pi to handle. But hey, that’s where your knowledge comes in. Think about how to make it work. IOTA is one the DLTs which nodes can run on Raspberry Pi. So, maybe figure out a way to design a lightweight node to make to run on Raspberry Pi? Who knows, you might crack it.

Another interesting arena in this regard is to play around with data storage infrastructures. Data storage is still over-blotted for a blockchain being linked list and all. Maybe experiment on how you can keep the same structural integrity and yet make it more scalable.

## Token Development/Crypto-Economics

Tokens are a crucial part of public blockchains. So, if you’re planning to develop your application to run on a public blockchain, you might also would want to develop your own token.

You can obviously use the native token of the blockchain itself, such as Ethers if you’re using Ethereum blockchain, Lumens if you’re on Stellar blockchain and so on. But with your own token, you can control the output, exchange mechanisms, trade routes, use-cases, minting or creating new tokens rate, and several other factors. Ethereum offers a wide range of token standards to develop your tokens on. Most popular amongst which is ERC20.

This also involves a good understanding of smart contracts, but more focus would be on financial side. Here’s a sample ERC20 smart contract that you can study to get started with.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
import "../../GSN/Context.sol";
import "./IERC20.sol";
import "../../math/SafeMath.sol";
import "../../utils/Address.sol";
/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin guidelines: functions revert instead
 * of returning `false` on failure. This behavior is nonetheless conventional
 * and does not conflict with the expectations of ERC20 applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Context, IERC20 {
    using SafeMath for uint256;
    using Address for address;
    mapping (address => uint256) private _balances;
    mapping (address => mapping (address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    /**
     * @dev Sets the values for {name} and {symbol}, initializes {decimals} with
     * a default value of 18.
     *
     * To select a different value for {decimals}, use {_setupDecimals}.
     *
     * All three of these values are immutable: they can only be set once during
     * construction.
     */
    constructor (string memory name, string memory symbol) public {
        _name = name;
        _symbol = symbol;
        _decimals = 18;
    }
    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }
    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5,05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless {_setupDecimals} is
     * called.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }
    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }
    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }
    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }
    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20};
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for ``sender``'s tokens of at least
     * `amount`.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }
    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }
    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }
    /**
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     *
     * This is internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        _beforeTokenTransfer(sender, recipient, amount);
        _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }
    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements
     *
     * - `to` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        _beforeTokenTransfer(address(0), account, amount);
        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }
    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");
        _beforeTokenTransfer(account, address(0), amount);
        _balances[account] = _balances[account].sub(amount, "ERC20: burn amount exceeds balance");
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(account, address(0), amount);
    }
    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner`s tokens.
     *
     * This is internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    /**
     * @dev Sets {decimals} to a value other than the default one of 18.
     *
     * WARNING: This function should only be called from the constructor. Most
     * applications that interact with token contracts will not expect
     * {decimals} to ever change, and may work incorrectly if it does.
     */
    function _setupDecimals(uint8 decimals_) internal {
        _decimals = decimals_;
    }
    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be to transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual { }
}
```

Now, you would have noticed some basic configurations that you’ll have to do while deploying this smart contract, like token name, symbol, total supply and so on.

You can explore other [Ethereum token standards](https://github.com/ethereum/EIPs/tree/master/EIPS) here usually termed as Ethereum Improvement Proposals (EIPs).

## DAPPs

Ideally, I would have put this on top. You can just forget about how all blockchain works and just want to develop an application that sits on top of a decentralised network and work with tokens. Maybe create the next [Cryptokitties](https://www.cryptokitties.co/).

All you would need for this is some frontend development knowledge, with frameworks like ReactJs, VueJs, AngularJs, EmberJs and so on. Ideally for a dapp, you might not need any backend at all.

![Dapp Architecture](https://miro.medium.com/max/1400/1*xq-UXnQ1YKStGBIFiNG60w.png "Dapp Architecture")

Just integrate web3.js library to connect directly with blockchain via [MetaMask](https://metamask.io/) chrome plugin or [Infura](https://infura.io/) apis. You might also would like to explore to connect via an external [Blockchain Oracle service provider, such as Sentinel](https://sentinel.acycliclabs.com/).


_This is obviously an ever growing field so do not get overwhelmed if tomorrow you hear something entirely new in blockchain technology to work on._

<sub><sup>Originally posted on [Blockchained India Medium Blog](https://medium.com/blockchainedindia/getting-started-with-blockchain-development-5664aa3f2cf9).</sup></sub>
