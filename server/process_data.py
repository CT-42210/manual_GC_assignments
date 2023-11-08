# process_data.py
import server
import json


def process_json(protocol, data, assignmentID):
    try:
        if protocol == 0:
            print(data)
            server.create(data)
        if protocol == 1:
            print(data)
            server.edit(assignmentID, data)

        return 0
    except Exception as e:
        print(f"Error: {e}")
        return 1  # 1 for error

