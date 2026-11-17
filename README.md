# ImageChain
### Blockchain-Based Image Authenticity & Tamper Detection System

---

## 1. Project Overview

**ImageChain** is a lightweight, educational blockchain application designed to demonstrate how cryptographic hashing and distributed ledger principles can verify the authenticity and integrity of digital images.

The system operates through the following workflow:
1. Calculates a unique **SHA-256 cryptographic hash** from any uploaded image file.
2. Encapsulates that hash into a custom Python **blockchain block**.
3. Mines the block locally using a **Proof-of-Work (PoW)** algorithm until a valid target difficulty is reached.
4. Persists the mined block to a local ledger file (`blockchain.json`).
5. When an image is submitted for verification, recalculates its SHA-256 hash in real-time.
6. Searches the blockchain for an exact matching image hash.
7. Identifies whether the file is **Authentic** (matching hash found in a recorded block) or **Tampered / Unregistered** (hash mismatch or not found).

> **Note:** ImageChain is an educational prototype built from scratch to demonstrate foundational blockchain mechanics without complex enterprise or cryptocurrency overhead.

---

## 2. Problem Statement

In the modern digital landscape, images are easily modified, manipulated, or altered through editing tools and digital pipelines. Often, it is impossible for a user or recipient to know if an image file remains in its exact, original state as created or published.

Traditional storage solutions rely on centralized databases or metadata headers (such as EXIF data) that can be easily tampered with or deleted. 

**ImageChain** addresses this problem by combining:
- **SHA-256 Cryptographic Hashing:** Providing a sensitive fingerprint where altering even a single pixel alters the entire hash digest.
- **Blockchain Ledger:** Maintaining an append-only, chronologically linked chain of blocks secured with Proof-of-Work so records cannot be secretly altered or backdated.

---

## 3. Key Features

- **SHA-256 Image Hashing:** Fast, secure byte-level hashing of image files using Python's standard `hashlib`.
- **Custom Blockchain Implementation:** Clean, object-oriented blockchain engine written in Python without external black-box frameworks.
- **Genesis Block:** Automatically initializes the ledger with hardcoded Block `#0`.
- **Cryptographic Hash Linking:** Every block stores the SHA-256 hash of its predecessor (`previous_hash`), creating an immutable link.
- **Proof-of-Work Mining:** Implements a mining loop requiring blocks to satisfy a difficulty target.
- **Difficulty = 4:** Enforces that every mined block hash must begin with four leading zeros (`0000`).
- **Nonce-Based Iteration:** Iterates an integer counter (`nonce`) during mining until the hash satisfies the difficulty target.
- **Persistent Storage:** Saves and loads blockchain records to and from `blockchain.json`.
- **Image Registration (`POST /register`):** Calculates image hash, mines a block, records it, and returns the block index and hash.
- **Image Authenticity Verification (`POST /verify`):** Confirms authenticity and returns matching block metadata (index, hash, timestamp) or flags tampering.
- **Blockchain Integrity Validation (`GET /validate`):** Verifies stored block hashes, predecessor links, and Proof-of-Work compliance across the entire chain.
- **Blockchain Explorer:** Live visual table displaying all blocks, nonces, timestamps, and hashes.
- **Interactive Tampering Demonstration:** Guided 3-step walkthrough illustrating original registration, authentic verification, and side-by-side tamper detection.
- **FastAPI Backend:** High-performance, asynchronous REST API with automatic Swagger UI documentation at `/docs`.
- **Vanilla Frontend:** Lightweight, responsive user interface built using clean HTML5, CSS3, and JavaScript.

---

## 4. Technology Stack

### Core Technologies Used
- **Python (3.13+):** Backend programming language.
- **FastAPI:** Asynchronous Web API framework for endpoint routing and file upload handling.
- **Uvicorn:** Lightweight ASGI server running the FastAPI application.
- **python-multipart:** Streaming multipart/form-data processor for file uploads.
- **HTML5 & CSS3:** Semantic structure and responsive modern styling (CSS Grid, Flexbox, CSS Variables).
- **JavaScript (Vanilla ES6+):** Client-side application logic and Fetch API communication.
- **SHA-256 (`hashlib`):** Cryptographic hashing algorithm for block linking and image fingerprinting.
- **JSON:** File format for persistent ledger storage (`blockchain.json`).
- **Proof-of-Work (PoW):** Hash-based computational consensus mechanism.

