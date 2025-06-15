from flask import Flask, request, jsonify
from flask_cors import CORS
import requests as req_to_ollama

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_prompt = data.get("prompt", "")

    res = req_to_ollama.post("http://localhost:11434/api/generate", json={
        "model": "llama3.2",
        "prompt": user_prompt,
        "stream": False
    })

    try:
        bot_reply = res.json().get("response", "[Error: no response received from model]")
    except Exception as e:
        bot_reply = f"[Error parsing response: {str(e)}]"

    return jsonify({"response": bot_reply})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
