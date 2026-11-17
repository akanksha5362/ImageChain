/**
 * ImageChain — Frontend Client Application
 * ============================================================================
 * BACKEND API CONFIGURATION
 * ============================================================================
 * - Render Production:  "https://imagechain-backend.onrender.com"
 * - Local Development:  "http://127.0.0.1:8000"
 * ============================================================================
 */
const API_BASE_URL = "https://imagechain-backend.onrender.com";
// const API_BASE_URL = "http://127.0.0.1:8000";

// DOM Elements
const connectionErrorEl = document.getElementById("connection-error");
const backendTargetUrl = document.getElementById("backend-target-url");
if (backendTargetUrl) {
  backendTargetUrl.textContent = API_BASE_URL;
}
const chainStatusBadge = document.getElementById("chain-status-badge");
const chainStatusMessage = document.getElementById("chain-status-message");
const totalBlocksCount = document.getElementById("total-blocks-count");
const refreshAllBtn = document.getElementById("refresh-all-btn");
const refreshChainBtn = document.getElementById("refresh-chain-btn");

// Register Elements
const registerForm = document.getElementById("register-form");
const registerInput = document.getElementById("register-input");
const registerFileName = document.getElementById("register-file-name");
const registerBtn = document.getElementById("register-btn");
const registerResult = document.getElementById("register-result");
const regResFilename = document.getElementById("reg-res-filename");
const regResImghash = document.getElementById("reg-res-imghash");
const regResBlockidx = document.getElementById("reg-res-blockidx");
const regResBlockhash = document.getElementById("reg-res-blockhash");
const regResMessage = document.getElementById("reg-res-message");
const registerTime = document.getElementById("register-time");

// Verify Elements
const verifyForm = document.getElementById("verify-form");
const verifyInput = document.getElementById("verify-input");
const verifyFileName = document.getElementById("verify-file-name");
const verifyBtn = document.getElementById("verify-btn");
const verifyResult = document.getElementById("verify-result");
const verifyStatusBadge = document.getElementById("verify-status-badge");
const verifyResMessage = document.getElementById("verify-res-message");
const verResFilename = document.getElementById("ver-res-filename");
const verResImghash = document.getElementById("ver-res-imghash");
const verResBlockidx = document.getElementById("ver-res-blockidx");
const verResBlockhash = document.getElementById("ver-res-blockhash");
const verResTimestamp = document.getElementById("ver-res-timestamp");

// Explorer Elements
const blocksContainer = document.getElementById("blocks-container");
const blocksLoading = document.getElementById("blocks-loading");

// -------------------------------------------------------------
// Helper: Format Hash (highlights 0000 prefix if present)
// -------------------------------------------------------------
function formatHash(hashStr) {
  if (!hashStr) return "-";
  if (hashStr.startsWith("0000")) {
    return `<span class="pow-prefix">0000</span>${hashStr.substring(4)}`;
  }
  return hashStr;
}

