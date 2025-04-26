<<<<<<< HEAD
# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
=======
# BlockPass Smart Contract

## Overview

**BlockPass** is an advanced NFT ticketing platform built on the Ethereum blockchain that leverages dynamic pricing, gamified bonuses, and NFT metadata to offer a seamless and engaging user experience. This contract allows for the creation and sale of **block passes**, which are essentially NFT tickets, each with unique benefits, including dynamic pricing based on real-time market data (via FTSO price feeds), discounts, and random bonus perks for early bookings.

### Key Features:
- **Dynamic Pricing:** The price of block passes is adjusted based on real-time market conditions using Flare's FTSO (Flare Time Series Oracle) price feeds.
- **Gamified Giveaways:** Users have a chance to win bonus perks, such as discounts or exclusive content, based on random number generation.
- **Early Bird Discounts:** The contract applies automatic discounts for early bookings when market volatility is detected.
- **NFT Metadata:** Each BlockPass NFT contains dynamic metadata that reflects the user’s discounts, bonuses, and pricing details, providing transparency and engagement.
- **Randomness Integration:** Randomness from Flare’s RandomNumberV2Interface is used to provide fair and transparent bonus giveaways to users.
- **ERC-721 Standard:** Each block pass is an ERC-721 token, ensuring compatibility with various marketplaces and wallets.

---

## Features Breakdown

### 1. **Dynamic Pricing & Discounts**
The price of the block passes is influenced by the Flare FTSO (Flare Time Series Oracle) price feeds. If market volatility is detected (i.e., price ratios surpass a predefined threshold), discounts are applied to the pass price. This enables real-time adjustments to ticket prices, making the platform more responsive to market conditions.

- **Volatility Trigger:** If the price ratio of FLR to USD exceeds a threshold (e.g., 1.1), the contract automatically applies a discount to the ticket price.
  
### 2. **Random Giveaways (Bonus Perks)**
Using the Flare RandomNumberV2Interface, users are randomly selected for bonus perks, such as additional benefits or exclusive content. The chance of winning a bonus perk is set at 20% (1 in 5), but can be adjusted.

- **Bonus Feature:** Early bird users may receive additional perks as a result of the random number generation, making each purchase experience unique.

### 3. **NFT Metadata**
Each block pass is represented by an ERC-721 token with metadata that can be dynamically updated to reflect:
- **Discounts** applied during purchase.
- **Bonuses** won through random giveaways.
- **Price Details**: Users can view the original price and the price they paid after discounts.

This metadata can be served through IPFS or other decentralized storage solutions, making the platform fully transparent and decentralized.

### 4. **Creator and User Benefits**
- **Creators (Event Organizers):** Can set up a block pass for their event, set the price, the max number of tickets, and start and end times for ticket sales.
- **Users (Ticket Buyers):** Can purchase tickets that offer dynamic pricing based on market conditions and participate in gamified bonus events.

---

## How It Works

### Smart Contract Functions:

1. **createNewPass()**
   - Organizers can create new block passes (NFT tickets) with parameters such as the maximum number of passes, the sale start time, the sale end time, and the initial price.
   - The contract generates a unique ID for each block pass, which is stored on-chain for future reference.

2. **purchasePass()**
   - Users can purchase a block pass. The contract checks the current price, applies any applicable discounts (due to price volatility), and mints the NFT token for the user.
   - A random giveaway (bonus perk) is granted based on a 20% chance of winning, adding an element of excitement to each purchase.

3. **_generateTokenURI()**
   - After a successful purchase, the contract generates a dynamic `tokenURI` for the NFT, reflecting the user’s discount, original price, and any bonus perks they received.
   - This `tokenURI` can be used to fetch detailed metadata about the pass.

4. **isPriceRatioHigherThan()**
   - A helper function that checks whether the price ratio of two assets (e.g., FLR to USD) exceeds a given threshold. This is used to trigger price adjustments (discounts) based on market conditions.

---

## Contract Architecture

The contract is modular and well-structured to ensure easy upgrades and extendibility. Key modules include:

1. **ERC721URIStorage** - For handling the minting of NFT tokens and dynamic metadata storage.
2. **Ownable** - For controlling the contract’s ownership and access control.
3. **Flare Integration** - The contract utilizes Flare's `RandomNumberV2Interface` and `TestFtsoV2Interface` for randomness and price feed data.
4. **Event Management** - Organizers can create and manage events with associated block passes, providing a flexible solution for NFT ticketing.

---

## Example Use Cases

### Event Ticketing with Dynamic Pricing
Imagine an event organizer selling tickets for a concert. Depending on the market conditions (e.g., the price of FLR or USD), the ticket price might fluctuate, offering discounts to users during periods of market volatility. Users can also receive random bonus perks, such as access to exclusive content or early entry to the event, based on the randomness logic.

### Early Bird Discounts
Tickets are priced dynamically, and early buyers are rewarded with discounts, ensuring higher sales during the initial period of an event’s ticket sale.

---

## How to Use the Contract

### 1. Deploying the Contract
To deploy the **BlockPass** contract, you need to:
- Set up your development environment (e.g., Remix, Truffle, or Hardhat).
- Ensure you have access to Flare's network and contracts.
- Deploy the contract on the network of your choice (Ethereum, Flare, or others).

### 2. Creating a Block Pass
Once the contract is deployed, event organizers can use the `createNewPass()` function to create a block pass for their event. They need to specify:
- The maximum number of passes.
- The sale start and end time.
- The initial price.

### 3. Purchasing a Pass
Users can call the `purchasePass()` function to buy a block pass. They can pay in the native currency (e.g., ETH or FLR), and the contract will:
- Check for applicable discounts.
- Mint an NFT pass for the user.
- Generate dynamic metadata that reflects their discount, bonus perks, and pricing details.

### 4. Querying Metadata
Once a user has purchased a pass, they can view the details of their NFT via the `tokenURI()`, which will contain dynamic information, such as:
- Discount applied.
- Bonus perks won.
- The original and final price of the pass.

---

## Future Enhancements

- **Cross-Chain Support:** Expanding the contract to support multiple blockchains for ticket purchasing and minting.
- **Advanced Analytics:** Implementing detailed analytics on sales trends, discounts applied, and user behavior.
- **Customizable Pricing Models:** Allowing event organizers to set more advanced pricing models, such as tiered pricing or loyalty-based discounts.

---

## Conclusion

**BlockPass** is a unique and innovative smart contract that brings gamified NFT ticketing and dynamic pricing to the blockchain. By leveraging real-time market data, randomness for bonuses, and transparency through NFT metadata, BlockPass creates an engaging experience for both event organizers and attendees. 

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
>>>>>>> master
