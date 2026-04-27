import pandas as pd
import io
from datetime import timedelta

def parse_fitbit_csv(content: bytes) -> dict:
    """
    Parse a CSV file using pandas and return detailed daily stats/trends.
    Specifically calculates Early 30-day vs Late 30-day comparisons.
    """
    try:
        df = pd.read_csv(io.BytesIO(content))
        
        if df.empty:
            return {"error": "CSV is empty"}
        
        # Convert date and sort
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors='coerce')
            df = df.sort_values(by="date")
        else:
            return {"error": "Missing 'date' column in CSV"}

        # Define time windows
        start_date = df["date"].min()
        end_date = df["date"].max()
        early_window = (start_date, start_date + timedelta(days=29))
        late_window = (end_date - timedelta(days=29), end_date)

        def get_stats(subset_df):
            if subset_df.empty:
                return {}
            res = {}
            # Numeric stats
            for col in ["sleep_hours", "hrv_ms", "resting_hr_bpm", "steps", "active_minutes", "nighttime_wakeups"]:
                if col in subset_df.columns:
                    res[col] = float(subset_df[col].mean())
            return res

        early_df = df[(df["date"] >= early_window[0]) & (df["date"] <= early_window[1])]
        late_df = df[(df["date"] >= late_window[0]) & (df["date"] <= late_window[1])]

        early_stats = get_stats(early_df)
        late_stats = get_stats(late_df)
        overall_stats = get_stats(df)

        # Medication missed
        missed_days = 0
        if "medication_missed_evening" in df.columns:
            missed_days = int((df["medication_missed_evening"].str.upper() == "YES").sum())

        # Bad nights
        bad_nights = []
        if "flagged_bad_night" in df.columns:
            bad_days = df[df["flagged_bad_night"].str.upper() == "YES"]
            for _, row in bad_days.iterrows():
                bad_nights.append({
                    "date": row["date"].strftime("%Y-%m-%d"),
                    "sleep": float(row["sleep_hours"]),
                    "hrv": float(row["hrv_ms"]),
                    "wakeups": int(row["nighttime_wakeups"]),
                    "spo2": float(row["spo2_pct"]) if "spo2_pct" in row else None
                })

        # Calculate changes
        def calc_pct_change(early, late):
            if not early or early == 0: return 0
            return ((late - early) / early) * 100

        trends = {
            "period": f"{start_date.strftime('%d %b %Y')} to {end_date.strftime('%d %b %Y')} ({len(df)} days)",
            "overall": overall_stats,
            "early_30d": early_stats,
            "late_30d": late_stats,
            "hrv_change_pct": calc_pct_change(early_stats.get("hrv_ms"), late_stats.get("hrv_ms")),
            "steps_change_pct": calc_pct_change(early_stats.get("steps"), late_stats.get("steps")),
            "med_missed_count": missed_days,
            "bad_nights": bad_nights
        }

        return {
            "trends": trends,
            "summary": overall_stats # Backward compatibility
        }
    except Exception as e:
        return {"error": f"Failed to parse CSV: {str(e)}"}
