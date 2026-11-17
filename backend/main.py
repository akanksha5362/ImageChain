from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os

from backend.blockchain import Blockchain
from backend.image_hasher import calculate_image_hash


app = FastAPI(title="ImageChain")

# Enable CORS for frontend requests
# Allows all origins by default for local development and simple public deployment;
# can be restricted to specific frontend domains via the ALLOWED_ORIGINS environment variable.
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")] if allowed_origins_env else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create one blockchain for our application
blockchain = Blockchain()


# Folder where uploaded images will be stored
UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {
        "message": "ImageChain is running!"
    }


@app.get("/blockchain")
def get_blockchain():
    return {
        "number_of_blocks": len(blockchain.chain),
        "blocks": [
            {
                "index": block.index,
                "timestamp": block.timestamp,
                "image_hash": block.image_hash,
                "previous_hash": block.previous_hash,
                "nonce": block.nonce,
                "hash": block.hash
            }
            for block in blockchain.chain
        ]
    }


@app.post("/register")
async def register_image(file: UploadFile = File(...)):

    # Save uploaded image
    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as image_file:
        content = await file.read()
        image_file.write(content)

    # Calculate SHA-256 hash
    image_hash = calculate_image_hash(file_path)

    # Add image hash to blockchain
    blockchain.add_block(image_hash)

    return {
        "message": "Image registered successfully!",
        "filename": file.filename,
        "image_hash": image_hash,
        "block_index": blockchain.chain[-1].index,
        "block_hash": blockchain.chain[-1].hash
    }

@app.post("/verify")
async def verify_image(file: UploadFile = File(...)):

    # Save uploaded image temporarily
    file_path = os.path.join(
        UPLOAD_FOLDER,
        "verify_" + file.filename
    )

    with open(file_path, "wb") as image_file:
        content = await file.read()
        image_file.write(content)

    # Calculate SHA-256 hash
    image_hash = calculate_image_hash(file_path)

    # Check if hash exists in blockchain
    matched_block = blockchain.verify_image(image_hash)

    if matched_block:
        return {
            "filename": file.filename,
            "image_hash": image_hash,
            "result": "Authentic",
            "message": "Image is authentic. Hash found in blockchain.",
            "block_index": matched_block.index,
            "block_hash": matched_block.hash,
            "block_timestamp": matched_block.timestamp
        }
    else:
        return {
            "filename": file.filename,
            "image_hash": image_hash,
            "result": "Tampered",
            "message": "Image has been tampered with. Hash not found in blockchain."
        }

@app.get("/validate")
def validate_blockchain():

    is_valid = blockchain.is_chain_valid()

    if is_valid:
        message = "Blockchain is valid. No tampering detected."
    else:
        message = "Blockchain has been tampered with!"

    return {
        "blockchain_valid": is_valid,
        "message": message
    }