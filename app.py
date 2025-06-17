from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()


app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("TOGETHER_API_KEY")

@app.route('/chat', methods=['POST'])
def chat():
    user_prompt = request.json.get("prompt", "")

    payload = {
        "model": "mistralai/Mistral-7B-Instruct-v0.2",
        "messages": [{"role": "user", "content": user_prompt}],
        "temperature": 0.7,
        "max_tokens": 512
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        res = requests.post("https://api.together.xyz/v1/chat/completions", json=payload, headers=headers)
        print("Status Code:", res.status_code)               # 🟢 Tambahkan ini
        print("Response JSON:", res.text)  
        data = res.json()
        reply = data.get("choices", [{}])[0].get("message", {}).get("content", "Tidak ada jawaban.")
    except Exception as e:
        reply = f"[ERROR]: {str(e)}"

    return jsonify({"response": reply})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

