"""
ROFL Authentication Module
Handles roflEnsureAuthorizedOrigin subcall integration
"""

import json
import hashlib
import base64
from typing import Dict, Any, Optional
from datetime import datetime

class ROFLAuth:
    """ROFL Authentication handler using roflEnsureAuthorizedOrigin"""
    
    def __init__(self, app_id: str):
        self.app_id = app_id
        self.subcall_module = "rofl"
        
    def create_auth_headers(self, origin: str, data: Dict[Any, Any]) -> Dict[str, str]:
        """Create authentication headers for ROFL requests"""
        timestamp = int(datetime.utcnow().timestamp())
        
        # Create payload for signing
        payload = {
            "app_id": self.app_id,
            "origin": origin,
            "timestamp": timestamp,
            "data": data
        }
        
        # Create signature (in production, this would use actual ROFL subcalls)
        signature = self._create_signature(payload)
        
        return {
            "X-ROFL-Origin": origin,
            "X-ROFL-Signature": signature,
            "X-ROFL-Timestamp": str(timestamp),
            "X-ROFL-App-ID": self.app_id,
            "Content-Type": "application/json"
        }
    
    def _create_signature(self, payload: Dict[Any, Any]) -> str:
        """Create ROFL signature (simplified for demo)"""
        # In production, this would use:
        # oasis.subcall("rofl", "ensureAuthorizedOrigin", payload)
        
        payload_str = json.dumps(payload, sort_keys=True)
        signature_hash = hashlib.sha256(payload_str.encode()).digest()
        return base64.b64encode(signature_hash).decode()
    
    def verify_authorized_origin(self, origin: str, signature: str, data: Dict[Any, Any]) -> bool:
        """Verify origin using roflEnsureAuthorizedOrigin subcall"""
        try:
            # In production ROFL, this would be:
            # result = oasis.subcall("rofl", "ensureAuthorizedOrigin", {
            #     "origin": origin,
            #     "signature": signature,
            #     "data": data
            # })
            # return result["authorized"]
            
            # For demo, we'll do basic validation
            expected_sig = self._create_signature({
                "app_id": self.app_id,
                "origin": origin,
                "data": data
            })
            
            return signature == expected_sig
            
        except Exception as e:
            print(f"ROFL origin verification failed: {e}")
            return False

class ROFLSubcalls:
    """ROFL Subcall interface for Oasis runtime"""
    
    @staticmethod
    def ensure_authorized_origin(origin: str, app_id: str) -> Dict[str, Any]:
        """
        Simulate roflEnsureAuthorizedOrigin subcall
        In production, this would be handled by the Oasis runtime
        """
        # This is where the actual subcall would happen:
        # oasis.subcall("rofl", "ensureAuthorizedOrigin", {
        #     "origin": origin,
        #     "app_id": app_id
        # })
        
        return {
            "authorized": True,  # Would come from runtime
            "origin": origin,
            "app_id": app_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def get_rofl_identity() -> Dict[str, Any]:
        """Get ROFL app identity from runtime"""
        # In production: oasis.subcall("rofl", "getIdentity")
        return {
            "app_id": "rofl1qpuexjnfplvvwzdcm9vajanphs8mfzp9sqw9yz87",
            "node_id": "1owPK3eT21k0ajRG7VfHRgp4JPXobCQtzuglz6ZSJis=",
            "enclave_id": "EmZmEyPSO+GuZrhy2J/4CujH3a1GEz2JXOJ460ZX44Y="
        }

# Example usage
if __name__ == "__main__":
    # Initialize ROFL auth
    rofl_auth = ROFLAuth("rofl1qpuexjnfplvvwzdcm9vajanphs8mfzp9sqw9yz87")
    
    # Create test data
    test_data = {
        "user": "test_user",
        "question": "What is ROFL?",
        "answer": "Runtime OFfLoad framework"
    }
    
    # Create auth headers
    origin = "oasis1qz88379wfzvs2nug7f5jl08ap9hmuyvj9g57f5vk"
    headers = rofl_auth.create_auth_headers(origin, test_data)
    
    print("ROFL Auth Headers:")
    for key, value in headers.items():
        print(f"  {key}: {value}")
