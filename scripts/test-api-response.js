// Save as test-api-response.js and run with: node test-api-response.js

const testMessages = [
    {
        chatRoomId: "test-room-1",
        content: "Hello test message"
    }
];

async function testAPI() {
    try {
        console.log("🧪 Testing sync API response format...");
        
        const response = await fetch('http://localhost:3000/api/chat-storage/syncMessages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: testMessages
            })
        });

        console.log("📊 Response Status:", response.status);
        console.log("📊 Response Headers:", Object.fromEntries(response.headers.entries()));
        
        // Get response as text first to see raw content
        const responseText = await response.text();
        console.log("📄 Raw Response Text:", responseText);
        
        // Try to parse as JSON
        try {
            const jsonData = JSON.parse(responseText);
            console.log("✅ Parsed JSON:", jsonData);
        } catch (parseError) {
            console.error("❌ JSON Parse Error:", parseError.message);
            console.log("🔍 Response might not be valid JSON");
        }
        
    } catch (error) {
        console.error("❌ Network Error:", error.message);
    }
}

testAPI();