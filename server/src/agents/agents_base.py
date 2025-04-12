import os
from typing import Any

from openai import OpenAI
import google.generativeai as genai
from ..services.genai_apis import call_genaiapi
from ..core.utils import get_logger, extract_json
import requests

logger = get_logger(__name__)

class AgentBase:
    def __init__(self, 
                 genai_model: str, 
                 temperature: float, 
                 device: str=None, 
                 system_message: str=None):
        self.genai_model = genai_model
        
        self.history: list = []
        self.system_message: str = system_message

        self.tools = []

        self.critiques: str = []
        self.user_modification: str = None

        self.opensource_models = ["deepseek", "llama"]
        self.closedsource_models = ["openai", "gemini", "claude"]

        self.temperature = temperature

        self.device = device

        self.base_url = None
        self.api_key = None

        self.ai_client = None

        if self.genai_model.startswith("openai"):
            self.base_url = "https://api.openai.com/v1/"
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.ai_client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key
            )

        elif self.genai_model.startswith("gemini"):
            self.api_key = os.getenv("GEMINI_API_KEY")
            genai.configure(api_key=self.api_key)
            self.ai_client = genai.GenerativeModel(self.genai_model.split("-", 1)[-1])

        elif self.genai_model.startswith("claude"):
            self.base_url = "https://api.anthropic.com/v1/"
            self.api_key = os.getenv("CLAUDE_API_KEY")

        else:
            self.base_url = "http://localhost:11434/v1/"
            self.api_key = "ollama"


    def set_system_message(self, sys_msg):
        self.system_message = sys_msg
    

    def __call__(self, messages, json_out=False, store_history=True):
        if isinstance(messages, list):
            for message in messages:
                self.history.append({"role": "user", "content": message})
        else:
            self.history.append({"role": "user", "content": messages})

        result = self.execute()

        self.history.append({"role": "assistant", "content": result})

        if json_out:
            result = list(extract_json(result))

        if not store_history:
            self.clear_history()
            
        return result
    
    
    def clear_history(self):
        self.history = []


    def execute(self):
        if self.genai_model.startswith("gemini"):
            try:
                genai.configure(api_key=self.api_key)
                model_name = self.genai_model.split("-")[1]  
                model = genai.GenerativeModel(model_name)

            
                prompt = self.system_message + "\n\n" if self.system_message else ""
                for msg in self.history:
                    prompt += f"{msg['role'].capitalize()}: {msg['content']}\n"
                prompt += "Assistant:"

                response = model.generate_content(prompt)
                return response.text

            except Exception as e:
                logger.warning(f"Gemini generation failed: {e}")
                return "Error during Gemini generation."

        elif self.genai_model.startswith("openai"):
            return call_genaiapi(SYSTEM_PROMPT=self.system_message, 
                                 CHATS=self.history, 
                                 ai_client=self.ai_client, 
                                 temp=self.temperature, 
                                 genai_model=self.genai_model)
                
        elif self.genai_model.startswith("ollama"):
            try:
                prompt = self.system_message + "\n\n" if self.system_message else ""
                for msg in self.history:
                    prompt += f"{msg['role'].capitalize()}: {msg['content']}\n"
                prompt += "Assistant:"

                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": self.genai_model.split("-")[-1],
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=None
                )

                try:
                    return response.json().get("response", "").strip()
                except Exception:
                    return response.text.strip()


            except Exception as e:
                logger.warning(f"Ollama generation failed: {e}")
                return "Error during Ollama generation."
