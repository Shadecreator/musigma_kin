import requests
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../backend/.env"))
api_key = os.environ.get("ANTHROPIC_API_KEY")

url = "https://open.bigmodel.cn/api/paas/v4/models"
headers = {
    "Authorization": f"Bearer {api_key}"
}

response = requests.get(url, headers=headers)
if response.status_code == 200:
    print(response.json())
else:
    print(f"Error: {response.status_code}")
    print(response.text)
