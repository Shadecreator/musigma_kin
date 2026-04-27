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

def extract_text_pypdf(file_path: str) -> str:
    """Fallback text extraction if Vision is not used or API fails."""
    import pypdf
    try:
        reader = pypdf.PdfReader(file_path)
        text = "\\n\\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        return text
    except Exception as e:
        return f"pypdf extraction failed: {str(e)}"
