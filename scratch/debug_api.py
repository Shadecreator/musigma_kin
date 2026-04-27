import requests
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.environ.get("ANTHROPIC_API_KEY")

url = "https://api.anthropic.com/v1/messages"
headers = {
    "x-api-key": api_key,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
}
data = {
    "model": "claude-3-5-sonnet-20240620",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
}

print(f"Testing URL: {url}")
response = requests.post(url, headers=headers, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
