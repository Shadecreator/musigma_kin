import os
from anthropic import Anthropic
import base64
from dotenv import load_dotenv

load_dotenv()

# Initialize the client. This will pick up ANTHROPIC_API_KEY from the environment.
# If it's a placeholder, API calls will fail, which is expected until a real key is provided.
client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY", "placeholder")
)

def test_connection() -> str:
    """Test the Anthropic API connection."""
    try:
        if client.api_key == "placeholder" or client.api_key == "your_api_key_here":
            return "Placeholder API key detected. Please add a valid ANTHROPIC_API_KEY to .env."
        
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=50,
            messages=[
                {"role": "user", "content": "Say 'hello'."}
            ]
        )
        return response.content[0].text
    except Exception as e:
        return f"Error: {str(e)}"

def extract_pdf_vision(base64_pdf: str, media_type: str = "application/pdf") -> str:
    """
    Send a base64 encoded PDF to Claude for vision extraction.
    Currently stubbed, awaiting real API key.
    """
    if client.api_key == "placeholder" or client.api_key == "your_api_key_here":
        return "Simulated extraction of PDF. Please add a valid ANTHROPIC_API_KEY to .env."
        
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "document",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": base64_pdf
                            }
                        },
                        {
                            "type": "text",
                            "text": "Extract all text and structure from this document."
                        }
                    ]
                }
            ]
        )
        return response.content[0].text
    except Exception as e:
        return f"Extraction failed: {str(e)}"

def call_claude_json(prompt: str, system_message: str = "You are a helpful medical assistant.") -> dict:
    """
    Send a prompt to Claude and expect a JSON response.
    Includes error handling for parsing.
    """
    import json
    
    if client.api_key == "placeholder" or client.api_key == "your_api_key_here":
        # Mock response for testing without API key
        return {"mock_response": "Add API key to see real AI analysis."}
        
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            system=system_message,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        text = response.content[0].text
        # Try to find JSON block if Claude adds preamble
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "{" in text:
            text = text[text.find("{"):text.rfind("}")+1]
            
        return json.loads(text)
    except Exception as e:
        return {"error": f"Claude call failed: {str(e)}", "raw_text": text if 'text' in locals() else None}

def extract_text_pypdf(file_path: str) -> str:
    """Fallback text extraction if Vision is not used or API fails."""
    import pypdf
    try:
        reader = pypdf.PdfReader(file_path)
        text = "\\n\\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        return text
    except Exception as e:
        return f"pypdf extraction failed: {str(e)}"
