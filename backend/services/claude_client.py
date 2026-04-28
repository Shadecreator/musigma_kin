import os
import json
import base64
from dotenv import load_dotenv
import anthropic

load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

# Initialize the Anthropic client
api_key = os.environ.get("ANTHROPIC_API_KEY", "placeholder")
client = anthropic.Anthropic(api_key=api_key)

def is_valid_key_format(key: str) -> bool:
    if key == "placeholder" or "your_sk-ant" in key:
        return False
    # Anthropic keys start with sk-ant-
    return key.startswith("sk-ant-")

def test_connection() -> str:
    """Test the Anthropic API connection."""
    try:
        if not is_valid_key_format(api_key):
            return "Invalid or placeholder API key detected in .env. Please add a real sk-ant- key."
        
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": "Say 'hello'."}
            ]
        )
        return response.content[0].text
    except Exception as e:
        return f"Error: {str(e)}"

def extract_pdf_vision(base64_pdf: str, media_type: str = "application/pdf") -> str:
    """
    Claude support for PDF vision with a pypdf fallback.
    """
    # Try Claude Vision first
    if is_valid_key_format(api_key):
        try:
            response = client.beta.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=8192,
                betas=["pdfs-2024-09-25"],
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
                                "text": "Please extract the key information from this document in a structured format."
                            }
                        ]
                    }
                ]
            )
            return response.content[0].text
        except Exception as e:
            print(f"Claude Vision failed: {str(e)}. Falling back to pypdf.")
    
    # Fallback: Save to temp file and use pypdf
    import tempfile
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(base64.b64decode(base64_pdf))
            tmp_path = tmp.name
        
        text = extract_text_pypdf(tmp_path)
        os.unlink(tmp_path)
        return text
    except Exception as e:
        return f"PDF extraction failed completely: {str(e)}"

def call_claude_json(prompt: str, system_message: str = "You are a helpful medical assistant. Always return response in valid JSON format.") -> dict:
    """
    Send a prompt to Claude and expect a JSON response.
    """
    if not is_valid_key_format(api_key):
        return {"mock_response": "Add a valid Anthropic API key to .env to see real AI analysis."}
        
    text = None
    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8192,
            system=system_message,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        text = response.content[0].text
        
        # Extract JSON block if Claude adds preamble
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        # First attempt — clean parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Second attempt — find outermost { }
        start = text.find("{")
        if start != -1:
            # Walk from end to find a valid closing brace
            for end in range(len(text) - 1, start, -1):
                if text[end] == "}":
                    candidate = text[start:end + 1]
                    try:
                        return json.loads(candidate)
                    except json.JSONDecodeError:
                        continue

        # Third attempt — response was truncated, patch open braces
        try:
            trimmed = text.strip()
            # Remove trailing incomplete key-value (find last complete comma or brace)
            # Cut back to last clean boundary
            for cut in range(len(trimmed) - 1, 0, -1):
                ch = trimmed[cut]
                if ch in (",", "{", "["):
                    candidate = trimmed[:cut]
                    # Close all open structures
                    open_braces   = candidate.count("{") - candidate.count("}")
                    open_brackets = candidate.count("[") - candidate.count("]")
                    candidate += "]" * open_brackets + "}" * open_braces
                    try:
                        return json.loads(candidate)
                    except json.JSONDecodeError:
                        continue
        except Exception:
            pass

        # Final fallback — return raw so frontend still gets something
        return {
            "error": "Response was truncated or malformed JSON",
            "raw_text": text
        }

    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg:
            error_msg = "Invalid Anthropic API Key (401 Unauthorized). Please check your .env."
        return {
            "error": f"Claude call failed: {error_msg}",
            "raw_text": text if text else None
        }
def extract_text_pypdf(file_path: str) -> str:
    """Standard text extraction using pypdf."""
    import pypdf
    try:
        reader = pypdf.PdfReader(file_path)
        text = "\n\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        return text
    except Exception as e:
        return f"pypdf extraction failed: {str(e)}"
