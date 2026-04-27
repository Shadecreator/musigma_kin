import sys
import traceback

try:
    from backend.main import app
    print("SUCCESS: loaded app")
except Exception as e:
    print("ERROR:")
    traceback.print_exc(file=sys.stdout)
