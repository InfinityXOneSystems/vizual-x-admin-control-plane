import os
import importlib.util
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Registry for plugins
# Format: { "action_name": function_reference }
PLUGIN_REGISTRY = {}

class Command(BaseModel):
    action: str
    target: str = None
    params: dict = {}

def load_plugins():
    """Dynamically load python scripts from the plugins/ directory"""
    plugin_dir = os.path.join(os.path.dirname(__file__), "plugins")
    if not os.path.exists(plugin_dir):
        os.makedirs(plugin_dir)
        print(f"Created plugin directory at {plugin_dir}")
        return

    for filename in os.listdir(plugin_dir):
        if filename.endswith("_plugin.py"):
            module_name = filename[:-3]
            file_path = os.path.join(plugin_dir, filename)
            
            try:
                spec = importlib.util.spec_from_file_location(module_name, file_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                # Check if module has a register() function
                if hasattr(module, "register"):
                    commands = module.register()
                    PLUGIN_REGISTRY.update(commands)
                    print(f"Loaded plugin: {module_name} ({len(commands)} commands)")
            except Exception as e:
                print(f"Failed to load plugin {filename}: {e}")

@app.on_event("startup")
async def startup_event():
    print("Booting Infinity Orchestrator...")
    load_plugins()
    print(f"System Online. Registered Commands: {list(PLUGIN_REGISTRY.keys())}")

@app.get("/")
def health_check():
    return {
        "status": "online", 
        "system": "Infinity Orchestrator", 
        "loaded_plugins": len(PLUGIN_REGISTRY)
    }

@app.post("/execute")
def execute_command(cmd: Command):
    """
    Executes a command registered by a plugin.
    """
    if cmd.action not in PLUGIN_REGISTRY:
        return {"status": "ignored", "message": f"Command '{cmd.action}' not found."}
    
    try:
        # Execute the registered function
        handler = PLUGIN_REGISTRY[cmd.action]
        result = handler(cmd.target, cmd.params)
        return {"status": "success", "data": result}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
