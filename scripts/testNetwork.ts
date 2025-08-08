const { ethers } = require("ethers");

const RPC_URL = "https://testnet.sapphire.oasis.dev";

async function test() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const network = await provider.getNetwork();
    console.log("✅ Connected to Sapphire network:");
    console.log("Network name:", network.name);
    console.log("Chain ID:", network.chainId);
  } catch (err) {
    console.error("❌ Failed to connect:", err);
  }
}

test();
