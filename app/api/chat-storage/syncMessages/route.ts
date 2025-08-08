// Updated implementation for MentorChatStorage contract

import { NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"
import ChatStorageABI from "@/src/abis/ChatStorage.json"

const PRIVATE_KEY = process.env.PRIVATE_KEY!
const RPC_URL = process.env.SAPPHIRE_URL || "https://testnet.sapphire.oasis.io"
const CHAT_STORAGE_ADDRESS = process.env.NEXT_PUBLIC_CHAT_STORAGE_ADDRESS!

// Custom RPC client using fetch
class CustomRPCProvider {
    private rpcUrl: string
    private requestId: number = 1

    constructor(rpcUrl: string) {
        this.rpcUrl = rpcUrl
    }

    async call(method: string, params: any[] = []): Promise<any> {
        try {
            const response = await fetch(this.rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method,
                    params,
                    id: this.requestId++
                })
            })

            if (!response.ok) {
                throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            if (data.error) {
                console.error(`RPC Error for ${method}:`, data.error)
                throw new Error(`RPC error: ${data.error.message} (code: ${data.error.code})`)
            }

            return data.result
        } catch (error) {
            console.error(`RPC call failed for ${method}:`, error)
            throw error
        }
    }

    async getBlockNumber(): Promise<number> {
        const result = await this.call('eth_blockNumber')
        return parseInt(result, 16)
    }

    async getChainId(): Promise<number> {
        const result = await this.call('eth_chainId')
        return parseInt(result, 16)
    }

    async sendTransaction(signedTx: string): Promise<string> {
        return await this.call('eth_sendRawTransaction', [signedTx])
    }

    async getTransactionReceipt(txHash: string): Promise<any> {
        return await this.call('eth_getTransactionReceipt', [txHash])
    }

    async getTransactionCount(address: string): Promise<number> {
        const result = await this.call('eth_getTransactionCount', [address, 'latest'])
        return parseInt(result, 16)
    }

    async estimateGas(transaction: any): Promise<string> {
        return await this.call('eth_estimateGas', [transaction])
    }

    async getGasPrice(): Promise<string> {
        return await this.call('eth_gasPrice')
    }

    async getBalance(address: string): Promise<string> {
        return await this.call('eth_getBalance', [address, 'latest'])
    }

    async callContract(to: string, data: string): Promise<string> {
        return await this.call('eth_call', [{ to, data }, 'latest'])
    }
}

// Function to debug the MentorChatStorage contract
async function debugMentorChatContract(
    rpcProvider: CustomRPCProvider,
    contractInterface: ethers.utils.Interface,
    walletAddress: string,
    chatRoomId: number,
    content: string,
    isFromMentor: boolean = false
): Promise<any> {
    const results: any = {}
    
    try {
        // Check total chat rooms
        const chatRoomCountData = contractInterface.encodeFunctionData('chatRoomCount', [])
        const chatRoomCountResult = await rpcProvider.callContract(CHAT_STORAGE_ADDRESS, chatRoomCountData)
        const chatRoomCount = contractInterface.decodeFunctionResult('chatRoomCount', chatRoomCountResult)[0]
        results.totalChatRooms = chatRoomCount.toNumber()
        console.log(`📊 Total chat rooms: ${results.totalChatRooms}`)
        
        // Check total messages
        const messageCountData = contractInterface.encodeFunctionData('messageCount', [])
        const messageCountResult = await rpcProvider.callContract(CHAT_STORAGE_ADDRESS, messageCountData)
        const messageCount = contractInterface.decodeFunctionResult('messageCount', messageCountResult)[0]
        results.totalMessages = messageCount.toNumber()
        console.log(`💬 Total messages: ${results.totalMessages}`)
        
    } catch (error: any) {
        results.contractReadError = error.message
        console.log("❌ Could not read contract state:", error.message)
    }
    
    // Check if the chat room exists and is active
    if (chatRoomId > 0) {
        try {
            const chatRoomData = contractInterface.encodeFunctionData('chatRooms', [chatRoomId])
            const chatRoomResult = await rpcProvider.callContract(CHAT_STORAGE_ADDRESS, chatRoomData)
            const chatRoom = contractInterface.decodeFunctionResult('chatRooms', chatRoomResult)
            
            results.chatRoom = {
                bookingId: chatRoom[0].toNumber(),
                user: chatRoom[1],
                mentorId: chatRoom[2].toNumber(),
                createdAt: chatRoom[3].toNumber(),
                active: chatRoom[4]
            }
            
            console.log(`🏠 Chat room ${chatRoomId}:`, results.chatRoom)
            
            if (!results.chatRoom.active) {
                results.error = "Chat room is not active"
                return results
            }
            
        } catch (error: any) {
            results.chatRoomError = error.message
            results.error = "Chat room does not exist or cannot be read"
            console.log(`❌ Could not read chat room ${chatRoomId}:`, error.message)
            return results
        }
        
        // Check authorization
        if (!isFromMentor) {
            try {
                const authData = contractInterface.encodeFunctionData('isAuthorized', [chatRoomId, walletAddress])
                const authResult = await rpcProvider.callContract(CHAT_STORAGE_ADDRESS, authData)
                const isAuthorized = contractInterface.decodeFunctionResult('isAuthorized', authResult)[0]
                results.isAuthorized = isAuthorized
                console.log(`🔑 User ${walletAddress} authorized for chat room ${chatRoomId}: ${isAuthorized}`)
                
                if (!isAuthorized) {
                    results.error = "User is not authorized to send messages in this chat room"
                    return results
                }
                
            } catch (error: any) {
                results.authCheckError = error.message
                console.log(`❌ Could not check authorization:`, error.message)
            }
        }
    } else {
        results.error = "Invalid chat room ID"
        return results
    }
    
    // Validate message content
    if (!content || content.trim().length === 0) {
        results.error = "Message content cannot be empty"
        return results
    }
    
    return results
}

