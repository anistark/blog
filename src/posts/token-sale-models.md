---
layout: post
title: Token Sale Models
excerpt: "Launching a crypto project comes with one big question: **How do you sell your tokens?** Token sales are the lifeblood of most blockchain projects, fueling development, building communities, and driving adoption. But picking the right sales model isn't just about raising funds."
date: 2025-01-03
updatedDate: 2025-01-03
featuredImage: /images/posts/8e77d541-ff2e-4d7f-a9bb-a64f1e3ef88d.png
tags:
  - post
  - algorithms
  - crypto
  - cryptocurrency
  - web3
  - token-sale
---

Launching a crypto project comes with one big question: **How do you sell your tokens?** Token sales are the lifeblood of most blockchain projects, fueling development, building communities, and driving adoption. But picking the right sales model isn’t just about raising funds. It’s about fairness, accessibility, and strategy.

From simple "buy it now" pricing to dynamic auctions and even gamified lotteries, there’s a token sale model for every project. In this article, we’ll explore the most popular token sale mechanisms, breaking down how they work, their pros and cons, and even the math behind them. Whether you're an investor curious about how tokens are distributed or a founder choosing the best method for your launch, this guide has you covered.

Let’s dive in and decode the world of token sale models!

## **Fixed Price Sale**

You set a fixed price, and participants buy tokens at that price. It’s like buying groceries. Simple and predictable. Makes it easy for participants to calculate costs. Tokens are sold at a pre-determined price, and participants can purchase as many as they want within their limits. Many token offerings use this model. For instance, **Filecoin's presale** was based on a fixed price.

$$Total Cost = Price Per Token × Number Of Tokens Purchased$$

The cost is directly proportional to the number of tokens purchased. If the price is constant (e.g., $1 per token), buying 10 tokens costs $10. So, if the token price is **0.01 ETH** and you buy 100 tokens:

$$Total Cost=0.01×100=1 ETH$$

Here’s a smart contract snippet for a fixed price sale in Solidity:

```solidity
uint256 public constant PRICE = 0.01 ether;
uint256 public constant MAX_TOKENS = 1000000;
uint256 public tokensSold;

function buyTokens(uint256 amount) public payable {
    require(msg.value == amount * PRICE, "Incorrect ETH amount");
    require(tokensSold + amount <= MAX_TOKENS, "Not enough tokens left");
    tokensSold += amount;
    // Transfer tokens to buyer
}
```

It’s a decent model except it can lead to oversubscription or under-subscription. The risk of unequal distribution.

## Dutch Auction

The price starts high and gradually decreases until participants are willing to buy, or a reserve price is met. Think of it like a reverse eBay. **Ethereum's initial sale in 2015** used a Dutch auction, where early buyers paid a higher price. It encourages fair market price discovery and prevents "first-come-first-serve" unfairness.

$$PriceT =Start Price−(\tfrac{Start Price−End Price}{Duration} ×t)$$

The price starts high and decreases linearly over time. At any point `t`, the price depends on how much time has passed relative to the total auction duration.

So, if the Start Price was 1 ETH, end price = 0.1 ETH, duration = 10 hours. At t=5 hours:

$$Price=1−(\tfrac{1−0.1}{10} ×5)=0.55ETH$$

Here’s a solidity implementation of a Dutch auction:

```solidity
uint256 public startTime = block.timestamp;
uint256 public startPrice = 1 ether;
uint256 public endPrice = 0.1 ether;
uint256 public duration = 7 days;

function getPrice() public view returns (uint256) {
    uint256 elapsedTime = block.timestamp - startTime;
    if (elapsedTime >= duration) return endPrice;
    return startPrice - ((startPrice - endPrice) * elapsedTime) / duration;
}
```

It does require participants to monitor prices closely can can be little complex for newcomers.

## English Auction

Participants bid for tokens, with the highest bidder receiving them. Think of Sotheby’s, but for tokens. One of the most simple auction model. It ensures maximum revenue and the tokens fo to those valuing them the most. **Polkadot’s DOT token sale** used a modified English auction format.

$$Winning Bid=max(Bids)$$

So, if bids are 1 ETH, 1.5 ETH, and 2 ETH, the winning bid is:

$$max⁡(1,1.5,2)=2 ETH$$

Fairly straightforward to determine as well as implement:

```solidity
struct Bid {
    address bidder;
    uint256 amount;
}

Bid[] public bids;

function placeBid() public payable {
    bids.push(Bid(msg.sender, msg.value));
}

function getHighestBid() public view returns (Bid memory) {
    Bid memory highest;
    for (uint256 i = 0; i < bids.length; i++) {
        if (bids[i].amount > highest.amount) {
            highest = bids[i];
        }
    }
    return highest;
}
```

