#!/usr/bin/env python3
"""
Cocos Creator CLI - HTTP Client for Cocos Creator Editor Control

Usage:
    python cocos-cli.py <command> [args...]

Commands:
    context             Get editor context snapshot
    search-nodes        Search nodes by name/component/path
    query-nodes         Query node hierarchy
    create-nodes        Create nodes
    modify-nodes        Modify nodes
    query-components    Query components
    modify-components   Modify components
    current-scene       Operate current scene
    assets              Operate assets
    prefab-assets       Operate prefab assets
    node-prefab         Node-linked prefab operations
    discovery           Discovery endpoints (components, assets, assets-by-type)
    project-settings    Operate project settings
    scripts-text        Operate scripts and text
    execute-scene       Execute scene code
    editor-request      Generic editor request
    apply-gated-action  Apply gated action
    tool                Generic tool call
    health              Health check
    tools               List available tools

Examples:
    python cocos-cli.py context
    python cocos-cli.py search-nodes --name "Player*"
    python cocos-cli.py create-nodes '{"nodes": [{"type": "Empty", "name": "MyNode"}]}'
    python cocos-cli.py tool query_nodes '{"maxDepth": 3}'
"""

import argparse
import json
import sys
import os

# Add transport to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from transport.http_client import CocosHttpClient