// -------------------------------------------------------------
// Backend Status & Validation
// -------------------------------------------------------------
async function fetchValidation() {
  try {
    const res = await fetch(`${API_BASE_URL}/validate`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    connectionErrorEl.style.display = "none";

    if (data.blockchain_valid) {
      chainStatusBadge.className = "badge badge-success";
      chainStatusBadge.textContent = "✔ Blockchain Valid";
    } else {
      chainStatusBadge.className = "badge badge-danger";
      chainStatusBadge.textContent = "✖ Blockchain Tampered";
    }

    chainStatusMessage.textContent = data.message || "Chain verified successfully.";
  } catch (err) {
    console.error("Failed to validate blockchain:", err);
    connectionErrorEl.style.display = "block";
    chainStatusBadge.className = "badge badge-danger";
    chainStatusBadge.textContent = "Offline";
    chainStatusMessage.textContent = "Unable to reach backend.";
  }
}

// -------------------------------------------------------------
// Blockchain Explorer: Fetch and render all blocks
// -------------------------------------------------------------
async function fetchBlockchain() {
  blocksLoading.style.display = "block";
  blocksLoading.textContent = "Loading blockchain records...";

  try {
    const res = await fetch(`${API_BASE_URL}/blockchain`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    connectionErrorEl.style.display = "none";
    totalBlocksCount.textContent = data.number_of_blocks;

    renderBlocks(data.blocks);
  } catch (err) {
    console.error("Failed to load blockchain:", err);
    connectionErrorEl.style.display = "block";
    blocksLoading.style.display = "block";
    blocksLoading.textContent = "Error loading blocks from backend.";
  }
}

function renderBlocks(blocks) {
  blocksContainer.innerHTML = "";

  if (!blocks || blocks.length === 0) {
    blocksLoading.style.display = "block";
    blocksLoading.textContent = "No blocks found in blockchain.";
    blocksContainer.style.display = "none";
    return;
  }

  blocksLoading.style.display = "none";
  blocksContainer.style.display = "flex";

  // Display blocks (from newest to oldest or index order)
  blocks.forEach((block) => {
    const isGenesis = block.index === 0;

    const blockCard = document.createElement("div");
    blockCard.className = "block-card";

    blockCard.innerHTML = `
      <div class="block-card-header">
        <div>
          <span class="block-index-badge">Block #${block.index}</span>
          ${isGenesis ? '<span class="block-genesis">Genesis Block</span>' : ""}
        </div>
        <span class="block-time">${block.timestamp || "N/A"}</span>
      </div>
      <div class="block-card-body">
        <div class="block-data-row">
          <span class="block-data-label">Block Hash:</span>
          <span class="block-data-val font-mono hash-text">${formatHash(block.hash)}</span>
        </div>
        <div class="block-data-row">
          <span class="block-data-label">Previous Hash:</span>
          <span class="block-data-val font-mono hash-text">${block.previous_hash}</span>
        </div>
        <div class="block-data-row">
          <span class="block-data-label">Image Hash:</span>
          <span class="block-data-val font-mono hash-text">${block.image_hash}</span>
        </div>
        <div class="block-data-row">
          <span class="block-data-label">Mining Nonce:</span>
          <span class="block-nonce font-mono">${block.nonce}</span>
        </div>
      </div>
    `;

    blocksContainer.appendChild(blockCard);
  });
}

// -------------------------------------------------------------
// File Input UI Handlers
// -------------------------------------------------------------
registerInput.addEventListener("change", () => {
  if (registerInput.files.length > 0) {
    registerFileName.textContent = registerInput.files[0].name;
  } else {
    registerFileName.textContent = "Choose an image or drop it here";
  }
});

verifyInput.addEventListener("change", () => {
  if (verifyInput.files.length > 0) {
    verifyFileName.textContent = verifyInput.files[0].name;
  } else {
    verifyFileName.textContent = "Choose an image to verify";
  }
});

// -------------------------------------------------------------
// Register Image Form Submission
// -------------------------------------------------------------
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!registerInput.files || registerInput.files.length === 0) {
    alert("Please select an image to register.");
    return;
  }

  const file = registerInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  // Set loading state
  const btnText = registerBtn.querySelector(".btn-text");
  const btnSpinner = registerBtn.querySelector(".btn-spinner");
  registerBtn.disabled = true;
  btnText.style.display = "none";
  btnSpinner.style.display = "inline";

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Registration failed with status ${res.status}`);
    }

    const data = await res.json();

    // Populate result display
    regResFilename.textContent = data.filename;
    regResImghash.textContent = data.image_hash;
    regResBlockidx.textContent = `Block #${data.block_index}`;
    regResBlockhash.innerHTML = formatHash(data.block_hash);
    regResMessage.textContent = `${data.message} (Mined with PoW difficulty 4)`;
    registerTime.textContent = new Date().toLocaleTimeString();

    registerResult.style.display = "block";

    // Refresh status and chain
    await fetchValidation();
    await fetchBlockchain();
  } catch (err) {
    console.error("Register error:", err);
    alert("Error registering image. Please ensure the backend is running at " + API_BASE_URL);
  } finally {
    registerBtn.disabled = false;
    btnText.style.display = "inline";
    btnSpinner.style.display = "none";
  }
});

