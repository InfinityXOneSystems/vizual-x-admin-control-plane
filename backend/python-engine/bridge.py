from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import os

app = FastAPI()

class Command(BaseModel):
    action: str
    target: str = None
    params: dict = {}

@app.get("/")
def health_check():
    return {"status": "online", "system": "Infinity Orchestrator"}

@app.post("/execute")
def execute_command(cmd: Command):
    """
    Receives commands from the Visual Admin Control Plane
    and executes them via the Orchestrator logic.
    """
    try:
        # Example: Triggering a refactor or scan
        if cmd.action == "scan_inventory":
            # Call your orchestrator logic here
            return {"status": "success", "message": f"Scanning inventory for {cmd.target}"}
        
        elif cmd.action == "deploy_agent":
            return {"status": "success", "message": f"Deploying agent to {cmd.target}"}
            
        else:
            return {"status": "ignored", "message": "Unknown command"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