def parse_json_arg(arg: str) -> dict:
    """Parse JSON string argument or return empty dict."""
    if not arg:
        return {}
    try:
        return json.loads(arg)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Cocos Creator CLI - Control Cocos Creator via HTTP",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        "--port", "-p",
        type=int,
        help="HTTP server port (auto-detected from config if not specified)"
    )
    parser.add_argument(
        "--host", "-H",
        default="127.0.0.1",
        help="HTTP server host (default: 127.0.0.1)"
    )
    parser.add_argument(
        "--pretty", "-P",
        action="store_true",
        help="Pretty print JSON output"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Context command
    ctx_parser = subparsers.add_parser("context", help="Get editor context")
    ctx_parser.add_argument("--summary-only", action="store_true", help="Summary mode for large scenes")
    ctx_parser.add_argument("--max-depth", type=int, default=2, help="Max hierarchy depth")
    ctx_parser.add_argument("--max-nodes", type=int, default=100, help="Max nodes to return")
    ctx_parser.add_argument("--parent-uuid", help="Query specific parent node")
    
    # Search nodes command
    search_parser = subparsers.add_parser("search-nodes", help="Search nodes")
    search_parser.add_argument("--name", help="Name pattern (supports wildcards)")
    search_parser.add_argument("--component", help="Component type filter")
    search_parser.add_argument("--path", help="Path pattern filter")
    search_parser.add_argument("--limit", type=int, default=50, help="Max results")
    search_parser.add_argument("--offset", type=int, default=0, help="Result offset")
    
    # Query nodes command
    query_nodes_parser = subparsers.add_parser("query-nodes", help="Query node hierarchy")
    query_nodes_parser.add_argument("--uuid", help="Node UUID to query")
    query_nodes_parser.add_argument("--include-properties", action="store_true")
    query_nodes_parser.add_argument("--include-components", action="store_true")
    query_nodes_parser.add_argument("--max-depth", type=int, default=2)
    
    # Create nodes command
    create_parser = subparsers.add_parser("create-nodes", help="Create nodes")
    create_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Modify nodes command
    modify_parser = subparsers.add_parser("modify-nodes", help="Modify nodes")
    modify_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Query components command
    query_comp_parser = subparsers.add_parser("query-components", help="Query components")
    query_comp_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Modify components command
    modify_comp_parser = subparsers.add_parser("modify-components", help="Modify components")
    modify_comp_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Current scene command
    scene_parser = subparsers.add_parser("current-scene", help="Operate current scene")
    scene_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Assets command
    assets_parser = subparsers.add_parser("assets", help="Operate assets")
    assets_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Prefab assets command
    prefab_parser = subparsers.add_parser("prefab-assets", help="Operate prefab assets")
    prefab_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Node prefab command
    node_prefab_parser = subparsers.add_parser("node-prefab", help="Node-linked prefab operations")
    node_prefab_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Discovery command
    discovery_parser = subparsers.add_parser("discovery", help="Discovery endpoints")
    discovery_parser.add_argument("type", choices=["components", "assets", "assets-by-type"])
    discovery_parser.add_argument("json", nargs="?", help="JSON payload for assets-by-type")
    
    # Project settings command
    settings_parser = subparsers.add_parser("project-settings", help="Operate project settings")
    settings_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Scripts text command
    scripts_parser = subparsers.add_parser("scripts-text", help="Operate scripts and text")
    scripts_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Execute scene command
    exec_parser = subparsers.add_parser("execute-scene", help="Execute scene code")
    exec_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Editor request command
    editor_parser = subparsers.add_parser("editor-request", help="Generic editor request")
    editor_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Apply gated action command
    gated_parser = subparsers.add_parser("apply-gated-action", help="Apply gated action")
    gated_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Generic tool command
    tool_parser = subparsers.add_parser("tool", help="Generic tool call")
    tool_parser.add_argument("tool_name", help="Tool name")
    tool_parser.add_argument("json", nargs="?", help="JSON payload")
    
    # Health check command
    subparsers.add_parser("health", help="Health check")
    
    # List tools command
    subparsers.add_parser("tools", help="List available tools")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Create client
    client = CocosHttpClient(host=args.host, port=args.port)
    
    try:
        result = None
        
        if args.command == "context":
            payload = {
                "summaryOnly": args.summary_only,
                "maxDepth": args.max_depth,
                "maxNodes": args.max_nodes
            }
            if args.parent_uuid:
                payload["parentUuid"] = args.parent_uuid
            result = client.post("/cocos/context", payload)
            
        elif args.command == "search-nodes":
            payload = {"limit": args.limit, "offset": args.offset}
            if args.name:
                payload["namePattern"] = args.name
            if args.component:
                payload["componentType"] = args.component
            if args.path:
                payload["pathPattern"] = args.path
            result = client.post("/cocos/search-nodes", payload)
            
        elif args.command == "query-nodes":
            payload = {
                "includeProperties": args.include_properties,
                "includeComponents": args.include_components,
                "maxDepth": args.max_depth
            }
            if args.uuid:
                payload["nodeUuid"] = args.uuid
            result = client.post("/cocos/query-nodes", payload)
            
        elif args.command == "create-nodes":
            result = client.post("/cocos/create-nodes", parse_json_arg(args.json))
            
        elif args.command == "modify-nodes":
            result = client.post("/cocos/modify-nodes", parse_json_arg(args.json))
            
        elif args.command == "query-components":
            result = client.post("/cocos/query-components", parse_json_arg(args.json))
            
        elif args.command == "modify-components":
            result = client.post("/cocos/modify-components", parse_json_arg(args.json))
            
        elif args.command == "current-scene":
            result = client.post("/cocos/current-scene", parse_json_arg(args.json))
            
        elif args.command == "assets":
            result = client.post("/cocos/assets", parse_json_arg(args.json))
            
        elif args.command == "prefab-assets":
            result = client.post("/cocos/prefab-assets", parse_json_arg(args.json))
            
        elif args.command == "node-prefab":
            result = client.post("/cocos/node-prefab", parse_json_arg(args.json))
            
        elif args.command == "discovery":
            if args.type == "components":
                result = client.get("/cocos/discovery/components")
            elif args.type == "assets":
                result = client.get("/cocos/discovery/assets")
            else:
                result = client.post("/cocos/discovery/assets-by-type", parse_json_arg(args.json))
                
        elif args.command == "project-settings":
            result = client.post("/cocos/project-settings", parse_json_arg(args.json))
            
        elif args.command == "scripts-text":
            result = client.post("/cocos/scripts-text", parse_json_arg(args.json))
            
        elif args.command == "execute-scene":
            result = client.post("/cocos/execute-scene", parse_json_arg(args.json))
            
        elif args.command == "editor-request":
            result = client.post("/cocos/editor-request", parse_json_arg(args.json))
            
        elif args.command == "apply-gated-action":
            result = client.post("/cocos/apply-gated-action", parse_json_arg(args.json))
            
        elif args.command == "tool":
            result = client.post(f"/cocos/tool/{args.tool_name}", parse_json_arg(args.json))
            
        elif args.command == "health":
            result = client.get("/cocos/health")
            
        elif args.command == "tools":
            result = client.get("/cocos/tools")
        
        # Output result
        if result is not None:
            if args.pretty:
                print(json.dumps(result, indent=2, ensure_ascii=False))
            else:
                print(json.dumps(result, ensure_ascii=False))
                
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
