import requests

def scan_repositories(target, params):
    """
    Scans GitHub repositories for the user.
    """
    username = target or "InfinityXOneSystems"
    url = f"https://api.github.com/users/{username}/repos"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        repos = response.json()
        
        # Simplify data for the dashboard
        inventory = [
            {"name": r["name"], "url": r["html_url"], "stars": r["stargazers_count"]}
            for r in repos
        ]
        return {"count": len(inventory), "repos": inventory}
    except Exception as e:
        return {"error": str(e)}

def register():
    """
    Returns a dict of commands this plugin handles.
    Key = Action Name (used by Frontend)
    Value = Function to call
    """
    return {
        "scan_inventory": scan_repositories
    }
