import os
import sys
from pathlib import Path
import uvicorn

# Ensure the backend directory is always in sys.path regardless of execution root
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Change current working directory to backend
try:
    os.chdir(str(backend_dir))
except Exception as e:
    print(f"Notice: Could not chdir to {backend_dir}: {e}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting DOCS SHIELD FastAPI backend on port {port} [app_dir={backend_dir}]...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        proxy_headers=True,
        forwarded_allow_ips="*",
        app_dir=str(backend_dir),
    )
