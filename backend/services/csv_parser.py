import pandas as pd
import io

def parse_fitbit_csv(content: bytes) -> dict:
    """
    Parse a CSV file using pandas and return daily stats/trends.
    Assumes standard columns like date, sleep_hrs, resting_hr, hrv, steps
    """
    try:
        df = pd.read_csv(io.BytesIO(content))
        
        # Basic sanity checks
        if df.empty:
            return {"error": "CSV is empty"}
        
        summary = {}
        for col in df.select_dtypes(include=["number"]).columns:
            summary[col] = {
                "mean": float(df[col].mean()),
                "min": float(df[col].min()),
                "max": float(df[col].max())
            }
            
        # Example of trend if date exists
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors='coerce')
            df = df.sort_values(by="date")
            summary["date_range"] = {
                "start": df["date"].min().isoformat() if pd.notnull(df["date"].min()) else None,
                "end": df["date"].max().isoformat() if pd.notnull(df["date"].max()) else None
            }
            
        return {
            "summary": summary,
            "raw_preview": df.head(5).to_dict(orient="records")
        }
    except Exception as e:
        return {"error": f"Failed to parse CSV: {str(e)}"}
