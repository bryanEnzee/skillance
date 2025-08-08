// pages/api/sendMessage.ts
import { ethers } from "ethers";
import ChatStorageABI from "@/src/abis/ChatStorage.json";
import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";

dotenv.config();

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHAT_STORAGE_ADDRESS!;
const PRIVATE_KEY = process.env.PRIVATE_KEY2!;
const RPC_URL = "https://testnet.sapphire.oasis.dev";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { bookingId, message } = req.body;

  if (!bookingId || !message) {
    return res.status(400).json({ error: "Missing bookingId or message" });
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ChatStorageABI, wallet);

    const tx = await contract.storeMessage(bookingId, message);
    await tx.wait();

    res.status(200).json({ success: true, txHash: tx.hash });
  } catch (err: any) {
    console.error("Message relay failed:", err);
    res.status(500).json({ error: err.message });
  }
}
