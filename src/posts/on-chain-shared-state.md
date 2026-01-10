---
layout: post
title: On-Chain Shared State
excerpt: Communication is a key in any ecosystem. Now with more cross-chain communication getting sorted using bridges, it's high time to sort on-chain communications as well.
date: 2024-04-26
updatedDate: 2024-04-26
featuredImage: /blog/images/posts/1675e0ae-ec2d-4c2f-a0b3-2b9a5684d7cb.webp
tags:
  - post
  - nft
  - protocols
  - eip
  - dripverse
---

Communication is a key in any ecosystem. Now with more cross-chain communication getting sorted using bridges, it's high time to sort on-chain communications as well. Particularly, referencing of composable smart contract functionalities within the same chain.

# On-Chain Immutability

Blockchains in general are isolated networks. Smart contracts are even further isolated in the network given that they record data that are immutable. Any update to their state records a new transaction cumulatively records the updated state. This is known and also creates a historical trail for later review and audit. There's no problem is this process expect it's not possible to update the smart contract code itself.

*I've always believe learning by example is best.* Let's take a look at the usage of `ownerOf` from `IERC721` interface and how it's used to check token ownership for any NFT.

First we import via openzepplin package or you can write your own packaged contract `import "@openzeppelin/contracts/token/ERC721/ERC721.sol"` . Or if you really want to write your own `ERC721` contract, start with importing the interface `IERC721` to your contract: `import "./IERC721.sol"` .

The `IERC721.sol` contains the function definition:

```solidity
function ownerOf(uint256 tokenId) external view returns (address owner);
```

And in `ERC721.sol` you can find the first override for it as such:

```solidity
function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "ERC721: invalid token ID");
        return owner;
}
```

The function in itself is pretty straightforward. It takes `tokenId` as input and returns the owner address.  

To understand this further, it's all stored in a mapping:

```solidity
mapping(uint256 => address) private _owners;
```

Anyway, regardless of the implementation, this is industry standard at the moment. If in case you'd want to add some conditions or enhance this function in your own contract, you'd need to override this further.

## Overriden

Say we want to check for temporary ownership, like a rental ownership, which is time bound. We can not edit the original mapping of course. There's 2 ways:

1. We add a separate mapping only for the mapping of `tokenId` and `owner` to a `timestamp`.
    
2. We ignore `_owners` mapping and write our own mapping replacing it. We'll go with this option cause adding and reading from multiple memory storages will be costlier than having a rogue mapping lying around.
    

Let's call our new mapping as `_ownership`:

```solidity
struct Owner { 
   address account;
   uint256 expiry;
}
mapping(uint256 => Owner) private _ownership;
```

Now, we can map the ownership in this accordingly. But we also need to override our `ownerOf` function:

```solidity
function ownerOf(uint256 tokenId) public view virtual override returns (address, expiry) {
        Owner _owner = _ownership(tokenId);
        require(_owner.account != address(0), "ERC721: invalid token ID");
        require(_owner.expiry > block.timestamp, "Ownership Expired. No current owner found.");
        return _owner.account;
}
```

Here, we're doing a few things. First, we're checking if the owner account exists and expiry is anytime beyond current block timestamp.

Great, now our existing function `ownerOf` can serve as the modified version of the existing owner check. So, all the clients can now call this new function of contract and get timestamp enabled ownership check.

However, here's where things get interesting...

# Imported Smart Contracts

The problem in above way is that we would need to burn all tokens from old smart contract and re-mint in new one in order for them to enable `expiry` in ownership. Which would lead to losing all history of the said tokens. So, how do we deal with this?

Solidity supports importing another smart contract and referring to the functions of it as we established above. We usually use it to extend functionality. For example, we want to add a function to our previous contract which checks `ownerOf` and rewards a certain amount to them. So, we first need to define it:

```solidity
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// other code bits

IERC20 token;

// ...

token = IERC20(token_address);
```

Now, in above, `token` represents our token from previous contract which is imported based on `token_address`. So, we should be able to do something like `token.ownerOf(tokenId)` to get the owner of `tokenId` as shown above. Once we get it, let's say we want to do something like `owner_address.send(value)` where value is in base token of the chain. This is the most commonly used way to use an external contract. But what would happen if you're to extend an existing function of original contract?

Let's take our previous example. We want to add `expiry` to `ownerOf`. So, we write a new smart contract and a new function to check ownership. Cause we can't override a function of a different contract. We've a new function which can have same name even. But for the sake of sanity, let's use a different name, `newOwner()` and it looks something like:

```solidity


contract RentContract {
    struct Owner { 
       address account;
       uint256 expiry;
    }
    mapping(uint256 => Owner) private _ownership;
    
    function newOwner(uint256 tokenId, address _to, uint256 _expiry) external virtual {
        _ownership[tokenId].account = _to;
        _ownership[tokenId].expiry = _expiry;
    }
    // ...
}
```

So, what's happening here is overloading (*not really since we're using a different name for the function. But from a standard perspective, let's assume it's the same*) which means we've defined a second function and mapping to do the exact same thing which is already been done in previous contract where it's been imported from. This obviously is a waste of memory on-chain but let's leave that concern for later. So, now, we've a second contract, `RentContract` which has temporary ownership function which we can use. However, what about the client apps which is already pointed to the old contract? The token ownership does not show any changes regardless to whoever else it's rented out via the `RentContract` .

![](/blog/images/posts/a3be6cb7-aa15-476d-8a38-ae3f0221cc0b.png)

# Shared State

Here's where the concept of Shared State comes in. Here's to proposing a shared state system which allows to update the state of original contract if the same state is being dealt with on an extended contract.

![](/blog/images/posts/bffb53f4-4995-4805-8594-7ba7ef188782.png)

So, once this new system is in place, we should be able to reflect the updated state back to our original state thereby retaining backwards compatibility as well as history.

![](/blog/images/posts/ed02d225-3be2-4736-8cf2-03d45f839c88.png)

This is the next evolution in smart contract standards which will help with better backwards compatible DApps and protocols.

*LFG*
