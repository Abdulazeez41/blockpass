import hre from "hardhat";
const ethers = hre.ethers;
import dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "0xf47c98abA1a4c4eB778991AeE7Ea889a977fEA3E";

async function main() {
  const [deployer] = await ethers.getSigners();
  const BlockPassFactory = await ethers.getContractFactory("BlockPass");
  const contract = BlockPassFactory.attach(CONTRACT_ADDRESS);
  let weiPrice: any;

  console.log("🔗 Connected to contract at:", contract.target);

  // Debugging: Log the deployer's address
  console.log("👤 Deployer address:", deployer.address);

  // Debugging: Log the contract address
  console.log("📜 Contract address:", CONTRACT_ADDRESS);

  // Debugging: Log the feed ID before purchase
  const feedId = await contract.flrUsdConversion();
  console.log("FLR/USD Feed ID:", feedId);

  // Debugging: Log the USD amount being converted
  const passPriceUSD = 1; 
  console.log("💵 USD amount to convert:", passPriceUSD);

// Listen for the USDInWei event
contract.on("USDInWei", (priceInWei: any) => {
  console.log("📢 USDInWei event emitted! Price in Wei:", priceInWei.toString());
  weiPrice = priceInWei
});

// Call the convertUsdToFLRWei function
const requiredPrice = await contract.convertUsdToFLRWei(passPriceUSD);
await requiredPrice.wait();

  const maxSupply = 100;
  const startTime = Math.floor(Date.now() / 1000) + 10;
  const endTime = startTime + 86400;
  const category = "Music";

  const tx = await contract.createNewPass(
    passPriceUSD,
    startTime,
    endTime,
    category,
    maxSupply
  );

  await tx.wait();
  console.log("🎟️ Block pass created!");

  console.log("⏳ Waiting 15s for sales to start...");
  await new Promise((res) => setTimeout(res, 15000));

  const passId = 0;
  try {
    const block = await ethers.provider.getBlock("latest");
    console.log("📅 Current block timestamp:", block.timestamp);
    console.log("🚀 Pass sale start time:", startTime);

    // === 4. Pay and purchase pass
    const purchaseTx = await contract.purchasePass(passId, { value: weiPrice });
    const receipt = await purchaseTx.wait();
    console.log("✅ Pass purchased! Tx hash:", receipt.transactionHash);

  } catch (error: any) {
    console.error("❌ Purchase failed:", error);
  }

  // Test the feed ID and price using the test interface
  try {
    const feedName = "FLR/USD";
    const [priceInWei, finalizedTimestamp] = await contract.testFeedIdAndPrice(feedName);
    console.log(`🧪 Test Feed ID and Price: ${feedName}`);
    console.log(`💰 Price in Wei: ${priceInWei.toString()}`);
    console.log(`📅 Finalized Timestamp: ${finalizedTimestamp}`);
  } catch (error: any) {
    console.error("❌ Test Feed ID and Price failed:", error);
  }
}


main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});

//check why is volatality is returning error (it needs a pair)
//try to call the functions separately and emit an event (or use test interface)
