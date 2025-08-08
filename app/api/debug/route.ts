// Replace app/api/debug/route.ts with this updated version

import { NextRequest, NextResponse } from "next/server"

export async function GET() {
    try {
        console.log("🔍 Debug endpoint called")
        
        // Check environment variables
        const privateKey = process.env.PRIVATE_KEY
        const sapphireUrl = process.env.SAPPHIRE_URL || "https://testnet.sapphire.oasis.io"
        const contractAddress = process.env.NEXT_PUBLIC_CHAT_STORAGE_ADDRESS
        
        const debug: any = {
            environment: {
                hasPrivateKey: !!privateKey,
                privateKeyLength: privateKey ? privateKey.length : 0,
                sapphireUrl,
                hasContractAddress: !!contractAddress,
                contractAddress: contractAddress ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}` : "missing"
            },
            nodeVersion: process.version,
            platform: process.platform,
            timestamp: new Date().toISOString()
        }
        
        console.log("📊 Debug info:", debug)
        
        // Test RPC connection with custom fetch-based approach
        try {
            console.log("🔄 Testing custom RPC connection...")
            
            // Test with direct fetch (we know this works from your client script)
            const response = await fetch(sapphireUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_blockNumber",
                    params: [],
                    id: 1
                }),
                // Add timeout
                signal: AbortSignal.timeout(10000)
            })

            if (response.ok) {
                const data = await response.json()
                if (data.result) {
                    const blockNumber = parseInt(data.result, 16)
                    
                    // Also test chain ID
                    const chainResponse = await fetch(sapphireUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: "2.0",
                            method: "eth_chainId",
                            params: [],
                            id: 2
                        }),
                        signal: AbortSignal.timeout(5000)
                    })
                    
                    const chainData = await chainResponse.json()
                    const chainId = chainData.result ? parseInt(chainData.result, 16) : null

                    debug.network = {
                        connected: true,
                        latestBlock: blockNumber,
                        chainId: chainId,
                        rpcUrl: sapphireUrl,
                        method: "custom-fetch",
                        status: "✅ SUCCESS - Custom fetch works!"
                    }
                    
                    console.log("✅ Custom RPC connection successful:", debug.network)
                } else {
                    throw new Error(`Invalid RPC response: ${JSON.stringify(data)}`)
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
        } catch (customError) {
            console.error("❌ Custom RPC failed:", (customError as Error).message)
            debug.network = {
                connected: false,
                error: (customError as Error).message,
                rpcUrl: sapphireUrl,
                status: "❌ FAILED - Even custom fetch doesn't work from server"
            }
        }
        
        return NextResponse.json(debug, { status: 200 })
        
    } catch (error) {
        console.error("❌ Debug endpoint error:", error)
        return NextResponse.json({ 
            error: (error as Error).message,
            stack: (error as Error).stack 
        }, { status: 500 })
    }
}