// -------------------------------------------------------------
// Verify Image Form Submission
// -------------------------------------------------------------
verifyForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!verifyInput.files || verifyInput.files.length === 0) {
    alert("Please select an image to verify.");
    return;
  }

  const file = verifyInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  // Set loading state
  const btnText = verifyBtn.querySelector(".btn-text");
  const btnSpinner = verifyBtn.querySelector(".btn-spinner");
  verifyBtn.disabled = true;
  btnText.style.display = "none";
  btnSpinner.style.display = "inline";

  try {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Verification failed with status ${res.status}`);
    }

    const data = await res.json();

    // Populate general fields
    verResFilename.textContent = data.filename;
    verResImghash.textContent = data.image_hash;
    verifyResMessage.textContent = data.message;

    const authOnlyRows = document.querySelectorAll(".auth-only");

    if (data.result === "Authentic") {
      verifyStatusBadge.className = "badge badge-success";
      verifyStatusBadge.textContent = "✔ Authentic Image";
      verifyResMessage.className = "verify-message authentic";

      verResBlockidx.textContent = `Block #${data.block_index}`;
      verResBlockhash.innerHTML = formatHash(data.block_hash);
      verResTimestamp.textContent = data.block_timestamp || data.timestamp || "N/A";

      authOnlyRows.forEach((row) => (row.style.display = "flex"));
    } else {
      verifyStatusBadge.className = "badge badge-danger";
      verifyStatusBadge.textContent = "✖ Tampered / Unregistered";
      verifyResMessage.className = "verify-message tampered";

      authOnlyRows.forEach((row) => (row.style.display = "none"));
    }

    verifyResult.style.display = "block";
  } catch (err) {
    console.error("Verify error:", err);
    alert("Error verifying image. Please ensure the backend is running at " + API_BASE_URL);
  } finally {
    verifyBtn.disabled = false;
    btnText.style.display = "inline";
    btnSpinner.style.display = "none";
  }
});

// -------------------------------------------------------------
// Refresh Buttons
// -------------------------------------------------------------
refreshAllBtn.addEventListener("click", async () => {
  refreshAllBtn.disabled = true;
  await fetchValidation();
  await fetchBlockchain();
  refreshAllBtn.disabled = false;
});

refreshChainBtn.addEventListener("click", async () => {
  refreshChainBtn.disabled = true;
  await fetchBlockchain();
  refreshChainBtn.disabled = false;
});

// -------------------------------------------------------------
// Tampering Demonstration Handlers
// -------------------------------------------------------------
const demoOrigInput = document.getElementById("demo-orig-input");
const demoOrigFilename = document.getElementById("demo-orig-filename");
const demoRegBtn = document.getElementById("demo-reg-btn");
const demoOrigResult = document.getElementById("demo-orig-result");
const demoResOrigIdx = document.getElementById("demo-res-orig-idx");
const demoResOrigBlockhash = document.getElementById("demo-res-orig-blockhash");
const demoResOrigImghash = document.getElementById("demo-res-orig-imghash");

const demoVerOrigInput = document.getElementById("demo-ver-orig-input");
const demoVerOrigFilename = document.getElementById("demo-ver-orig-filename");
const demoVerOrigBtn = document.getElementById("demo-ver-orig-btn");
const demoVerOrigResult = document.getElementById("demo-ver-orig-result");
const demoResVerImghash = document.getElementById("demo-res-ver-imghash");
const demoResVerIdx = document.getElementById("demo-res-ver-idx");

const demoModInput = document.getElementById("demo-mod-input");
const demoModFilename = document.getElementById("demo-mod-filename");
const demoVerModBtn = document.getElementById("demo-ver-mod-btn");
const demoVerModResult = document.getElementById("demo-ver-mod-result");
const demoResModImghash = document.getElementById("demo-res-mod-imghash");

const comparisonBadge = document.getElementById("comparison-badge");
const compOrigHash = document.getElementById("comp-orig-hash");
const compModHash = document.getElementById("comp-mod-hash");

let demoOriginalHash = null;
let demoOriginalFile = null;
let demoModifiedHash = null;

function updateComparisonBox() {
  if (demoOriginalHash) {
    compOrigHash.textContent = demoOriginalHash;
  }
  if (demoModifiedHash) {
    compModHash.textContent = demoModifiedHash;
  }

  if (demoOriginalHash && demoModifiedHash) {
    if (demoOriginalHash !== demoModifiedHash) {
      comparisonBadge.className = "badge badge-danger";
      comparisonBadge.textContent = "Original Hash ≠ Modified Hash";
    } else {
      comparisonBadge.className = "badge badge-success";
      comparisonBadge.textContent = "Hashes Are Identical";
    }
  }
}

