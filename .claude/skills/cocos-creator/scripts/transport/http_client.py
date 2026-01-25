"""
HTTP Client for Cocos Creator Editor

Handles HTTP communication with the Cocos Creator HTTP Tool Server.
"""

import json
import os
import urllib.request
import urllib.error
from typing import Any, Optional


class CocosHttpClient:
    """HTTP client for Cocos Creator tool server."""
    
    def __init__(self, host: str = "127.0.0.1", port: Optional[int] = None):
        self.host = host
        self.port = port or self._detect_port()
        self.base_url = f"http://{self.host}:{self.port}"
        self.timeout = 30  # seconds
    
    def _detect_port(self) -> int:
        """Auto-detect port from Cocos project config."""
        # Try to find .cocos-mcp-config.json in current directory or parent directories
        config_name = ".cocos-mcp-config.json"
        search_dir = os.getcwd()
        
        for _ in range(10):  # Max 10 levels up
            config_path = os.path.join(search_dir, config_name)
            if os.path.exists(config_path):
                try:
                    with open(config_path, 'r', encoding='utf-8') as f:
                        config = json.load(f)
                        return config.get("port", 3000)
                except (json.JSONDecodeError, IOError):
                    pass
            
            parent = os.path.dirname(search_dir)
            if parent == search_dir:
                break
            search_dir = parent
        
        # Default port
        return 3000
    
    def _request(self, method: str, path: str, data: Optional[dict] = None) -> Any:
        """Make HTTP request to the server."""
        url = f"{self.base_url}{path}"
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        body = None
        if data is not None:
            body = json.dumps(data).encode('utf-8')
        
        req = urllib.request.Request(
            url,
            data=body,
            headers=headers,
            method=method
        )
        
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                response_data = response.read().decode('utf-8')
                if response_data:
                    return json.loads(response_data)
                return None
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                error_data = json.loads(error_body)
                raise Exception(f"HTTP {e.code}: {error_data.get('error', error_body)}")
            except json.JSONDecodeError:
                raise Exception(f"HTTP {e.code}: {error_body}")
        except urllib.error.URLError as e:
            raise Exception(f"Connection error: {e.reason}. Is Cocos Creator running with the extension?")
    
    def get(self, path: str) -> Any:
        """Make GET request."""
        return self._request("GET", path)
    
    def post(self, path: str, data: Optional[dict] = None) -> Any:
        """Make POST request."""
        return self._request("POST", path, data or {})
    
    def health_check(self) -> bool:
        """Check if server is running."""
        try:
            result = self.get("/cocos/health")
            return result.get("status") == "ok"
        except Exception:
            return False
