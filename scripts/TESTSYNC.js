// Save as test-rpc.js and run with: node test-rpc.js
// ES Module version - no ethers dependency needed for basic RPC testing

const RPC_URLS = [
    "https://testnet.sapphire.oasis.io",
    "https://sapphire-testnet.oasiscloud.io",
    "https://rpc.ankr.com/eth_sepolia", // Ethereum Sepolia as fallback
];

async function testRPCs() {
    console.log("🧪 Testing RPC connections with HTTP requests...\n");
    
    for (const rpcUrl of RPC_URLS) {
        try {
            console.log(`🔄 Testing: ${rpcUrl}`);
            
            const start = Date.now();
            
            // Test basic connectivity
            const response = await fetch(rpcUrl, {
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
            });
            
            const duration = Date.now() - start;
            
            if (response.ok) {
                const data = await response.json();
                if (data.result) {
                    const blockNumber = parseInt(data.result, 16);
                    console.log(`✅ SUCCESS: Block ${blockNumber} - ${duration}ms`);
                    
                    // Test network info
                    const networkResponse = await fetch(rpcUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: "2.0",
                            method: "eth_chainId",
                            params: [],
                            id: 2
                        })
                    });
                    
                    if (networkResponse.ok) {
                        const networkData = await networkResponse.json();
                        const chainId = parseInt(networkData.result, 16);
                        console.log(`   📊 Chain ID: ${chainId}\n`);
                    }
                } else {
                    console.log(`❌ Invalid response: ${JSON.stringify(data)}\n`);
                }
            } else {
                console.log(`❌ HTTP FAILED: ${response.status} ${response.statusText}\n`);
            }
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}\n`);
        }
    }
}

async function main() {
    await testRPCs();
}

main().catch(console.error);