// File picker label listeners
demoOrigInput.addEventListener("change", () => {
  if (demoOrigInput.files.length > 0) {
    demoOriginalFile = demoOrigInput.files[0];
    demoOrigFilename.textContent = demoOriginalFile.name;
    // Auto-update verify original file label if empty
    if (!demoVerOrigInput.files.length) {
      demoVerOrigFilename.textContent = `${demoOriginalFile.name} (from Step 1)`;
    }
  } else {
    demoOrigFilename.textContent = "Choose Original Image";
  }
});

demoVerOrigInput.addEventListener("change", () => {
  if (demoVerOrigInput.files.length > 0) {
    demoVerOrigFilename.textContent = demoVerOrigInput.files[0].name;
  } else {
    demoVerOrigFilename.textContent = "Choose Same Original Image";
  }
});

demoModInput.addEventListener("change", () => {
  if (demoModInput.files.length > 0) {
    demoModFilename.textContent = demoModInput.files[0].name;
  } else {
    demoModFilename.textContent = "Choose Modified Image";
  }
});

// Step 1: Register Original Image
demoRegBtn.addEventListener("click", async () => {
  const file = demoOrigInput.files[0] || demoOriginalFile;
  if (!file) {
    alert("Please choose an original image for Step 1.");
    return;
  }

  const btnText = demoRegBtn.querySelector(".btn-text");
  const btnSpinner = demoRegBtn.querySelector(".btn-spinner");
  demoRegBtn.disabled = true;
  btnText.style.display = "none";
  btnSpinner.style.display = "inline";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`Registration failed: ${res.status}`);
    const data = await res.json();

    demoOriginalHash = data.image_hash;
    demoOriginalFile = file;

    demoResOrigIdx.textContent = `Block #${data.block_index}`;
    demoResOrigBlockhash.innerHTML = formatHash(data.block_hash);
    demoResOrigImghash.textContent = data.image_hash;
    demoOrigResult.style.display = "flex";

    updateComparisonBox();
    await fetchValidation();
    await fetchBlockchain();
  } catch (err) {
    console.error("Demo register error:", err);
    alert("Error registering original image in demo: " + err.message);
  } finally {
    demoRegBtn.disabled = false;
    btnText.style.display = "inline";
    btnSpinner.style.display = "none";
  }
});

// Step 2: Verify Original Image
demoVerOrigBtn.addEventListener("click", async () => {
  const file = demoVerOrigInput.files[0] || demoOriginalFile;
  if (!file) {
    alert("Please select or register the original image first.");
    return;
  }

  const btnText = demoVerOrigBtn.querySelector(".btn-text");
  const btnSpinner = demoVerOrigBtn.querySelector(".btn-spinner");
  demoVerOrigBtn.disabled = true;
  btnText.style.display = "none";
  btnSpinner.style.display = "inline";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`Verification failed: ${res.status}`);
    const data = await res.json();

    demoOriginalHash = data.image_hash;

    demoResVerImghash.textContent = data.image_hash;
    demoResVerIdx.textContent = `Block #${data.block_index}`;
    demoVerOrigResult.style.display = "flex";

    updateComparisonBox();
  } catch (err) {
    console.error("Demo verify error:", err);
    alert("Error verifying original image: " + err.message);
  } finally {
    demoVerOrigBtn.disabled = false;
    btnText.style.display = "inline";
    btnSpinner.style.display = "none";
  }
});

// Step 3: Verify Modified Image
demoVerModBtn.addEventListener("click", async () => {
  const file = demoModInput.files[0];
  if (!file) {
    alert("Please choose a modified or different image for Step 3.");
    return;
  }

  const btnText = demoVerModBtn.querySelector(".btn-text");
  const btnSpinner = demoVerModBtn.querySelector(".btn-spinner");
  demoVerModBtn.disabled = true;
  btnText.style.display = "none";
  btnSpinner.style.display = "inline";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`Verification failed: ${res.status}`);
    const data = await res.json();

    demoModifiedHash = data.image_hash;

    demoResModImghash.textContent = data.image_hash;
    demoVerModResult.style.display = "flex";

    updateComparisonBox();
  } catch (err) {
    console.error("Demo verify modified error:", err);
    alert("Error verifying modified image: " + err.message);
  } finally {
    demoVerModBtn.disabled = false;
    btnText.style.display = "inline";
    btnSpinner.style.display = "none";
  }
});

// -------------------------------------------------------------
// Initial Load on Page Startup
// -------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  fetchValidation();
  fetchBlockchain();
});