### Technologies Explicitly NOT Used
To keep the project accessible, transparent, and focused on core computer science concepts, ImageChain deliberately does **NOT** use:
- **Ethereum**
- **Solidity**
- **MetaMask / Web3 wallets**
- **Smart contracts**
- **External blockchain networks (testnets/mainnets)**
- **SQL / NoSQL external databases**
- **Heavy frontend frameworks (React, Angular, Next.js)**

---

## 5. System Architecture

### Registration Pipeline

```text
User / Client
    │
    ▼
Frontend UI (HTML / CSS / JS)
    │  (POST /register with image file)
    ▼
FastAPI Backend (backend/main.py)
    │
    ▼
Image SHA-256 Hashing (backend/image_hasher.py)
    │  (Calculates 64-char hex digest)
    ▼
Custom Blockchain (backend/blockchain.py)
    │
    ▼
Proof-of-Work Mining (Block.mine_block(difficulty=4))
    │  (Increments nonce until hash starts with '0000')
    ▼
Append Mined Block to Chain
    │
    ▼
Save to Persistent Storage (blockchain.json)
```

### Verification Pipeline

```text
Image Submitted for Verification
    │
    ▼
FastAPI Backend (POST /verify)
    │
    ▼
Compute Current Image SHA-256 Hash
    │
    ▼
Scan Blockchain Blocks
    │
    ├─► Match Found?
    │      │
    │      ├─► YES ──► Result: AUTHENTIC
    │      │           (Returns matching block index, block hash, and timestamp)
    │      │
    │      └─► NO  ──► Result: TAMPERED / UNREGISTERED
    │                  (Image modified or hash never recorded on blockchain)
```

---

## 6. Blockchain Structure

Each block in ImageChain is an instance of the `Block` class and contains the following fields:

| Field Name | Type | Purpose |
|---|---|---|
| `index` | `int` | The sequential position of the block in the chain (starts at 0 for Genesis). |
| `timestamp` | `str` | The local date and time when the block was generated. |
| `image_hash` | `str` | The SHA-256 hex digest of the registered image file (or `"GENESIS"` for block 0). |
| `previous_hash` | `str` | The SHA-256 hash of the preceding block, enforcing the cryptographic chain link. |
| `nonce` | `int` | A numerical counter incremented during mining until the hash satisfies the target. |
| `hash` | `str` | The SHA-256 hash calculated over all the block's fields (`index`, `timestamp`, `image_hash`, `previous_hash`, `nonce`). |

---

## 7. Proof-of-Work (PoW)

### Implementation
ImageChain sets a constant mining difficulty:

```python
DIFFICULTY = 4
```

When a new block is created, its initial hash will generally not start with four zeros. The `mine_block()` method enters a loop:

```python
def mine_block(self, difficulty):
    target = "0" * difficulty
    while not self.hash.startswith(target):
        self.nonce += 1
        self.hash = self.calculate_hash()
```

### Purpose of the Nonce
Because block data (index, timestamp, previous_hash, and image_hash) remains constant, changing the block's hash requires varying an auxiliary value: the **nonce** (*number used once*). Mining tests successive nonce values ($0, 1, 2, 3, \dots$) until finding one that yields an output starting with the prefix:

```text
0000
```

### Example Mined Block Hash
```text
00006755fce3a083f4dcf45443df2405732538c364568d5d3385a22fd11ccae9
```

> **Security Context:** While difficulty 4 executes in a fraction of a second on modern personal computers (suitable for demonstrations), it introduces the core Proof-of-Work principle used by distributed ledgers like Bitcoin.

---

## 8. Image Hashing

ImageChain uses the **SHA-256 (Secure Hash Algorithm 256-bit)** to produce a deterministic, irreversible, 64-character hexadecimal digest representing the file's raw bytes.

Because of the **avalanche effect**, even changing a single pixel or byte in an image completely transforms its output hash:

```text
Original Image
      ↓
SHA-256 Hashing
      ↓
391036b87f0c5a2ed9ad08a2086f2616358fc5bb5eeb0852d8864ab481634aff

Modified / Edited Image
      ↓
SHA-256 Hashing
      ↓
2d523c5a200b031c3162f9f3655a27473fca2a24d3976866df50367ad64fb202

Original Hash ≠ Modified Hash  ──►  Tampering Detected!
```

