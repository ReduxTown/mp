// Roblox Username Generator & Checker
// Uses official: https://auth.roblox.com/v1/usernames/validate?username=...

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
    // Insert random _ in middle-ish
    const pos = Math.floor(Math.random() * (length - 2)) + 1;
    username = username.slice(0, pos) + '_' + username.slice(pos);
  }
  return username;
}

async function checkAvailability(username) {
  try {
    const res = await fetch(`https://auth.roblox.com/v1/usernames/validate?username=${encodeURIComponent(username)}&context=Signup`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    
    if (data.code === 0) return 'available';      // Valid & available
    if (data.code === 1) return 'taken';          // Already taken
    if (data.code === 10) return 'invalid';       // Inappropriate
    return 'invalid';                             // Other errors (too short, etc.)
  } catch (err) {
    console.error(err);
    return 'error';
  }
}

async function scanUsernames(count, length, pattern) {
  resultsGrid.innerHTML = '';
  statusMsg.textContent = `Scanning ${count} usernames... (please wait, rate-limited)`;
  generateBtn.disabled = true;
  speedBtn.disabled = true;

  const promises = [];
  const usernames = [];

  for (let i = 0; i < count; i++) {
    const username = generateUsername(length, pattern);
    usernames.push(username);
    promises.push(checkAvailability(username));
    // Small delay to be nice to API (~200-400ms per request in batch)
    await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
  }

  const results = await Promise.all(promises);

  results.forEach((status, i) => {
    const username = usernames[i];
    const card = document.createElement('div');
    card.className = `result-card ${status}`;
    
    let statusText = status === 'available' ? 'AVAILABLE!' : 
                     status === 'taken' ? 'Taken' : 
                     status === 'invalid' ? 'Invalid' : 'Error';
    
    card.innerHTML = `
      <div class="username">${username}</div>
      <div class="status-text ${status === 'available' ? 'available' : ''}">${statusText}</div>
      ${status === 'available' ? `<button class="copy-btn" data-username="${username}">COPY</button>` : ''}
    `;
    resultsGrid.appendChild(card);
  });

  statusMsg.textContent = `Scan complete! ${results.filter(r => r === 'available').length} available.`;
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
  const quantity = parseInt(document.getElementById('quantity').value) || 10;
  const pattern = document.getElementById('pattern').value;
  scanUsernames(quantity, length, pattern);
});

speedBtn.addEventListener('click', () => {
  const length = parseInt(document.getElementById('length').value) || 7;
  const pattern = document.getElementById('pattern').value;
  scanUsernames(60, length, pattern); // Speed mode: more, but still delayed
});
