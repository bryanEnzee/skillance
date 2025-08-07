from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
import json
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()   # <-- create app first!

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("logs", exist_ok=True)
LOG_FILE = "logs/chatlogs.json"

class ChatLog(BaseModel):
    user: str = ""
    question: str = ""
    answer: str = ""

def append_log(entry):
    try:
        logs = []
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, "r") as f:
                logs = json.load(f)
        logs.append(entry)
        with open(LOG_FILE, "w") as f:
            json.dump(logs, f, indent=2)
    except Exception as e:
        print("Log write error:", e)

@app.post("/store")
async def store_log(entry: ChatLog):
    data = entry.dict()
    data["timestamp"] = datetime.utcnow().isoformat()
    append_log(data)
    return {"status": "ok"}
