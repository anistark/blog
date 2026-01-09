---
layout: post
title: Shared State Package
excerpt: So, changing the state in memory would need access however way we look at it. So, either we propose for a core change with memory pointers or we handle it on smart contract layer with additional memory.
date: 2021-01-01
updatedDate: 2021-01-01
featuredImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1716507798641/a78b6b5f-ecda-4305-8b14-f0f0ee10b981.png
tags:
  - post
---

*If you feel like how did I endup in this hot mess, make sure to go back to reading the* [*Part 1*](https://blog.anirudha.dev/on-chain-shared-state)*, where we started cooking what appears so far to be a mess...*

So, changing the state in memory would need access however way we look at it. So, either we propose for a core change with memory pointers or we handle it on smart contract layer with additional memory. Not ideal, but faster to get done. And here's starts the journey of [DripVerse Protocol](https://dripverse.org/) as well.

# New Contracts

For new contracts it's straightforward. Just add our package to your contract and you're good to go. For existing contracts, it gets complicated, which we'll revisit later. Let's talk about the solution for new contracts...

We've our own package which adds a few methods to the smart contract, allowing it to override certains methods and state memory so that we can map from other places and back. Let's take the example of `ownerOf` method. This takes a tokenId and tells us which address is the owner of the token. Now if an external contract is pointing to it, it wouldn't know but our injected modified version of `ownerOf` knows for sure. So, when **SC2** `ownerOf` is called, it makes changes to **SC1** `ownerOf` with expiry time attached to it.

But wait, how does a method get updated on an immutable chain?  
Of course, we don't change the method. We simply point to a different direction.

## Storage

Smart Contracts specially on EVM has quite a big storage allocated.

> There are 3 different types of memory in EVM: memory, calldata, and storage. **Storage** is the only one which is long term. Each contract gets its own storage area which is a persistent, read-write memory area. Contract’s can only read and write from their own storage. A contract’s storage is divided up into 2²⁵⁶ slots of 32 bytes each. Slots are contiguous and are referenced by indexes, starting at 0 and ending at 2²⁵⁶. All slots are initialized to a value of 0.
> 
> EVM storage memory is only directly accessible by these 32 byte slots.
> 
> 2²⁵⁶ slots!

Read more about Storage Memory [here](https://docs.alchemy.com/docs/smart-contract-storage-layout).

*What we want to understand more is how state variables are stored in these slots.*

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1716559534564/4727411d-c375-4a94-b600-2fbf5a8f6cea.jpeg align="center")

> Here we can see how variables a, b and c get mapped from their declaration order to their storage slots.

We need to do is figure out a way to take these variables and point to a new slot. However that's not supported by blockchain. So, we'll need to on contract level.

...

# Querying

Querying is rather straightforward and uses solidity modifiers. Think of modifiers as similar to decorators. They lets us wrap additional functionality to a method. Typically used to make sure that certain conditions are met before proceeding with the method logic. For example we've `isOwner` modifier used as :

```solidity
modifier isOwner() {
   if (msg.sender != owner) {
        throw;
    }

    _; // continue executing rest of method body
}

doSomething() isOwner {
  // will first check if caller is owner

  // code
}
```

We can even stack multiple modifiers together:

```solidity
enum State { Created, Locked, Inactive }

modifier isState(State _state) {
    require(state == _state);

    _; // run rest of code
}

modifier cleanUp() {
    _; // finish running rest of method body

    // clean up code
}

doSomething() isOwner isState(State.Created) cleanUp {
  // code
}
```

Now, we'll use the same concept of overidding on modifiers. So, we're going to overide `isOwner` modifier with something like:

```solidity
contract BaseContract {
    modifier isOwner {
        require(msg.sender == owner);
        _;
    }
}

contract MyContract is BaseContract {
    // override the onlyOwner modifier
    modifier isOwner {
        require(msg.sender == dripOwner(msg.sender));
        _;
    }
}
```

Just imagine `dripOwner` being a modified version of owner check which also checks for your additional conditions.

So, now we're able to attach a functionality to our existing NFT without having to burn it or copy paste unnecessarily past data.
