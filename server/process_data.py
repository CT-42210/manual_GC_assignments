# process_data.py
import server
import json


def process_json(data):
    try:
        print(data)
        # Your JSON data processing logic goes here
        # Replace this example logic with your own implementation
        server.main(data)

        return 0
    except Exception as e:
        print(f"Error: {e}")
        return 1  # 1 for error

