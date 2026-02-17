// Ethereon Roblox Username Generator & Checker 2026
// Updated for current Roblox validate API quirks (adds birthday to bypass some errors)

const generateBtn = document.getElementById('generate-btn');
const speedBtn = document.getElementById('speed-btn');
const resultsGrid = document.getElementById('results-grid');
const statusMsg = document.getElementById('status');

const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
const lettersOnly = 'abcdefghijklmnopqrstuvwxyz';

function randomChar(useLettersOnly = false) {
  const set = useLettersOnly ? lettersOnly : chars;
  return set[Math.floor(Math.random() * set.length)];
}

function generateUsername(length, pattern = 'random') {
  let username = '';
  for (let i = 0; i < length; i++) {
    username += randomChar(pattern === 'letters');
  }
  if (pattern === 'underscore') {
    const pos = Math.floor(Math.random() * (length - 2)) + 1;
    username = username.slice(0, pos) + '_' + username.slice(pos);
  }
  return username;
}

async function checkAvailability(username) {
  try {
    // Add birthday=1990-01-01 as workaround for "valid birthday required" error
    const url = `https://auth.roblox.com/v1/usernames/validate?username=${encodeURIComponent(username)}&context=Signup&birthday=1990-01-01`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors'  // Important for cross-origin
    });

    if (!res.ok) {
      return { status: 'error', message: `HTTP ${res.status}` };
    }

    const data = await res.json();

    if (data.code === 0) return { status: 'available' };
    if (data.code === 1) return { status: 'taken' };
    if (data.code === 2) return { status: 'error', message: 'API requires auth/birthday – try proxy' };
    if (data.code === 10) return { status: 'invalid' }; // Inappropriate
    return { status: 'invalid', message: data.message || 'Invalid format' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

async function scanUsernames(count, length, pattern) {
  resultsGrid.innerHTML = '';
  statusMsg.textContent = `Scanning ${count} usernames... (throttled to avoid blocks)`;
  generateBtn.disabled = true;
  speedBtn.disabled = true;

  const usernames = [];
  for (let i = 0; i < count; i++) {
    usernames.push(generateUsername(length, pattern));
  }

  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    const result = await checkAvailability(username);

    const card = document.createElement('div');
    card.className = `result-card ${result.status}`;

    let statusText = '';
    if (result.status === 'available') statusText = 'AVAILABLE!';
    else if (result.status === 'taken') statusText = 'Taken';
    else if (result.status === 'invalid') statusText = 'Invalid';
    else statusText = `Error: ${result.message || 'Unknown'}`;

    card.innerHTML = `
      <div class="username">${username}</div>
      <div class="status-text ${result.status === 'available' ? 'available' : ''}">${statusText}</div>
      ${result.status === 'available' ? `<button class="copy-btn" data-username="${username}">COPY</button>` : ''}
    `;
    resultsGrid.appendChild(card);

    // Throttle: 500-800ms delay between requests
    await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
  }

  statusMsg.textContent = `Scan done! Refresh page or try smaller batches if errors occur.`;
  generateBtn.disabled = false;
  speedBtn.disabled = false;
}

// Copy handler
resultsGrid.addEventListener('click', e => {
  if (e.target.classList.contains('copy-btn')) {
    const username = e.target.dataset.username;
    navigator.clipboard.writeText(username).then(() => {
      e.target.textContent = 'COPIED!';
      setTimeout(() => e.target.textContent = 'COPY', 1800);
    });
  }
});

generateBtn.addEventListener('click', () => {
  const length = parseInt(document.getElementById('length').value) || 8;
  const quantity = Math.min(parseInt(document.getElementById('quantity').value) || 10, 50);
  const pattern = document.getElementById('pattern').value;
  scanUsernames(quantity, length, pattern);
});

speedBtn.addEventListener('click', () => {
  const length = parseInt(document.getElementById('length').value) || 7;
  const pattern = document.getElementById('pattern').value;
  scanUsernames(30, length, pattern); // Limited to 30 for speed mode
});
