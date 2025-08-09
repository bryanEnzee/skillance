"""
ROFL Client Example
Shows how to properly authenticate and send requests to ROFL app
"""

import requests
import json
from rofl_auth import ROFLAuth

class ROFLClient:
    """Client for making authenticated requests to ROFL apps"""
    
    def __init__(self, rofl_endpoint: str, app_id: str, origin: str):
        self.endpoint = rofl_endpoint
        self.auth = ROFLAuth(app_id)
        self.origin = origin
    
    def store_chat_log(self, user: str, question: str, answer: str) -> dict:
        """Store chat log with ROFL authentication"""
        
        # Prepare data
        data = {
            "user": user,
            "question": question,
            "answer": answer
        }
        
        # Create authenticated headers
        headers = self.auth.create_auth_headers(self.origin, data)
        
        # Make request
        try:
            response = requests.post(
                f"{self.endpoint}/store",
                json=data,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "error": f"Request failed: {response.status_code}",
                    "detail": response.text
                }
                
        except Exception as e:
            return {"error": f"Connection failed: {str(e)}"}
    
    def health_check(self) -> dict:
        """Check ROFL app health"""
        try:
            response = requests.get(f"{self.endpoint}/health", timeout=10)
            return response.json()
        except Exception as e:
            return {"error": f"Health check failed: {str(e)}"}

# Example usage
if __name__ == "__main__":
    # ROFL app configuration
    ROFL_ENDPOINT = "https://your-rofl-app-endpoint.com"  # Replace with actual endpoint
    APP_ID = "rofl1qpuexjnfplvvwzdcm9vajanphs8mfzp9sqw9yz87"
    ORIGIN = "oasis1qz88379wfzvs2nug7f5jl08ap9hmuyvj9g57f5vk"  # Your admin address
    
    # Initialize client
    client = ROFLClient(ROFL_ENDPOINT, APP_ID, ORIGIN)
    
    # Test health check
    print("Health Check:")
    health = client.health_check()
    print(json.dumps(health, indent=2))
    
    # Store a chat log
    print("\nStoring chat log:")
    result = client.store_chat_log(
        user="alice",
        question="How does ROFL authentication work?",
        answer="ROFL uses roflEnsureAuthorizedOrigin to verify transaction origins"
    )
    print(json.dumps(result, indent=2))
