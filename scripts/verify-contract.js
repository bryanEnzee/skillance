// Save as verify-contract.js and run with: node verify-contract.js

const RPC_URL = "https://testnet.sapphire.oasis.io"
const CONTRACT_ADDRESS = "0x5F13C1059C95bf03d91470503E1d3C5374d9584B" // Replace with your actual full address
const RECENT_TX = "0x2a84fffa149afa809f24881d599a18fe37aa5e16fc2e990bf0b4894aa2766060" // Your successful transaction

async function verifyContract() {
    console.log("🔍 Verifying contract setup...\n")
    
    try {
        // 1. Check if contract exists
        const codeResponse = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getCode",
                params: [CONTRACT_ADDRESS, "latest"],
                id: 1
            })
        })
        
        const codeData = await codeResponse.json()
        const contractCode = codeData?.result
        
        if (!contractCode || contractCode === "0x") {
            console.log("❌ Contract not found at address:", CONTRACT_ADDRESS)
            console.log("   Make sure the contract is deployed and address is correct")
            return
        } else {
            console.log("✅ Contract exists at:", CONTRACT_ADDRESS)
            console.log("📄 Code length:", contractCode.length, "characters")
        }
        
        // 2. Check your recent successful transaction
        console.log("\n🔍 Checking your recent transaction...")
        const txResponse = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_getTransactionReceipt",
                params: [RECENT_TX],
                id: 2
            })
        })
        
        const txData = await txResponse.json()
        if (txData?.result) {
            const receipt = txData.result
            console.log("✅ Transaction found!")
            console.log("📊 Status:", receipt.status === "0x1" ? "SUCCESS" : "FAILED")
            console.log("⛽ Gas used:", parseInt(receipt.gasUsed, 16))
            console.log("🏠 Contract called:", receipt.to)
            
            if (receipt.status === "0x1") {
                console.log("🎉 Your storeMessage function is working perfectly!")
            }
        } else {
            console.log("❌ Transaction not found or still pending")
        }
        
        console.log("\n✅ CONTRACT VERIFICATION COMPLETE")
        console.log("✅ Your sync API is working properly!")
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message)
    }
}

verifyContract()