import infer2
import random
import base64
from io import BytesIO
from PIL import Image
async def run(req):
#     img_data = base64.b64decode(req.image)

# # Convert the bytes to an image
#     img = Image.open(BytesIO(img_data))
#     transformations = [
#         lambda img: img.rotate(random.randint(0, 360)),  # Random rotation
#         lambda img: ImageOps.mirror(img),  # Horizontal flip
#         lambda img: ImageOps.flip(img),  # Vertical flip
#         lambda img: img.resize((random.randint(100, 300), random.randint(100, 300))),  # Random resize
#         lambda img: img.crop((0, 0, img.width // 2, img.height // 2)),  # Random crop
#         lambda img: ImageOps.grayscale(img),  # Convert to grayscale
#         lambda img: ImageOps.autocontrast(img),  # Auto contrast
#         lambda img: ImageOps.equalize(img),  # Histogram equalization
#     ]
    
#     # Apply random transformations
#     num_transformations = random.randint(1, 4)  # Apply 1 to 4 random transformations
#     for _ in range(num_transformations):
#         transformation = random.choice(transformations)
#         image = transformation(image)
    ans = await infer2.redact(req)
    return ans
    
    # return image