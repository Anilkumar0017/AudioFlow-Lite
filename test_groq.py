from dotenv import load_dotenv
import os
from groq import Groq

load_dotenv(override=True)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("ERROR: Groq API key was not loaded from .env")
else:
    print("API key found successfully!")

    try:
        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "user",
                    "content": "Say Hello in one sentence."
                }
            ],
            temperature=0.2,
            max_tokens=100
        )

        print("\nGroq AI Response:")
        print(response.choices[0].message.content)

    except Exception as error:
        print("\nGroq API Error:")
        print(type(error).__name__)
        print(error)