import { ethers } from "ethers";

async function walletConnectFcn() {
	console.log(`\n=======================================`);

	// ETHERS PROVIDER
	const provider = new ethers.BrowserProvider(window.ethereum, "any");

	console.log(`- Switching network to the Flare Testnet Coston2...🟠`);
	// let chainId;
	// if (network === "testnet") {
	// 	chainId = "0x128";
	// } else if (network === "previewnet") {
	// 	chainId = "0x129";
	// } else {
	// 	chainId = "0x127";
	// }

	await window.ethereum.request({
		method: "wallet_addEthereumChain",
		params: [
			{
				chainName: `Flare Testnet Coston2`,
				chainId: "0x72",
				nativeCurrency: { name: "C2FLR", symbol: "C2FLR", decimals: 18 },
				rpcUrls: [`https://coston2-api.flare.network/ext/C/rpc`],
				blockExplorerUrls: [`https://coston2.testnet.flarescan.com/`],
			},
		],
	});
	console.log("- Switched ✅");

	// CONNECT TO ACCOUNT
	console.log("- Connecting wallet...🟠");
	let selectedAccount;
	await provider
		.send("eth_requestAccounts", [])
		.then((accounts) => {
			selectedAccount = accounts[0];
			console.log(`- Selected account: ${selectedAccount} ✅`);
		})
		.catch((connectError) => {
			console.log(`- ${connectError.message.toString()}`);
			return;
		});

	return [selectedAccount, provider];
}

export default walletConnectFcn;