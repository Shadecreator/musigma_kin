import os
import sys
from dotenv import load_dotenv

# Add parent dir to path to import backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.claude_client import test_connection

print("Testing GLM connection...")
result = test_connection()
try:
    print(f"Result: {result}")
except UnicodeEncodeError:
    print(f"Result (encoded): {result.encode('utf-8')}")
