# app.py
from flask import Flask, request, jsonify
import subprocess
import json
import process_data

app = Flask(__name__)


@app.route('/create', methods=['POST'])
def reciveCreateAssignment():
    try:
        data = request.get_json()
        print(data)
        print(json.dumps(data))
        result_code = process_data.process_json(0, json.dumps(data), 0)
        return jsonify({"result_code": result_code})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"result_code": 1})


@app.route('/edit', methods=['POST'])
def reciveEditAssignment():
    try:
        data = request.get_json()
        print(data)
        print(json.dumps(data))
        result_code = process_data.process_json(0, json.dumps(data), 0)
        return jsonify({"result_code": result_code})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"result_code": 1})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
