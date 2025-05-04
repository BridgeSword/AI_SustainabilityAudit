from openai import OpenAI

from typing import List, Dict

from ..core.utils import get_logger
from ..core.constants import Constants


logger = get_logger(__name__)

def call_genaiapi(SYSTEM_PROMPT: str, 
                  CHATS: List[Dict],
                  ai_client: OpenAI,
                  temp: float=0.7, 
                  genai_model: str="openai"):

    genai_model = genai_model.lower()

    if any([genai_model.startswith(_) for _ in Constants.CLOSEDSOURCE_MODELS.value + [Constants.OLLAMA.value]]):
        logger.info("Calling ClosedSource Models or Ollama!")

        if "gemini" not in genai_model:
            genai_model = "-".join(genai_model.split("-")[1:])

        messages = [
            {"role": "developer", "content": SYSTEM_PROMPT}
        ]
        
        messages.extend(CHATS)

        response = ai_client.chat.completions.create(
            model=genai_model,
            messages=messages, 
            temperature=temp
        )

        return response.choices[0].message.content
    
    else:
        raise ValueError("Invalid API Spec")

