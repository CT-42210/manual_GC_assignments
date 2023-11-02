# app.py
from flask import Flask, request, jsonify
import subprocess
import json
import process_data

app = Flask(__name__)


@app.route('/', methods=['POST'])
def process_json_data():
    try:
        data = request.get_json()
        print(data)
        print(json.dumps(data))
        result_code = process_data.process_json(json.dumps(data))
        return jsonify({"result_code": result_code})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"result_code": 1})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
