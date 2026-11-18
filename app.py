
import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from groq import Groq

# Load API key from the .env file
load_dotenv()

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/reader")
def reader():
    return render_template("reader.html")


@app.route("/api/transform", methods=["POST"])
def transform_text():
    data = request.get_json(silent=True) or {}

    text = (data.get("text") or "").strip()
    mode = data.get("mode")

    if not text:
        return jsonify({"error": "Please provide some text."}), 400

    if len(text) > 12000:
        return jsonify({"error": "Please use a shorter text section."}), 400

    if mode not in ["gist", "simplified"]:
        return jsonify({"error": "Invalid reading mode."}), 400

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return jsonify({
            "error": "Groq API key is missing. Please check your .env file."
        }), 500

    if mode == "gist":
        instruction = (
            "Create a short gist of the given text in 1 or 2 sentences. "
            "Include only the most important ideas."
        )
    else:
        instruction = (
            "Rewrite the given text using simple, everyday English. "
            "Use short sentences and easy words. "
            "Preserve the original meaning and important information. "
            "Do not add new facts."
        )

    try:
        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You make text easier to understand. "
                        "Always preserve the original meaning. "
                        "Do not invent information."
                    )
                },
                {
                    "role": "user",
                    "content": f"{instruction}\n\nText:\n{text}"
                }
            ],
            temperature=0.2,
            max_tokens=1200
        )

        result = response.choices[0].message.content.strip()

        return jsonify({"result": result})

    except Exception:
        app.logger.exception("Groq API request failed")
        return jsonify({
            "error": (
                "AI request failed. Please check your internet connection, "
                "Groq API access, and supported model."
            )
        }), 502


if __name__ == "__main__":
    app.run(debug=True)
