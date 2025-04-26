import hre from "hardhat";
const ethers = hre.ethers;
import dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "0x4fc38198a44D0a329Beb29e906666001eCFFA7F9";

async function main() {
  const [deployer] = await ethers.getSigners();
  const BlockPassFactory = await ethers.getContractFactory("BlockPass");
  const contract = BlockPassFactory.attach(CONTRACT_ADDRESS);

  console.log("🔗 Connected to contract at:", contract.target);

//const passPriceUSD = ethers.parseUnits("1", 18); // same as $1
 const passPriceUSD = 1; 
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

  const feedId = await contract.flrUsdConversion();
  console.log("FLR/USD Feed ID:", feedId);
  // === GETTERS after purchase ===
    const result = await contract.getTokenPriceInUSDWei("FLR/USD");
    const priceFLR = result[0];
    const timestampFLR = result[1];

    console.log("FLR/USD price in wei:", priceFLR.toString());
    console.log("Timestamp:", timestampFLR.toString());

  const passId = 0;
  try {
    const block = await ethers.provider.getBlock("latest");
    console.log("📅 Current block timestamp:", block.timestamp);
    console.log("🚀 Pass sale start time:", startTime);

    //const requiredPrice = await contract.convertUsdToFLRWei(passPriceUSD);
    //console.log(`💰 Required price in wei:${requiredPrice.toString()}`);

    // === 4. Pay and purchase pass
    const purchaseTx = await contract.purchasePass(passId, { value: passPriceUSD });
    const receipt = await purchaseTx.wait();
    console.log("✅ Pass purchased! Tx hash:", receipt.transactionHash);

  } catch (error: any) {
    console.error("❌ Purchase failed:", error.message || error);
  }
}


main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
