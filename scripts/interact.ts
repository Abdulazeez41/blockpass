import hre from "hardhat";
const ethers = hre.ethers;
import dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "0x73d3463Fc856e5d3826A3a1f4209Ee1D5eFC0470";

async function main() {
  const [deployer] = await ethers.getSigners();
  const BlockPassFactory = await ethers.getContractFactory("BlockPass");
  const contract = BlockPassFactory.attach(CONTRACT_ADDRESS);
  let weiPrice: any;

  console.log("🔗 Connected to contract at:", contract.target);

  // Debugging: Log the deployer's address
  console.log("👤 Deployer address:", deployer.address);

  // USD price of the pass
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
  const requiredPrice = await contract._convertUsdToFLRWei(passPriceUSD);
  console.log("📢 Required Price:", requiredPrice.toString());

  const maxSupply = 100;
  const metadata = "https://example.com/metadata.json"; //valid metadata link
  const category = "Music";
  const salesDuration = 86400; // 1 day in seconds

  const tx = await contract.createNewPass(
    maxSupply,
    passPriceUSD,
    metadata,
    category,
    salesDuration
  );

  await tx.wait();
  console.log("🎟️ Block pass created!");

  console.log("⏳ Waiting 15s for sales to start...");
  await new Promise((res) => setTimeout(res, 15000));

  const passId = 0;
  try {
    const block = await ethers.provider.getBlock("latest");
    console.log("📅 Current block timestamp:", block.timestamp);

    // Purchase the pass
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