// Test GET method
export async function GET() {
    try {
        const rpcProvider = new CustomRPCProvider(RPC_URL)
        const wallet = new ethers.Wallet(PRIVATE_KEY || "0x" + "1".repeat(64))
        
        const blockNumber = await rpcProvider.getBlockNumber()
        const chainId = await rpcProvider.getChainId()
        
        let balance = "0"
        if (PRIVATE_KEY) {
            try {
                const balanceHex = await rpcProvider.getBalance(wallet.address)
                balance = ethers.utils.formatEther(balanceHex)
            } catch (e) {
                console.error("Could not fetch balance:", e)
            }
        }

        // Test contract interaction with MentorChatStorage
        let contractInfo = "N/A"
        if (CHAT_STORAGE_ADDRESS) {
            try {
                const contractInterface = new ethers.utils.Interface(ChatStorageABI)
                
                const code = await rpcProvider.call('eth_getCode', [CHAT_STORAGE_ADDRESS, 'latest'])
                const codeExists = code !== '0x' && code !== '0x0'
                
                if (codeExists) {
                    // Try to read contract state
                    const chatRoomCountData = contractInterface.encodeFunctionData('chatRoomCount', [])
                    const result = await rpcProvider.callContract(CHAT_STORAGE_ADDRESS, chatRoomCountData)
                    const chatRoomCount = contractInterface.decodeFunctionResult('chatRoomCount', result)[0]
                    
                    contractInfo = `MentorChatStorage - Chat rooms: ${chatRoomCount.toNumber()}`
                } else {
                    contractInfo = "No contract code found"
                }
            } catch (e: any) {
                contractInfo = `Error: ${e.message}`
            }
        }

        return NextResponse.json({ 
            message: "MentorChat Sync API is working!",
            contractType: "MentorChatStorage",
            rpcUrl: RPC_URL,
            hasPrivateKey: !!PRIVATE_KEY,
            hasContractAddress: !!CHAT_STORAGE_ADDRESS,
            walletAddress: PRIVATE_KEY ? wallet.address : "N/A",
            walletBalance: `${balance} ETH`,
            contractInfo,
            chainId,
            blockNumber,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        return NextResponse.json({ 
            message: "MentorChat Sync API connection test failed",
            error: error.message,
            rpcUrl: RPC_URL,
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}

// POST implementation for MentorChatStorage
export async function POST(req: NextRequest) {
    try {
        console.log("🔄 Starting MentorChat message sync...")
        
        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: "PRIVATE_KEY not set" }, { status: 500 })
        }
        
        if (!CHAT_STORAGE_ADDRESS) {
            return NextResponse.json({ error: "CHAT_STORAGE_ADDRESS not set" }, { status: 500 })
        }

        const body = await req.json()
        const messages = body.messages

        console.log("📦 Received messages:", messages?.length || 0)

        if (!Array.isArray(messages)) {
            return NextResponse.json({ error: "'messages' must be an array." }, { status: 400 })
        }

        // Validate message format for MentorChatStorage
        for (const msg of messages) {
            if (!msg.chatRoomId || typeof msg.chatRoomId !== 'number') {
                return NextResponse.json({ 
                    error: "Each message must have a valid chatRoomId (number)" 
                }, { status: 400 })
            }
            if (!msg.content || typeof msg.content !== 'string') {
                return NextResponse.json({ 
                    error: "Each message must have valid content (string)" 
                }, { status: 400 })
            }
            // isFromMentor is optional, defaults to false
        }

        const rpcProvider = new CustomRPCProvider(RPC_URL)
        
        const blockNumber = await rpcProvider.getBlockNumber()
        const chainId = await rpcProvider.getChainId()
        console.log(`✅ Connected to chain ${chainId}, block: ${blockNumber}`)

        const wallet = new ethers.Wallet(PRIVATE_KEY)
        console.log("👛 Wallet address:", wallet.address)

        const balanceHex = await rpcProvider.getBalance(wallet.address)
        const balance = ethers.utils.formatEther(balanceHex)
        console.log(`💰 Wallet balance: ${balance} ETH`)

        if (parseFloat(balance) < 0.01) {
            return NextResponse.json({ 
                error: "Insufficient balance for gas fees",
                walletAddress: wallet.address,
                balance: `${balance} ETH`,
                minimumRequired: "0.01 ETH"
            }, { status: 400 })
        }

        const contractInterface = new ethers.utils.Interface(ChatStorageABI)

        // Test contract accessibility
        try {
            console.log("🔍 Testing MentorChatStorage contract...")
            const code = await rpcProvider.call('eth_getCode', [CHAT_STORAGE_ADDRESS, 'latest'])
            if (code === '0x' || code === '0x0') {
                throw new Error("No contract code found at address")
            }
            console.log(`✅ Contract exists with code length: ${code.length}`)
            
        } catch (contractError: any) {
            console.error("❌ Contract accessibility test failed:", contractError.message)
            return NextResponse.json({ 
                error: "Contract not accessible",
                contractAddress: CHAT_STORAGE_ADDRESS,
                details: contractError.message
            }, { status: 400 })
        }

        const txHashes: string[] = []
        const errors: string[] = []
        const debugInfo: any[] = []

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i]
            const { chatRoomId, content, isFromMentor = false } = msg
            
            console.log(`📦 Processing message ${i + 1}/${messages.length} for chat room ${chatRoomId}`)

            try {
                // Debug the message before sending
                const debug = await debugMentorChatContract(
                    rpcProvider, 
                    contractInterface, 
                    wallet.address, 
                    chatRoomId, 
                    content, 
                    isFromMentor
                )
                
                if (debug.error) {
                    console.log("❌ Message validation failed:", debug.error)
                    errors.push(`Message ${i + 1}: ${debug.error}`)
                    debugInfo.push({ messageIndex: i, ...debug })
                    continue
                }
                
                // Encode sendMessage function call
                const data = contractInterface.encodeFunctionData('sendMessage', [
                    chatRoomId,
                    content,
                    isFromMentor
                ])
                
                const nonce = await rpcProvider.getTransactionCount(wallet.address)
                const gasPrice = await rpcProvider.getGasPrice()
                
                console.log(`📋 Nonce: ${nonce}, Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`)
                
                // Gas estimation
                let gasLimit = 150000 // Default for message sending
                
                try {
                    const gasEstimate = await rpcProvider.estimateGas({
                        to: CHAT_STORAGE_ADDRESS,
                        data,
                        from: wallet.address,
                        value: '0x0'
                    })
                    const estimatedGas = parseInt(gasEstimate, 16)
                    gasLimit = Math.floor(estimatedGas * 1.2) // 20% buffer
                    console.log(`⛽ Estimated gas: ${estimatedGas}, using: ${gasLimit}`)
                } catch (gasError: any) {
                    console.log(`⚠️ Gas estimation failed: ${gasError.message}`)
                    
                    if (gasError.message.includes('revert')) {
                        const reason = gasError.message.includes('Not authorized') ? 
                            "User not authorized for this chat room" :
                            gasError.message.includes('Chat room not active') ?
                            "Chat room is not active" :
                            "Contract execution would revert"
                        
                        errors.push(`Message ${i + 1}: ${reason}`)
                        debugInfo.push({ messageIndex: i, gasError: gasError.message, ...debug })
                        continue
                    }
                    
                    // Use higher fallback gas
                    gasLimit = 200000
                    console.log(`🔧 Using fallback gas: ${gasLimit}`)
                }
                
                // Prepare transaction
                const transaction = {
                    to: CHAT_STORAGE_ADDRESS,
                    data,
                    nonce,
                    gasPrice,
                    gasLimit,
                    chainId,
                    value: '0x0',
                    type: 0
                }

                console.log(`📤 Sending transaction for chat room ${chatRoomId}`)

                const signedTx = await wallet.signTransaction(transaction)
                const txHash = await rpcProvider.sendTransaction(signedTx)
                console.log("✅ Transaction sent:", txHash)
                
                // Wait for confirmation
                let receipt = null
                let attempts = 0
                const maxAttempts = 60
                
                while (!receipt && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    try {
                        receipt = await rpcProvider.getTransactionReceipt(txHash)
                    } catch (receiptError) {
                        // Receipt might not be available immediately
                    }
                    attempts++
                    
                    if (attempts % 15 === 0) {
                        console.log(`⏳ Waiting for transaction ${txHash}... (${attempts}s)`)
                    }
                }
                
                if (receipt) {
                    if (receipt.status === "0x1") {
                        const gasUsed = parseInt(receipt.gasUsed, 16)
                        console.log(`✅ Message sent to chat room ${chatRoomId}: ${txHash} (Gas: ${gasUsed})`)
                        txHashes.push(txHash)
                    } else {
                        console.log("❌ Transaction failed:", txHash)
                        console.log("📋 Receipt:", JSON.stringify(receipt, null, 2))
                        
                        errors.push(`Message ${i + 1}: Transaction reverted - ${txHash}`)
                        txHashes.push(`FAILED: ${txHash}`)
                        
                        debugInfo.push({
                            messageIndex: i,
                            txHash,
                            receipt,
                            gasUsed: parseInt(receipt.gasUsed, 16),
                            ...debug
                        })
                    }
                } else {
                    console.log("⚠️ Transaction timeout:", txHash)
                    errors.push(`Message ${i + 1}: Transaction timeout - ${txHash}`)
                    txHashes.push(`TIMEOUT: ${txHash}`)
                }
                
            } catch (txError: any) {
                console.error(`❌ Transaction error for message ${i + 1}:`, txError)
                errors.push(`Message ${i + 1}: ${txError.message}`)
                txHashes.push(`ERROR: ${txError.message}`)
            }

            // Delay between transactions
            if (i < messages.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000))
            }
        }

        const successCount = txHashes.filter(tx => 
            !tx.startsWith('ERROR') && !tx.startsWith('FAILED') && !tx.startsWith('TIMEOUT')
        ).length

        const response: any = { 
            status: successCount > 0 ? "partial_success" : "failed", 
            txs: txHashes,
            errors,
            totalMessages: messages.length,
            successfulTxs: successCount,
            failedTxs: messages.length - successCount,
            walletBalance: `${balance} ETH`,
            contractType: "MentorChatStorage"
        }

        if (debugInfo.length > 0) {
            response.debugInfo = debugInfo
        }

        return NextResponse.json(response, { 
            status: successCount > 0 ? 200 : 400 
        })
        
    } catch (error: any) {
        console.error("❌ Sync failed:", error)
        
        return NextResponse.json({ 
            error: error.message || "Unknown error",
            code: error.code || "MENTOR_CHAT_ERROR",
            suggestion: "Ensure you're using the correct message format: { chatRoomId: number, content: string, isFromMentor?: boolean }",
            contractType: "MentorChatStorage",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 })
    }
}