---

## 9. API Endpoints

The FastAPI backend exposes the following REST endpoints:

| Method | Endpoint | Purpose | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/` | Health check / verification that backend is running | None | `{"message": "ImageChain is running!"}` |
| `GET` | `/blockchain` | Retrieves the entire blockchain and block count | None | JSON list of blocks and `number_of_blocks` |
| `POST` | `/register` | Hashes image, mines a new block, saves to ledger | `multipart/form-data` (`file`) | Registration receipt with `image_hash`, `block_index`, `block_hash` |
| `POST` | `/verify` | Verifies image authenticity against the blockchain | `multipart/form-data` (`file`) | Verification result (`Authentic`/`Tampered`), message, and block info |
| `GET` | `/validate` | Validates internal blockchain consistency and PoW | None | `{"blockchain_valid": bool, "message": str}` |

---

## 10. Project Structure

```text
ImageChain/
├── backend/
│   ├── main.py             # FastAPI application, routes, and CORS configuration
│   ├── blockchain.py       # Block and Blockchain classes, PoW mining, persistence
│   └── image_hasher.py     # SHA-256 image byte hashing utility
├── frontend/
│   ├── index.html          # UI layout (Status, Actions, Tampering Demo, Explorer)
│   ├── style.css           # Modern responsive design, typography, and badges
│   └── app.js              # Client-side API integration and DOM updates
├── uploads/                # Temporary/permanent storage for uploaded image files
├── blockchain.json         # Local persistent JSON ledger file
├── requirements.txt        # Backend dependencies (fastapi, uvicorn, python-multipart)
├── .gitignore              # Git ignore configuration
├── README.md               # Project documentation
└── venv/                   # Python virtual environment
```

---

## 11. Installation & Setup

### Prerequisites
- Python 3.10+ (tested with Python 3.13)
- Modern web browser (Chrome, Safari, Firefox, Edge)

### Setup Steps
1. Navigate to your desired working directory:
   ```bash
   cd ~/Documents
   ```
2. Enter the project folder:
   ```bash
   cd ImageChain
   ```
3. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
4. Install the required backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## 12. Running the Project

ImageChain utilizes a straightforward two-terminal execution workflow.

### Terminal 1 — Start FastAPI Backend
```bash
cd /Users/akankshasharma/Documents/ImageChain
source venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```
- Backend will be available at: `http://127.0.0.1:8000`
- Interactive Swagger documentation at: `http://127.0.0.1:8000/docs`

### Terminal 2 — Start Frontend Server
```bash
cd /Users/akankshasharma/Documents/ImageChain/frontend
python3 -m http.server 3000
```
- Frontend application will be available at: `http://localhost:3000`

---

## 13. Deployment (Render)

