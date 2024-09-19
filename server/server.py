from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import logging
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64
import requests
import os



class TextRequest(BaseModel):
    text: str
    filters: List[str]



def decrypt_data(encrypted_text, secret_key):
   
    encrypted_text_bytes = base64.b64decode(encrypted_text)
    
 
    iv = encrypted_text_bytes[:16]
    encrypted_message = encrypted_text_bytes[16:]
    

    cipher = AES.new(secret_key.encode('utf-8'), AES.MODE_CBC, iv)
    
    decrypted_data = unpad(cipher.decrypt(encrypted_message), AES.block_size)
    
    return decrypted_data.decode('utf-8')



def redact_text(text, selected_filters):
    try:
        payload = {
            "text": [text],
            "link_batch": False,
            "entity_detection": {
                "entity_types": [
                    {
                        "type": "ENABLE",
                        "value": selected_filters
                    }
                ]
            },
            "processed_text": {
                "type": "MARKER",
                "pattern": "[UNIQUE_NUMBERED_ENTITY_TYPE]"
            }
        }

        headers = {"Content-Type": "application/json", "X-API-KEY": "a12108691d914f70a90fd99dc595f4af"}

        response = requests.post(os.environ.get('srver'), json=payload, headers=headers)
        response.raise_for_status() 

        data = response.json()
        

        return data[0]["processed_text"]
    except requests.RequestException as e:
        logging.error(f"API request failed: {e}")
        raise



app = FastAPI()

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

# Set up logging
logging.basicConfig(filename='server.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')


@app.post("/redact/")
async def redact(request: TextRequest):
    try:
     
        secret_key = '1234567890123456'  
        encrypted_text = '7vnD4swIoLvQDJwal7iXQbqDXMDVaXFrtgVhgHOt+4f39QI8CsrnX8RerDMnrp9z'
        if not secret_key:
            raise ValueError("No AES_SECRET_KEY found in environment variables")

        decrypted_text = decrypt_data(request.text, secret_key)
        logging.info(f"Decrypted text: {decrypted_text}")

    
        redacted_data = redact_text(decrypted_text, request.filters)

        logging.info("Text redacted successfully.")

    
        return {"redacted_text": redacted_data}

    except Exception as e:
        logging.error(f"Error during redaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# if _name_ == "_main_":
import uvicorn
uvicorn.run(app, host="0.0.0.0", port=8000)