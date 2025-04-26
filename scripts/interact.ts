import hre from "hardhat";
const ethers = hre.ethers;
import dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "0x919CEacE3cFd45a640ece1B676916fB2Bc48E60e";

async function main() {
  const [deployer] = await ethers.getSigners();
  const BlockPassFactory = await ethers.getContractFactory("BlockPass");
  const contract = await BlockPassFactory.attach(CONTRACT_ADDRESS);

  console.log("🔗 Connected to contract at:", contract.address);

  
const passPriceUSD = ethers.parseUnits("0.01", 18); // same as 0.01 FLR in wei
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

    const requiredPrice = await contract.convertUsdToWei(passPriceUSD);
    console.log("💰 Required price in wei:", requiredPrice.toString());

    const pass = await contract.passes(passId);
    console.log("🎟️ Pass info:", pass);

    const purchaseTx = await contract.purchasePass(passId, {
      value: requiredPrice,
    });
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
