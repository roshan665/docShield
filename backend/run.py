import os
import sys
from pathlib import Path
import uvicorn

# Ensure both backend directory and repo root are in sys.path
backend_dir = Path(__file__).resolve().parent
repo_root = backend_dir.parent

for p in [str(repo_root), str(backend_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting DocShield FastAPI backend on port {port}...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        proxy_headers=True,
        forwarded_allow_ips="*",
    )
