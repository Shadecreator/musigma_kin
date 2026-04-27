try:
    print("Attempting to import backend.main...")
    from backend.main import app
    print("Import successful.")
except Exception as e:
    print(f"Import failed: {e}")
    import traceback
    traceback.print_exc()
