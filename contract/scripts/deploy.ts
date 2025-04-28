import "@nomicfoundation/hardhat-verify";
import { artifacts, ethers, run } from "hardhat";

// Optional: If using TypeChain bindings, import them like this:
// import { BlockPass as BlockPassType } from "../typechain-types";

const BlockPass = artifacts.require("BlockPass");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contracts with account:", deployer.address);

  const args: any[] = [];

  const blockPass = await BlockPass.new(...args);
  console.log("✅ BlockPass deployed to:", blockPass.address);

  // ✅ Contract Verification
  try {
    const result = await run("verify:verify", {
      address: blockPass.address,
      constructorArguments: args,
    });
    console.log("🔍 Verification process completed!");
  } catch (e: any) {
    console.error("⚠️ Verification error:", e.message);
  }

  console.log("🏁 Final deployed address:", blockPass.address);

}

main().then(() => process.exit(0)).catch((err) => {
  console.error("Unhandled Error:", err);
  process.exit(1);
});
