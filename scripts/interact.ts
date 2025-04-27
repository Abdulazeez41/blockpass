import hre from "hardhat";
const ethers = hre.ethers;
import dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "0x98f15D065849BFe28bbD0AF4Fef19A3A6A81FdBE";

async function main() {
  const [deployer] = await ethers.getSigners();
  const BlockPassFactory = await ethers.getContractFactory("BlockPass");
  const contract = BlockPassFactory.attach(CONTRACT_ADDRESS);
  let weiPrice: any;

  console.log("🔗 Connected to contract at:", contract.target);

  // Debugging: Log the deployer's address
  console.log("👤 Deployer address:", deployer.address);

  // Debugging: Log the USD amount being converted
  const passPriceUSD = 1;
  console.log("💵 USD amount to convert:", passPriceUSD);

  // Listen for the USDInWei event
  contract.on("USDInWei", (priceInWei: any) => {
    console.log(
      "📢 USDInWei event emitted! Price in Wei:",
      priceInWei.toString()
    );
    weiPrice = priceInWei;
  });

  // Call the convertUsdToFLRWei function
  const requiredPrice = await contract.convertUsdToFLRWei(passPriceUSD);
  console.log("📢 Required Price:", requiredPrice.toString());

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
    console.log("✅ Pass purchased! Tx hash:", receipt.hash);
  } catch (error: any) {
    console.error("❌ Purchase failed:", error);
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});