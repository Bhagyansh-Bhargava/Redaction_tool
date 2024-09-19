from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import infer2
import re
from fastapi.middleware.cors import CORSMiddleware
import process_image
from typing import List
import getdoc

app = FastAPI()
# phone_pattern = re.compile(r'\b(\+?\d{1,4}[\s.-]?)?(\(?\d{1,4}\)?[\s.-]?)?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}\b')
# ip_pattern = re.compile(r'\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b')
# ip_pattern = re.compile(r'\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b(?!\.)')

phone_pattern = re.compile(r'\b\d{10}\b')
origins = [
    "http://localhost",
    "http://localhost:3000",
    "*",
]

# Add CORSMiddleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class TextRequest(BaseModel):
    text: str
    filters: List[str]
    image: str
   

@app.post("/process-text")
async def process_text(req: TextRequest):
    # Process the text here
    redacted_text = None
    if req.image:
        redacted_text = await process_image.run(req)

    else:
    # req = request.text
        redacted_text = await infer2.redact(req)
    # redacted_text = ip_pattern.sub('[REDACTED_IP]', ans)
    # redacted_text = phone_pattern.sub('[REDACTED_PHONE]', redacted_text)
   
    return redacted_text
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8182)

