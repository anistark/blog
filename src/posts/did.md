---
layout: post
title: Decentralised Identity
excerpt: As the digital world transitions to Web3, decentralisation promises to redefine how we interact online securely, privately, and without intermediaries. At the heart of this revolution lies **Decentralised Identity (DID)**, a technology aimed at giving users complete control over their identity and interactions in the decentralised ecosystem.
date: 2025-01-19
updatedDate: 2025-01-19
featuredImage: /blog/images/posts/62593f5c-4e4c-4d60-98fb-c6840ba30a54.png
tags:
  - post
  - identity
  - web3
  - decentralization
  - did
---

As the digital world transitions to Web3, decentralisation promises to redefine how we interact online securely, privately, and without intermediaries. At the heart of this revolution lies **Decentralised Identity (DID)**, a technology aimed at giving users complete control over their identity and interactions in the decentralised ecosystem. Let’s explore the world of DIDs and the impact it can have on our day-to-day life.

In the Web2 paradigm, identity is centralised. Platforms like Google, Facebook, and Apple dominate authentication and identity management. A typical Web2 authentication flow involves:

1. **User Credential Storage:** Users create accounts on each platform, storing sensitive information like passwords and personal data.
    
2. **Centralised Control:** Platforms manage, validate, and store user identities, often sharing data with third parties.
    
3. **Security and Privacy Risks:** These centralised models are prone to breaches, data misuse, and lack transparency.
    

This fragmented and insecure approach calls for a shift toward a decentralised and user-controlled identity system.

# **What is DID?**

DID is a self-sovereign identity system that allows users to create and control their identity without relying on centralised entities. A DID is a unique identifier tied to a cryptographic key, resolving to a DID Document stored on decentralised networks.

![](https://www.w3.org/TR/did-core/diagrams/parts-of-a-did.svg)

For example:

* A DID might look like `did:ethr:0x1234...abcd`.
    
* It is portable, privacy-preserving, and interoperable across platforms and chains.
    

![](/blog/images/posts/1adfb744-0c51-4627-8344-af0edcaad35b.webp)

DIDs significantly improve user experience by addressing critical pain points.

1. **Unified Identity Across Platforms:** A single DID replaces the need for multiple accounts. Users can log in to various apps using the same identity.
    
2. **Enhanced Privacy:** DIDs minimise data sharing. Users can verify their identity without exposing personal information using verifiable credentials.
    
3. **True Ownership:** Unlike centralised accounts, users own their DID, data, and assets.
    
4. **Cross-Chain Interoperability:** DIDs work seamlessly across blockchains, enabling a consistent user experience.
    
5. **Gasless Transactions:** Relayers linked to a DID can abstract gas fees, improving accessibility.
    

![](/blog/images/posts/15389678-f607-4b53-b129-42af53ee15a7.webp)

# Creating and Using a DID

Users connect their Ethereum wallet (e.g., MetaMask) to a service that registers a DID, like a smart contract-based DID Registry.

Here’s a basic smart contract for an Ethereum-based DID Registry:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DIDRegistry {
    mapping(address => string) private dids;
    event DIDRegistered(address indexed user, string did);

    function registerDID(string memory _did) public {
        require(bytes(dids[msg.sender]).length == 0, "DID already exists");
        dids[msg.sender] = _did;
        emit DIDRegistered(msg.sender, _did);
    }

    function getDID(address _user) public view returns (string memory) {
        return dids[_user];
    }
}
```

Applications resolve your DID to verify your identity and retrieve associated credentials, ensuring secure, password-free login.

Your DID’s associated data, like profile information, is stored on decentralised networks such as Ceramic or IPFS, ensuring ownership and privacy.

Imagine a gaming app, that integrates DID for seamless user experiences:

1. **Onboarding:** Users log in with their Ethereum wallet, and the app generates their DID (`did:ethr:0x123...`).
    
2. **Cross-Platform Interactions:** Achievements earned in one game are verifiable credentials usable across other games.
    
3. **Social Features:** Users add friends via their DID or ENS name (e.g., `GamerX.eth`) and engage in encrypted chats using DIDComm.
    
4. **Gasless Play:** The app abstracts gas fees, ensuring smooth gameplay.
    

## **ENS and .eth Domains: Simplifying DID**

**Ethereum Name Service (ENS)** bridges DIDs and user-friendliness. ENS translates long wallet addresses or DIDs into readable names like `john.eth`.

* **What .eth Means:** It’s a human-readable domain linked to a DID or wallet.
    
* **How It Works:** ENS uses smart contracts to map `john.eth` to an Ethereum address, which can be further linked to a DID for interoperability.
    

## **Evolution of DIDs**

DIDs make interacting with multiple blockchains simple by providing a unified identity layer. Regardless of whether an app runs on Ethereum, Polygon, or another chain, users only need one DID.

**Example Use Case:**  
In a gaming app, a DID enables:

* Asset purchases on Ethereum.
    
* Gameplay interactions on Polygon.
    
* A unified user profile across both chains.
    

![](https://www.w3.org/TR/did-core/diagrams/did_detailed_architecture_overview.svg)

Account abstraction turns wallets into programmable entities. When paired with a DID, users gain access to features like:

* **Gasless Transactions** via relayer services.
    
* **Custom Authentication** with biometrics or social recovery.
    
* **Programmable Wallets** tied to their DID for automated actions.
    

Several active works going on in the field of DIDs:

1. **W3C Standards:** Ongoing efforts to standardise DID and Verifiable Credentials. [Read more here.](https://www.w3.org/TR/did-core/)
    
2. **Layer 2 Scaling:** Optimising DID operations with zk-Rollups and optimistic rollups.
    
3. **Social Recovery Models:** Community-based wallet recovery mechanisms tied to DIDs.
    
4. **Cross-Chain Abstraction:** Projects like Axelar and LayerZero are exploring DID integration for seamless multichain interoperability.
    

### **Challenges:**

1. **Adoption:** Many apps still rely on centralised account systems.
    
2. **Standardisation:** Consistent DID implementation across platforms and chains is essential.
    

![](/blog/images/posts/75899c94-d88d-4b11-b37b-77c66aff285f.webp)

As Web3 evolves, DIDs will play a pivotal role in bridging the gap between user experience and decentralisation. By abstracting away the complexities of blockchain interactions, DIDs empower users with control over their identities, assets, and data while enabling cross-platform interoperability.

While DID is transformative, its adoption depends on achieving a balance between technical complexity and user experience. The goal is a Web3 ecosystem where users can easily create, use, and manage their decentralised identities without worrying about the underlying technology, a future where identity is truly in the hands of the user.
