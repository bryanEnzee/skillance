"""
Test ROFL Authentication
Script to test the roflEnsureAuthorizedOrigin implementation
"""

import asyncio
import json
from fastapi.testclient import TestClient
from app import app

def test_rofl_authentication():
    """Test ROFL authentication endpoints"""
    
    client = TestClient(app)
    
    print("Testing ROFL Authentication Implementation")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    response = client.get("/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test 2: ROFL info
    print("\n2. Testing ROFL info...")
    response = client.get("/rofl-info")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test 3: Authenticated request (with proper headers)
    print("\n3. Testing authenticated ROFL request...")
    headers = {
        "X-ROFL-Origin": "oasis1qz88379wfzvs2nug7f5jl08ap9hmuyvj9g57f5vk",
        "Content-Type": "application/json"
    }
    
    data = {
        "user": "test_user",
        "question": "How does ROFL work?",
        "answer": "ROFL uses roflEnsureAuthorizedOrigin for authentication"
    }
    
    response = client.post("/store", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test 4: Unauthenticated request (missing headers)
    print("\n4. Testing unauthenticated request...")
    response = client.post("/store", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Test 5: Public endpoint (no auth required)
    print("\n5. Testing public endpoint...")
    response = client.post("/store-public", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test 6: Unauthorized origin
    print("\n6. Testing unauthorized origin...")
    bad_headers = {
        "X-ROFL-Origin": "oasis1unauthorized_address_here",
        "Content-Type": "application/json"
    }
    
    response = client.post("/store", json=data, headers=bad_headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_rofl_authentication()
