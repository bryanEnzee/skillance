import { ethers } from "ethers";
import * as dotenv from "dotenv";
import abi from "../src/abis/ChatStorage.json";

dotenv.config();

const RPC_URL = "https://testnet.sapphire.oasis.dev";
const CONTRACT_ADDRESS = "0x61DbB739d3A487311375079397A229f0C1AbcD4B";
const PRIVATE_KEY = process.env.PRIVATE_KEY2!;

async function main() {
  if (!PRIVATE_KEY) throw new Error("❌ PRIVATE_KEY2 not found in .env");

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("🔑 Using wallet:", wallet.address);

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  // Example: Store a new message (optional)
  const messageToStore = "Hello from testStoreMessage.ts";
  const tx = await contract.storeMessage(messageToStore);
  await tx.wait();
  console.log(`✅ Stored message: ${messageToStore}`);

  // Fetch messages from contract state array
  const messages = await contract.getMessages();

  console.log("\n📦 Global Chat History:");
  if (!messages || messages.length === 0) {
    console.log("No messages found.");
  } else {
    messages.forEach((msg: string, i: number) => {
      console.log(`${i + 1}. ${msg}`);
    });
  }

  // Fetch past events from logs (with transaction hashes)
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = latestBlock - 100 > 0 ? latestBlock - 100 : 0;

  const eventFilter = contract.filters.MessageStored();
  const events = await contract.queryFilter(eventFilter, fromBlock, latestBlock);

  console.log("\n📜 Chat History from Events:");
  if (events.length === 0) {
    console.log("No event logs found.");
  } else {
    events.forEach((event, i) => {
      const user = event.args?.user;
      const message = event.args?.message;
      const txHash = event.transactionHash;
      console.log(`${i + 1}. ${message} (from ${user}) | Tx: ${txHash}`);
    });
  }
}

main().catch((err) => {
  console.error("❌ Error fetching messages:", err.message);
});
