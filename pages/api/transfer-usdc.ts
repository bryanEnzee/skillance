// pages/api/transfer-usdc.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { ethers } from "ethers"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  try {
    const { address } = req.body
    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Missing or invalid `address`" })
    }

    // load your env
    const rpcUrl       = process.env.ARBITRUM_SEPOLIA_RPC_URL!
    const paymentKey   = process.env.PAYMENT_PRIVATE_KEY!
    const usdcContract = process.env.USDC_CONTRACT_ADDRESS!

    if (!rpcUrl || !paymentKey || !usdcContract) {
      return res
        .status(500)
        .json({ error: "RPC_URL / PAYMENT_PRIVATE_KEY / USDC_CONTRACT_ADDRESS must be set" })
    }

    // Node.js provider uses native http/https under the hood
    const provider = new ethers.providers.StaticJsonRpcProvider(
      rpcUrl,
      { name: "arbitrumSepolia", chainId: 421614 }
    )
    const wallet = new ethers.Wallet(paymentKey, provider)
    const usdc   = new ethers.Contract(
      usdcContract,
      ["function transfer(address to, uint256 amount) returns (bool)"],
      wallet
    )

    // send 0.1 USDC
    const amount = ethers.utils.parseUnits("0.1", 6)
    const tx     = await usdc.transfer(address, amount)
    await tx.wait()

    return res.status(200).json({ txHash: tx.hash })
  } catch (err: any) {
    console.error("Transfer error:", err)
    return res.status(500).json({ error: err.message || "Unknown error" })
  }
}
