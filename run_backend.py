import os
import sys
from pathlib import Path

# Forward to backend/run.py
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    import run  # imports backend/run.py
