let wallet = null;
let prizePool = 0;

// ===== WALLET INIT =====
window.addEventListener("load", () => {
  if (typeof MDS !== "undefined") {
    wallet = true;
    document.getElementById("walletStatus").innerText = "✅ Wallet Connected";
  }

  startTimer();
  loadEntries();
  loadUser();
});

// ===== TIMER (3 DAYS LOOP) =====
function startTimer() {
  const end = Date.now() + (3 * 24 * 60 * 60 * 1000);

  setInterval(() => {
    const now = Date.now();
    let diff = end - now;

    if (diff < 0) diff = 0;

    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor(diff / 1000 / 60 % 60);
    const s = Math.floor(diff / 1000 % 60);

    document.getElementById("countdown").innerText =
      `${h}:${m}:${s}`;
  }, 1000);
}

// ===== BUY TICKET =====
function buyTicket() {
  if (!wallet) return alert("Wallet not connected");

  MDS.send({
    event: "run",
    data: { command: "send amount:0.0000001 address:YOUR_ADDRESS" }
  }, (res) => {
    console.log(res);
    alert("Ticket Bought");
    loadEntries();
  });
}

// ===== LOAD ENTRIES (FIXED) =====
function loadEntries() {
  if (!wallet) return;

  MDS.send({
    event: "run",
    data: { command: "coins" }
  }, (res) => {
    console.log("ENTRIES:", res);

    let data = res.data || [];

    if (!Array.isArray(data)) data = [];

    const el = document.getElementById("entries");

    if (data.length === 0) {
      el.innerText = "No entries yet";
      return;
    }

    el.innerHTML = data.map(c =>
      `<div>${c.coinid || "unknown"}</div>`
    ).join("");
  });
}

// ===== USER STATS =====
function loadUser() {
  document.getElementById("userStats").innerText = "0 tickets";
}

// ===== DEX SWAP (REAL CALL) =====
function runDexSwap() {
  if (!wallet) return alert("Wallet not connected");

  const amount = document.getElementById("dexAmount").value;

  if (!amount) return alert("Enter amount");

  document.getElementById("dexStatus").innerText = "Processing...";

  MDS.send({
    event: "run",
    data: { command: `dexsell amount:${amount}` }
  }, (res) => {
    console.log("DEX:", res);

    if (res.status) {
      document.getElementById("dexStatus").innerText = "✅ Swap Success";

      // Add fee to prize pool
      prizePool += amount * 0.01;
      updatePrize();
    } else {
      document.getElementById("dexStatus").innerText = "❌ Failed";
    }
  });
}

// ===== UPDATE PRIZE =====
function updatePrize() {
  document.getElementById("prizePool").innerText =
    prizePool.toFixed(6) + " MINIMA";
}