Of course, it’s highly susceptible to bidding wars and might prove to be high barrier for small investors.

## Lottery Sale

Participants enter a lottery, and winners are chosen to purchase tokens at a fixed price. It’s a bit like a raffle. The random allocation ensures fairness and prevents whales from dominating the sale. Binance Launchpad uses lottery-based sales for projects like **WinkLink**.

$$Probability Of Winning= \tfrac{Tickets Purchased By User}{Total Tickets} ​$$

The more tickets you hold, the higher your chances of winning, but it’s still random. So, if you buy 5 tickets in a pool of 100 tickets:

$$Probability=\tfrac{5}{100}=5\%$$

We all understand basic concept of lottery, so this is also a fairly simple implementation:

```solidity
address[] public participants;

function enterLottery() public {
    participants.push(msg.sender);
}

function pickWinner() public onlyOwner {
    uint256 winnerIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % participants.length;
    address winner = participants[winnerIndex];
    // Allocate tokens to winner
}
```

Although, in this case, some participants might feel excluded and there’s no guarantee of allocation.

## First-Come-First-Serve (FCFS)

Tokens are allocated to participants in the order of their purchases until the supply is exhausted. Think of Black Friday deals. Simple to implement and understand. Motivates early participation which is huge positive for new projects. The **ICO of Brave (BAT)** saw early participants snapping up tokens in seconds.

$$Tokens Allocated=min(Tokens Requested,Tokens Available)$$

You can only buy as many tokens as are left when it’s your turn. Early participants get the most tokens. So, if 1,000 tokens are available and a participant requests 500 tokens:

$$Tokens Allocated=min(500,1000)=500$$

```solidity
function buyTokens() public payable {
    require(tokensSold < MAX_TOKENS, "Sold out");
    tokensSold++;
    // Transfer tokens
}
```

However, this might create server overload or congestion. May disadvantage slower participants or participants with slower validators or network coverage.

## Bonding Curve

The price of tokens increases dynamically based on demand, typically governed by a mathematical curve. t's like buying concert tickets. The more demand, the higher the price. **Uniswap’s liquidity pools** use bonding curves to set token prices dynamically. It incentivises early participation and ensures continuous price discovery. (My personal favourite too if implemented properly.)

$$Price=Base Price+k×Supply^n$$

Where:

* *k* is a scaling factor,
    
* *n* determines the curve's steepness,
    
* Supply is the number of tokens sold so far.
    

As more tokens are sold, the price increases exponentially or quadratically. Let’s say for `Base price = 0.01 ETH`, `k=0.001`, `n=2`, and `100` tokens sold:

$$Price=0.01+0.001×100^2=1.01 ETH$$

```solidity
function getPrice(uint256 supply) public pure returns (uint256) {
    return BASE_PRICE + (supply ** 2) / CURVE_FACTOR;
}
```

Although there’s quite a strong foundation, It might get complex for users to understand. The early adopters may gain disproportionate advantages as well, which arguably is justified to an extent.

## Tiered Sale

Tokens are sold in phases, with each tier having different prices and conditions. It encourages early participation by offering discounts and has a predictable structure. **Polkastarter** often runs tiered sales where early buyers get discounts.

Different tiers have fixed prices. The tier you’re in determines the price you pay. So, if **Tier 1** price is `0.01 ETH` and **Tier 2** price is `0.02 ETH`, buying during Tier 1 costs:

$$Price=0.01×Tokens Purchased$$

```solidity
uint256[] public tiers = [0.01 ether, 0.02 ether, 0.03 ether];
uint256 public currentTier;

function buyTokens() public payable {
    require(msg.value == tiers[currentTier], "Incorrect price");
    currentTier++;
    // Transfer tokens
}
```

Simple model. While later participants may feel penalized, the early tiers can be dominated by whales.

## Batch Auction

All bids are collected in a batch, and the clearing price is determined to allocate tokens to participants proportionally. **Gnosis Protocol** uses batch auctions for price discovery.

$$Clearing Price = \tfrac{Total Funds Committed}{Total Tokens Available}$$

All bids are pooled together. The clearing price is determined by dividing the total funds by the tokens available. If `10 ETH` is committed for 1,000 tokens:

$$Clearing Price=\tfrac{10}{1000}=0.01 ETH$$

```solidity
uint256 public clearingPrice;

function finalizeAuction() public onlyOwner {
    // Calculate clearing price based on bids
    clearingPrice = calculateClearingPrice();
}
```

Apart from the above, there have been Hybrid Models as well which combine one or more of the above models for various factors from fairness, revenue generation, simplying terms, higher market penetration and so on.

Choosing the right token sale model is a mix of strategy, technical feasibility, and audience understanding. By aligning your model with your goals, tokenomics, and market conditions, you can ensure a successful launch that sets your Web3 project up for long-term growth.
