import sqlite3
import os
import json

# Pointing to your LIVE hard-drive location
MESH_ROOT = r"C:\\InfinityMesh"
DB_PATH = os.path.join(MESH_ROOT, "memory", "state", "memory.db")
LOG_PATH = os.path.join(MESH_ROOT, "logs", "router.log")

def get_mesh_status(target, params):
    """
    Reads the real-time heartbeat from the InfinityMesh SQLite DB.
    """
    if not os.path.exists(DB_PATH):
        return {"status": "error", "message": "InfinityMesh DB not found on host."}

    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT MAX(ts) FROM heartbeat")
        last_heartbeat = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM audit")
        audit_count = c.fetchone()[0]
        conn.close()
        
        return {
            "system": "InfinityMesh Supervisor",
            "status": "ONLINE",
            "last_heartbeat": last_heartbeat,
            "audit_events": audit_count,
            "location": MESH_ROOT
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def tail_mesh_logs(target, params):
    """
    Returns the last N lines of the InfinityMesh router log.
    """
    lines = 10
    if not os.path.exists(LOG_PATH):
        return {"error": "Log file not found"}
        
    try:
        with open(LOG_PATH, "r") as f:
            # Simple tail implementation
            all_lines = f.readlines()
            last_n = all_lines[-lines:]
            
        return {"logs": [json.loads(l) for l in last_n if l.strip()]}
    except Exception as e:
        return {"error": str(e)}

def register():
    return {
        "mesh_status": get_mesh_status,
        "mesh_logs": tail_mesh_logs
    }
