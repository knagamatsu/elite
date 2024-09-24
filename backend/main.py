from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os

app = FastAPI()

# CORSミドルウェアを追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に設定してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BotLogicRequest(BaseModel):
    logic: str

class GeminiResponse(BaseModel):
    pine_script: str
    token_count: int
    finish_reason: str
    safety_ratings: dict

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

@app.post("/generate-pine-script", response_model=GeminiResponse)
async def generate_pine_script(request: BotLogicRequest):
    prompt = f"Generate a Pine Script based on the following trading logic: {request.logic}\nMake sure the script is complete and can be directly used in TradingView."
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json={
                "contents": [{"parts": [{"text": prompt}]}]
            }
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Gemini API request failed")
    
    data = response.json()
    generated_text = data["candidates"][0]["content"]["parts"][0]["text"]
    finish_reason = data["candidates"][0]["finishReason"]
    token_count = data["usageMetadata"]["totalTokenCount"]
    safety_ratings = {rating["category"]: rating["probability"] for rating in data["candidates"][0]["safetyRatings"]}

    return GeminiResponse(
        pine_script=generated_text,
        token_count=token_count,
        finish_reason=finish_reason,
        safety_ratings=safety_ratings
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    