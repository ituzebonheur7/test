
const SHORTCUTS_KEY = "userShortcuts";
const DEFAULT_SHORTCUTS = [
  { name: "GitHub", url: "https://github.com" },
  { name: "Google", url: "https://google.com" },
  { name: "Gmail", url: "https://mail.google.com" },
  { name: "YouTube", url: "https://youtube.com" },
  { name: "Amazon", url: "https://amazon.com" },
  { name: "ChatGPT", url: "https://chat.openai.com" },
  { name: "Copilot", url: "https://copilot.microsoft.com/" },
  { name: "Twitter", url: "https://x.com" },
  { name: "Instagram", url: "https://www.instagram.com" },
  { name: "Facebook", url: "https://www.facebook.com" },
  { name: "TikTok", url: "https://www.tiktok.com" },
  { name: "Gemini", url: "https://gemini.google.com" },
  { name: "WhatsApp", url: "https://web.whatsapp.com" },
  { name: "Yahoo", url: "https://yahoo.com" },
  { name: "GitHub Copilot", url: "https://github.com/copilot" }
];

function loadShortcuts() {
  try {
    const saved = localStorage.getItem(SHORTCUTS_KEY);
    return saved ? JSON.parse(saved) : [...DEFAULT_SHORTCUTS];
  } catch {
    return [...DEFAULT_SHORTCUTS];
  }
}

function saveShortcuts(shortcuts) {
  try {
    localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
  } catch {}
}

function renderShortcuts() {
  const shortcuts = loadShortcuts();
  const rows = [
    document.getElementById("shortcutsRow1"),
    document.getElementById("shortcutsRow2"),
    document.getElementById("shortcutsRow3")
  ];

  // Clear all rows
  rows.forEach(row => row.innerHTML = '');

  // Distribute shortcuts across rows
  shortcuts.forEach((shortcut, index) => {
    const rowIndex = Math.floor(index / 5);
    if (rowIndex < rows.length) {
      const a = document.createElement('a');
      a.className = 'shortcut glass';
      a.href = shortcut.url;
      a.textContent = shortcut.name;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        openLinkWithPrefs(shortcut.url);
      });
      rows[rowIndex].appendChild(a);
    }
  });
}

function openShortcutEditor() {
  const shortcuts = loadShortcuts();
  const editor = document.getElementById('shortcutEditor');
  editor.innerHTML = '';

  shortcuts.forEach((shortcut, index) => {
    const div = document.createElement('div');
    div.className = 'shortcut-item';
    div.innerHTML = `
      <input type="text" placeholder="Name" value="${escapeHtml(shortcut.name)}" data-index="${index}" data-field="name">
      <input type="text" placeholder="URL" value="${escapeHtml(shortcut.url)}" data-index="${index}" data-field="url">
      <button class="remove-shortcut" data-index="${index}">×</button>
    `;
    editor.appendChild(div);
  });

  document.getElementById('shortcutModal').classList.add('open');
}

function closeShortcutEditor() {
  document.getElementById('shortcutModal').classList.remove('open');
}

function saveEditedShortcuts() {
  const inputs = document.querySelectorAll('#shortcutEditor input');
  const shortcuts = [];
  const newShortcuts = [];
  
  inputs.forEach(input => {
      const index = input.dataset.index;
      if (!newShortcuts[index]) {
          newShortcuts[index] = {};
      }
      newShortcuts[index][input.dataset.field] = input.value;
  });
  
  newShortcuts.forEach(shortcut => {
      if (shortcut.name && shortcut.url) {
          shortcuts.push(shortcut);
      }
  });

  saveShortcuts(shortcuts);
  renderShortcuts();
  closeShortcutEditor();
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            ''': '&#39;'
        }[match];
    });
}

function openLinkWithPrefs(url) {
    const settings = JSON.parse(localStorage.getItem('ituzeSettings')) || {};
    const openInNewTab = settings.openInNewTab !== false;
    window.open(url, openInNewTab ? '_blank' : '_self');
}

document.getElementById("closeShortcutEditor").addEventListener("click", closeShortcutEditor);
document.getElementById("saveShortcuts").addEventListener("click", saveEditedShortcuts);
document.addEventListener("DOMContentLoaded", renderShortcuts);

const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("suggestions");

searchInput.addEventListener("input", () => {
    const query = searchInput.value;
    if (query.startsWith(":calc")) {
        const expression = query.substring(5).trim();
        try {
            const result = eval(expression);
            suggestionsBox.innerHTML = `<div class="suggestion-item">${result}</div>`;
            suggestionsBox.style.display = "block";
        } catch (error) {
            suggestionsBox.style.display = "none";
        }
    } else if (query.startsWith("wiki:")) {
        const searchTerm = query.substring(5).trim();
        suggestionsBox.innerHTML = `<div class="suggestion-item">Search Wikipedia for "${searchTerm}"</div>`;
        suggestionsBox.style.display = "block";
    } else {
        suggestionsBox.style.display = "none";
    }
});

suggestionsBox.addEventListener("click", (e) => {
    if (e.target.classList.contains("suggestion-item")) {
        searchInput.value = e.target.textContent;
        suggestionsBox.style.display = "none";
    }
});


async function updateBatteryStatus() {
  if ('getBattery' in navigator) {
    const battery = await navigator.getBattery();
    const batteryLevel = Math.round(battery.level * 100);
    const batteryLevelBar = document.getElementById('battery-level-bar');
    const batteryText = document.getElementById('battery-text');

    batteryLevelBar.style.width = `${batteryLevel}%`;
    batteryText.textContent = `Battery: ${batteryLevel}%`;
  } else {
    document.getElementById('battery').style.display = 'none';
  }
}

setInterval(updateBatteryStatus, 5000);
updateBatteryStatus();
