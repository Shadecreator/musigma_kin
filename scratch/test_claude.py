import os
import sys
from dotenv import load_dotenv

from pathlib import Path

# Robustly find the project root (one level up from this script)
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.append(str(root_dir))

from backend.services.claude_client import test_connection

load_dotenv(os.path.join(os.path.dirname(__file__), "../backend/.env"))
api_key = os.environ.get("ANTHROPIC_API_KEY")
print(f"API Key starts with: {api_key[:10] if api_key else 'None'}...")

models_to_test = ["claude-sonnet-4-6"]

import anthropic
client = anthropic.Anthropic(api_key=api_key)

for model in models_to_test:
    print(f"Testing model: {model}...")
    try:
        response = client.messages.create(
            model=model,
            max_tokens=1024,
            messages=[
                {"role": "user", "content": "Say 'ok'."}
            ]
        )
        print(f"Success! {model}: {response.content[0].text}")
        break
    except Exception as e:
        print(f"Failed {model}: {str(e)}")
    print("-" * 20)