ImageChain is designed for deployment on [Render](https://render.com) using two decoupled services:

### 1. Backend Web Service
- **Runtime:** `Python 3`
- **Build Command:**
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  uvicorn backend.main:app --host 0.0.0.0 --port $PORT
  ```
  *(Render dynamically supplies the `$PORT` environment variable at runtime. The `--host 0.0.0.0` flag ensures the server accepts public traffic).*
- **Environment Variables (Optional):**
  - `ALLOWED_ORIGINS`: Set to your deployed frontend domain (e.g., `https://imagechain-frontend.onrender.com`) to restrict CORS, or leave blank to allow all origins by default.

### 2. Frontend Static Site
- **Service Type:** `Static Site`
- **Publish Directory:** `frontend`
- **Build Command:** *(None required for vanilla HTML/CSS/JS)*
- **API URL Configuration:**
  - In `frontend/app.js`, set `API_BASE_URL` to your live Render backend URL:
    ```javascript
    const API_BASE_URL = "https://<your-render-backend-url>.onrender.com";
    ```

### ⚠️ Storage & Ephemeral Filesystem Notice
- Render's free web services utilize an **ephemeral filesystem**.
- If the free instance spins down due to inactivity or restarts upon a new deploy, newly mined blocks saved to `blockchain.json` and images uploaded to `uploads/` will reset back to the initial Git state (Block `#0` Genesis).
- For a college demonstration, this reset behavior is completely acceptable. Production implementations would use an external distributed ledger or cloud storage.

---

## 14. How to Demonstrate the Project

Follow this demonstration sequence during presentations or evaluations:

### Demonstration 1 — Register Original Image
1. Open `http://localhost:3000` in your web browser.
2. In the **Register Image** card, choose an image (e.g., `sample.png`).
3. Click **Register on Blockchain**.
4. Observe:
   - Button displays mining progress (`⏳ Mining Block (PoW)...`).
   - Registration completes and displays the calculated SHA-256 hash.
   - The returned `block_hash` begins with `0000`.
   - The **Blockchain Explorer** automatically refreshes to display the new block and its winning `nonce`.

### Demonstration 2 — Verify Authentic Image
1. In the **Verify Image** card, select the **exact same original image**.
2. Click **Verify Authenticity**.
3. Observe:
   - Green badge: `✔ Authentic Image`.
   - Message: `"Image is authentic. Hash found in blockchain."`
   - Found In Block: Displays the matching block number, block hash, and timestamp.

### Demonstration 3 — Tamper Detection Walkthrough
1. Scroll to the **Tampering Demonstration** section.
2. Use **Step 1** to register an original image.
3. Use **Step 2** to confirm it is `AUTHENTIC`.
4. In **Step 3**, upload an edited, cropped, or slightly altered version of that image.
5. Click **3. Verify Modified**.
6. Observe:
   - Red badge: `✖ TAMPERED / UNREGISTERED`.
   - The **Cryptographic Hash Comparison** box displays both hashes side-by-side:
     $$\text{Original Hash} \neq \text{Modified Hash}$$
   - Clearly explains that because the modified file produces a distinct hash absent from the blockchain, tampering is detected.

### Demonstration 4 — Blockchain Integrity Validation
1. Observe the top **Blockchain Integrity** badge showing `✔ Blockchain Valid`.
2. Click the **🔄 Refresh** button in the header.
3. The backend scans every block, verifying that hashes match recalculations, links match previous blocks, and each hash satisfies difficulty 4.

---

## 15. Example Block

Below is an illustrative example of a mined block as stored in `blockchain.json`:

```json
{
  "index": 1,
  "timestamp": "2026-11-17 15:51:47.936840",
  "image_hash": "94ca23ac2dc5a99c2d06107d80499a8d6376d656066623ae2806a3a4eba6fbee",
  "previous_hash": "1d3967cf80cbd4967e3ceba4c6ad864848968e548011eac72fe87b6ab0b28c2c",
  "nonce": 33989,
  "hash": "00006755fce3a083f4dcf45443df2405732538c364568d5d3385a22fd11ccae9"
}
```

---

## 16. Security & Limitations

To maintain academic rigor and transparency, the following design boundaries should be noted:
- **Local Single-Node Ledger:** The blockchain is stored locally in `blockchain.json` and runs on a single host. It is not currently distributed across peer-to-peer nodes.
- **Educational Proof-of-Work:** Difficulty 4 is calibrated for fast demonstration. In production cryptocurrency networks, difficulty is dynamically adjusted across thousands of decentralized nodes.
- **File Integrity vs. Legal Authorship:** A matching SHA-256 hash mathematically proves that the file bytes match a previously registered file; it does not inherently prove who originally authored or holds copyright to the photo.
- **Tampered vs. Unregistered:** An image is reported as `Tampered / Unregistered` whenever its hash is not found on the blockchain. This signifies either that a registered image was modified or that the file was never recorded in the ledger.

---

## 17. Future Enhancements

Potential extensions for future academic research or development include:
- **Peer-to-Peer Consensus:** Adding multiple independent network nodes communicating via WebSocket/P2P gossip protocol.
- **Asymmetric Cryptography:** Integrating digital signatures (e.g., ECDSA or RSA) to bind image hashes to specific creator public keys.
- **Decentralized Storage:** Integrating InterPlanetary File System (IPFS) to store raw media decentralized while keeping only content identifiers (CIDs) on-chain.
- **Pixel-Level Forensic Visualization:** Incorporating Error Level Analysis (ELA) to visually highlight which regions of an image were manipulated.
- **User Authentication:** Adding user roles, API keys, or JWT token authentication for image registration.

---

## 18. Academic Project

- **Project Title:** ImageChain — Blockchain-Based Image Authenticity & Tamper Detection System
- **Focus Area:** Applied Cryptography, Blockchain Concepts, and Web Application Architecture
- **Purpose:** College Project Demonstration and Educational Proof-of-Concept
