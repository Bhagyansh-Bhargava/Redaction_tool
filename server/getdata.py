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
import os
import base64
from io import BytesIO
from PIL import Image
import base64
import cv2
import pytesseract as tess
import numpy as np
import difflib
# tess.pytesseract.tesseract_cmd= "/home/ubuntu/new_volume/lab_aryan/piret/tesseract.exe"
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Define the request model
class TextRequest(BaseModel):
    text: str
    filters: List[str]
    image: str


# Function to decrypt the incoming data
def decrypt_data(encrypted_text, secret_key):
    # Decode the base64 encoded encrypted text
    encrypted_text_bytes = base64.b64decode(encrypted_text)
    
    # Extract the IV and encrypted message
    iv = encrypted_text_bytes[:16]
    encrypted_message = encrypted_text_bytes[16:]
    
    # Create AES cipher using the key and IV
    cipher = AES.new(secret_key.encode('utf-8'), AES.MODE_CBC, iv)
    
    # Decrypt the message and unpad it
    decrypted_data = unpad(cipher.decrypt(encrypted_message), AES.block_size)
    
    return decrypted_data.decode('utf-8')

# base64 to image format
def base64_to_image(base64_string, output_file_path):
    image_data = base64.b64decode(base64_string)
    image_stream = BytesIO(image_data)
    image = Image.open(image_stream)
    image.save(output_file_path)

def image_to_base64(image_path):
    """Convert image to Base64 string"""
    with open(image_path, "rb") as image_file:
        # Read the image file as a binary
        image_binary = image_file.read()
        # Encode binary data to Base64
        base64_encoded = base64.b64encode(image_binary).decode('utf-8')
        return base64_encoded

async def blur_pii_text(im_path, selected_filters=[]):
    print("blur called")
    def is_similar(word1, word2, threshold=0.7):
        """Return True if the words are similar enough based on the threshold."""
        return difflib.SequenceMatcher(None, word1, word2).ratio() > threshold

    def clean(text):
        """Clean and normalize text for comparison."""
        return text.strip().lower()

    # Extract text from the imag
    print("hereeee")
    print(f"path is {im_path}")
    image = Image.open("/home/ubuntu/new_volume/lab_aryan/piret/image.png")
    text = tess.image_to_string(image)
    # text = "Maharaja"
    print(f"text is {text}")
    img = cv2.imread(im_path)

    print("image read")

    if img is None:
        raise ValueError(f"Failed to read the image from path: {im_path}")

    try:
        # Prepare payload for API request
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
    
        # Send request to the API
        print("sending request")
        print(f"payload is {payload}")
        response = requests.post(os.environ.get('srver'), json=payload, headers=headers)
        # response.raise_for_status()
        data = response.json()
        print(f"data is {data}")
        # Extract the redacted text
        text_to_redact = [word["text"] for word in data[0]["entities"]]
        print(text_to_redact)

        # Perform OCR to get image data
        img_data = tess.image_to_data(im_path).split("\n")
        blurred_img = img.copy()

        # Iterate through OCR data to blur matching regions
        for phrase in text_to_redact:
            words = phrase.split()
            words = [clean(word) for word in words]
            phrase_length = len(words)
            print(words)
            for i in range(1, len(img_data)):
                box = img_data[i].split()
                if len(box) < 12:
                    continue
                
                # Check if the phrase matches the sequence of words in OCR data
                match = True
                match_boxes = []
                v = 0
                for j in range(phrase_length):
                    if i + j >= len(img_data):
                        match = False
                        break
                    next_box = img_data[i + j].split()
                    v = 1
                    while (len(next_box) != 12) and i + j + v < len(img_data):
                        next_box = img_data[i + j + v].split()
                        v += 1
                    
                    # Use is_similar to allow for some leniency in matching
                    if not is_similar(words[j], clean(next_box[-1])):
                        match = False
                        break
                    match_boxes.append(next_box)
                
                if match:
                    # Calculate the bounding box covering the entire phrase
                    x_min = min(int(b[6]) for b in match_boxes)
                    y_min = min(int(b[7]) for b in match_boxes)
                    x_max = sum(int(b[8]) for b in match_boxes)
                    y_max = max(int(b[9]) for b in match_boxes)
                    # print(x_min,y_min,x_max,y_max)
                    # Ensure valid bounding box dimensions
                    roi = blurred_img[y_min:y_min+y_max, x_min:x_min+x_max+v]
                    blurred_roi = cv2.GaussianBlur(roi, (99, 99), 0)
                    blurred_img[y_min:y_min+y_max, x_min:x_min+x_max+v] = blurred_roi

        return blurred_img

    except requests.RequestException as e:
        logging.error(f"API request failed: {e}")
        raise

def blur_faces(image_path, output_path):
    # Load the image
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Face detection
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    for (x, y, w, h) in faces:
        face = image[y:y+h, x:x+w]
        blurred_face = cv2.GaussianBlur(face, (99, 99), 30)
        image[y:y+h, x:x+w] = blurred_face
    cv2.imwrite(output_path, image)

# Function to redact text using an external API
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

        response = requests.post("https://api.private-ai.com/community/v3/process/text", json=payload, headers=headers)
        response.raise_for_status()  # This will raise an HTTPError if the response was an error

        data = response.json()
        
        # return data[0]["entities"][0]["processed_text"]
        return data[0]["processed_text"]
    except requests.RequestException as e:
        logging.error(f"API request failed: {e}")
        raise


# Initialize the FastAPI app
# app = FastAPI()

# origins = [
#     "http://localhost",
#     "http://localhost:3000",
#     "*",
# ]

# # Add CORSMiddleware to the app
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Set up logging
logging.basicConfig(filename='server.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')


# @app.post("/redact/")
async def redact(request: TextRequest):
    try:
        print("in server")
        secret_key = '1234567890123456'  # The same key used in JavaScript
        if not secret_key:
            raise ValueError("No AES_SECRET_KEY found in environment variables")
        if request.text:
            # Decrypt the incoming text
            # encrypted_text = '7vnD4swIoLvQDJwal7iXQbqDXMDVaXFrtgVhgHOt+4f39QI8CsrnX8RerDMnrp9z'
            decrypted_text = decrypt_data(request.text, secret_key)
            logging.info(f"Decrypted text: {decrypted_text}")

            # Perform redaction
            redacted_data = redact_text(decrypted_text, request.filters)
            # redacted_text = redacted_data.get("redacted_text", [""])[0].get("processed_text", "")

            logging.info("Text redacted successfully.")

            # Return the redacted text
            return {"redacted_text": redacted_data,"image":""}
        elif request.image:
            bs64image = decrypt_data(request.image,secret_key)
            base64_to_image(bs64image, "image.png")

            # blur_faces_and_text("image.png","redact_img.png")
            img_text_removed = await blur_pii_text("image.png", request.filters)
            cv2.imwrite('text_removed_image.png', img_text_removed)
            blur_faces("text_removed_image.png","text_removed_image.png")

            return {"redacted_text":"","image":str(image_to_base64("text_removed_image.png"))}

            
            

    except Exception as e:
        logging.error(f"Error during redaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# if name == "main":
# import uvicorn
# uvicorn.run(app, host="0.0.0.0", port=8000)