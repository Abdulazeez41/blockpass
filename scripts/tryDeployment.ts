import "@nomicfoundation/hardhat-verify";
import { artifacts, ethers, run } from 'hardhat';
import { SimpleFtsoExampleContract } from '../typechain-types';
const SimpleFtsoExample: SimpleFtsoExampleContract = artifacts.require('SimpleFtsoExample');


async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const args: any[] = []
    const simpleFtsoExample = await SimpleFtsoExample.new(...args);
    console.log("SimpleFtsoExample deployed to:", simpleFtsoExample.address);
    try {

        const result = await run("verify:verify", {
            address: simpleFtsoExample.address,
            constructorArguments: args,
        })

        console.log(result)
    } catch (e: any) {
        console.log(e.message)
    }
    console.log("Deployed contract at:", simpleFtsoExample.address)

    const result = await simpleFtsoExample.getTokenPriceInUSDWei("FLR/USD");
    const priceFLR = result[0];
    const timestampFLR = result[1];

    console.log("FLR/USD price in wei:", priceFLR.toString());
    console.log("Timestamp:", timestampFLR.toString());


    const result2 = await simpleFtsoExample.getCurrentTokenPriceWithDecimals("FLR/USD");
    const priceRaw = result2[0];
    const decimals = result2[1];

    console.log("Raw FLR/USD price:", priceRaw.toString());
    console.log("Decimals:", decimals.toString());


    const result3 = await simpleFtsoExample.isPriceRatioHigherThan("FLR/USD", "BTC/USD", 1, 100000);
    const p1 = result3[0];
    const p2 = result3[1];
    const higher = result3[2];

    console.log("FLR/USD:", p1.toString());
    console.log("BTC/USD:", p2.toString());
    console.log("Is price ratio FLR/BTC > 1/100000 ?", higher);



}
main().then(() => process.exit(0))