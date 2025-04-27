# BlockPass Smart Contract

## Overview

**BlockPass** is a smart contract designed to sell **NFT tickets** for events, allowing organizers to issue limited-edition passes that grant access to exclusive events or services. The contract features **dynamic pricing** based on **Flare FTSO price feeds**, **random giveaways**, and the possibility for **early bird discounts**. Users can purchase tickets with **FLR** or any supported **ERC20 token**, and the contract handles **ticket issuance** (NFTs) along with **organizer payouts**.

## Features

- **NFT Tickets**: Sell event tickets as ERC721 tokens (NFTs).
- **Dynamic Pricing**: Ticket prices are dynamically adjusted based on **Flare FTSO price feeds**.
- **Volatility Adjustments**: Ticket prices are reduced by 10% if market volatility exceeds a defined threshold.
- **Random Giveaways**: Bonus perks (like extra privileges) are awarded to lucky buyers through random selection.
- **Event Management**: Organizers can create and manage ticket sales for their events.
- **Security Features**: Includes only-owner functions for critical settings and functions like volatility threshold.

---

## Contract Structure

### 1. **Creating an Event (Pass)**

An event (pass) can be created by any organizer. The event will specify:

- **Price**: The ticket price in USD.
- **Start and End Time**: When the sale starts and ends.
- **Category**: The type of event (e.g., concert, sports, etc.)
- **Max Passes**: The maximum number of tickets available for purchase.

Example:

```solidity
createNewPass(
    50,               // Ticket price in USD
    block.timestamp + 1 days,   // Start time (1 day from now)
    block.timestamp + 30 days,  // End time (30 days from now)
    "Music",          // Event category
    500               // Max number of tickets
);
```

---

### 2. **Purchasing a Pass**

To purchase a pass, the user must call the `purchasePass()` function with the pass ID. The contract calculates the price dynamically, adjusting for market volatility and applying discounts if needed. The contract ensures that the user is within the event's sale window.

Example:

```solidity
purchasePass(0);  // Purchase the first event pass (ID 0)
```

The contract will:

1. Check if the current time is within the event's start and end time.
2. Calculate the ticket price, applying any volatility discount if applicable.
3. Mint the ticket as an NFT and transfer it to the buyer.
4. Transfer the payment to the organizer (90% of the ticket price).
5. Randomly award bonus perks to a lucky buyer.

---

### 3. **Volatility Adjustment**

The contract uses Flare's **FTSO** to fetch the **FLR/USD** price and adjusts ticket prices based on market volatility. If the volatility exceeds 10%, a **10% discount** is applied to the ticket price.

The **volatility threshold** can be adjusted by the contract owner.

---

### 4. **Random Giveaways**

The contract includes a **randomness mechanism** for awarding bonus perks to users who purchase tickets. This randomness can be based on **block timestamp**, **block number**, or external sources like **Flare’s secure Random Number Generator**.

Example:

```solidity
_isWinner() returns (true or false);
```

---

## Functions

### `createNewPass(uint256 passPriceUSD, uint256 start_time, uint256 end_time, string memory category, uint256 max_passes)`

Creates a new event pass. Organizers can specify the ticket price, start time, end time, category, and max number of tickets.

### `purchasePass(uint256 _blockPassId)`

Allows users to purchase an event pass. The function checks the price, applies any discounts, mints the NFT ticket, and transfers the payment.

### `convertUsdToFLRWei(uint256 usdAmount)`

Converts a USD value into FLR (in wei), using the latest **Flare FTSO** price feed for USD/FLR conversion.

### `setVolatilityThreshold(uint256 _threshold)`

Sets the volatility threshold (in percentage). If the price of FLR fluctuates more than this threshold, ticket prices are discounted.

### `getByCategory(string memory category)`

Returns all event passes that belong to the specified category.

---

## Example Use Cases

### Event Ticketing with Dynamic Pricing

Imagine an event organizer selling tickets for a concert. Depending on the market conditions (e.g., the price of FLR or USD), the ticket price might fluctuate, offering discounts to users during periods of market volatility. Users can also receive random bonus perks, such as access to exclusive content or early entry to the event, based on the randomness logic.

### Early Bird Discounts

Tickets are priced dynamically, and early buyers are rewarded with discounts, ensuring higher sales during the initial period of an event’s ticket sale.

---

## Example Workflow

### 1. **Organizer Creates Event**

An event organizer calls `createNewPass()` to create an event with a ticket price in USD, start/end time, category, and max number of tickets.

### 2. **Buyer Purchases Pass**

A user calls `purchasePass()` to buy a ticket. The price is adjusted dynamically based on **Flare FTSO** data and market volatility.

### 3. **Ticket Minting & Bonus**

After a successful purchase, the contract:

- Mints an **NFT ticket**.
- Assigns it to the buyer's wallet.
- Transfers 90% of the ticket price to the organizer's wallet.
- Randomly gives bonus perks to lucky buyers.

### 4. **Volatility-Based Discounts**

If the volatility is high (price fluctuations exceed 10%), the ticket price is automatically discounted by 10%.

---

## Future Enhancements

- **Multi-token Support**: Add support for purchasing tickets using other tokens like USDT, USDC, etc.
- **Enhanced Metadata**: Include additional ticket metadata, such as seat number, VIP status, etc.
- **Cross-Chain Support**: Expanding the contract to support multiple blockchains for ticket purchasing and minting (e.g., Ethereum, Binance Smart Chain).
- **Advanced Analytics**: Implementing detailed analytics on sales trends, discounts applied, and user behavior.
- **Customizable Pricing Models**: Allowing event organizers to set more advanced pricing models, such as tiered pricing or loyalty-based discounts.
- **Gas Optimization**: Further optimizing the contract to reduce gas costs, especially for functions that involve dynamic price calculations and randomness.

---

## Conclusion

**BlockPass** is a unique and innovative smart contract that brings gamified NFT ticketing and dynamic pricing to the blockchain. By leveraging real-time market data, randomness for bonuses, and transparency through NFT metadata, BlockPass creates an engaging experience for both event organizers and attendees.

## Deployed Address

- [Blockpass Address](https://coston2-explorer.flare.network/address/0x98f15D065849BFe28bbD0AF4Fef19A3A6A81FdBE#code)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### How to Contribute

If you'd like to contribute, please fork the repo and submit a pull request. We appreciate your feedback and suggestions!

---
