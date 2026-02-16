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
  { name: "Games", url: "games.html" }
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
  } catch (e) {
    console.error("Failed to save shortcuts:", e);
  }
}

function renderShortcuts() {
  const shortcuts = loadShortcuts();
  const rows = [
    document.getElementById("shortcutsRow1"),
    document.getElementById("shortcutsRow2"),
    document.getElementById("shortcutsRow3")
  ].filter(Boolean);

  rows.forEach(row => { row.innerHTML = '' });

  shortcuts.forEach((shortcut, index) => {
    const rowIndex = Math.floor(index / 5);
    if (rowIndex < rows.length) {
      const a = document.createElement('a');
      a.className = 'shortcut glass';
      a.href = shortcut.url;
      a.textContent = shortcut.name;
      rows[rowIndex].appendChild(a);
    }
  });
}

function openShortcutEditor() {
    const editor = document.getElementById('shortcutEditor');
    if (!editor) return;
    editor.innerHTML = ''; // Clear previous content

    const shortcuts = loadShortcuts();
    shortcuts.forEach((shortcut, index) => {
        editor.appendChild(createShortcutInputRow(shortcut, index));
    });

    document.getElementById('shortcutModal').classList.add('open');
}

function createShortcutInputRow(shortcut = { name: '', url: '' }, index = -1) {
    const div = document.createElement('div');
    div.className = 'shortcut-edit-item';
    div.innerHTML = `
        <input type="text" placeholder="Name" value="${escapeHtml(shortcut.name)}" class="shortcut-name-input">
        <input type="text" placeholder="URL" value="${escapeHtml(shortcut.url)}" class="shortcut-url-input">
        <button class="remove-shortcut-btn">×</button>
    `;
    div.querySelector('.remove-shortcut-btn').addEventListener('click', () => {
        div.remove();
    });
    return div;
}

function addNewShortcutToEditor() {
    const editor = document.getElementById('shortcutEditor');
    if (editor) {
        editor.appendChild(createShortcutInputRow());
    }
}

function closeShortcutEditor() {
  document.getElementById('shortcutModal').classList.remove('open');
}

function saveEditedShortcuts() {
  const editor = document.getElementById('shortcutEditor');
  const items = editor.querySelectorAll('.shortcut-edit-item');
  const shortcuts = [];
  items.forEach(item => {
    const name = item.querySelector('.shortcut-name-input').value;
    const url = item.querySelector('.shortcut-url-input').value;
    if (name && url) {
      shortcuts.push({ name, url });
    }
  });

  saveShortcuts(shortcuts);
  renderShortcuts();
  closeShortcutEditor();
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (match) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[match]));
}

function openLinkWithPrefs(url, inBackground = false) {
    const settings = JSON.parse(localStorage.getItem('ituzeSettings')) || {};
    const openInNewTab = settings.openInNewTab !== false;
    if (openInNewTab || inBackground) {
        window.open(url, '_blank');
    } else {
        window.location.href = url;
    }
}

function calculateExpression(expression) {
    // Sanitize to prevent malicious code injection, allowing only numbers, operators, and parentheses
    const sanitizedExpression = expression.replace(/[^-()\d/*+.]/g, '');
    if (sanitizedExpression !== expression) {
        throw new Error("Invalid characters in expression");
    }
    // Use the Function constructor for safer evaluation than eval()
    try {
        return new Function('return ' + sanitizedExpression)();
    } catch (error) {
        throw new Error("Invalid mathematical expression");
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    renderShortcuts();
    updateBatteryStatus();
    if (typeof refreshWeatherWidget === 'function') {
        refreshWeatherWidget();
    }

    // Search
    const searchInput = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("suggestions");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value;
            if (query.startsWith(":calc")) {
                const expression = query.substring(5).trim();
                try {
                    const result = calculateExpression(expression);
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
    }

    if (suggestionsBox) {
        suggestionsBox.addEventListener("click", (e) => {
            if (e.target.classList.contains("suggestion-item")) {
                searchInput.value = e.target.textContent;
                if (typeof performSearch === 'function') {
                    performSearch(searchInput.value);
                }
                suggestionsBox.style.display = "none";
            }
        });
    }

    // Shortcut Editor
    document.getElementById("editShortcutsBtn")?.addEventListener("click", openShortcutEditor);
    document.getElementById("closeShortcutEditor")?.addEventListener("click", closeShortcutEditor);
    document.getElementById("saveShortcuts")?.addEventListener("click", saveEditedShortcuts);
    document.getElementById("addShortcutBtn")?.addEventListener("click", addNewShortcutToEditor);

    // Waffle Menu
    const waffleBtn = document.getElementById("openWaffle");
    const waffleMenu = document.getElementById("waffleMenu");
    const closeWaffle = document.getElementById("closeWaffle");

    waffleBtn?.addEventListener("click", () => waffleMenu?.classList.toggle("open"));
    closeWaffle?.addEventListener("click", () => waffleMenu?.classList.remove("open"));

    // Global Click Handler
    document.addEventListener("click", (e) => {
        // Close context menu
        document.getElementById("contextMenu").style.display = "none";
        
        // Close waffle menu if click is outside
        if (waffleMenu && !waffleBtn.contains(e.target) && !waffleMenu.contains(e.target)) {
            waffleMenu.classList.remove("open");
        }

        // Handle shortcut clicks
        const shortcut = e.target.closest('.shortcut');
        if (shortcut) {
            e.preventDefault();
            openLinkWithPrefs(shortcut.href);
        }
    });

    // Context Menu
    const contextMenu = document.getElementById("contextMenu");
    document.addEventListener("contextmenu", (e) => {
        const link = e.target.closest('a.shortcut');
        if (link) {
            e.preventDefault();
            contextMenu.innerHTML = `
                <div data-url="${link.href}" data-action="foreground">Open in new tab</div>
                <div data-url="${link.href}" data-action="background">Open in background tab</div>
            `;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.display = "block";
        }
    });

    contextMenu?.addEventListener("click", (e) => {
        const url = e.target.dataset.url;
        const action = e.target.dataset.action;
        if (url && action) {
            openLinkWithPrefs(url, action === "background");
            contextMenu.style.display = "none";
        }
    });
});

async function updateBatteryStatus() {
  const batteryElement = document.getElementById('battery');
  if ('getBattery' in navigator && batteryElement) {
    try {
        const battery = await navigator.getBattery();
        const update = () => {
            const level = Math.round(battery.level * 100);
            document.getElementById('battery-level-bar').style.width = `${level}%`;
            document.getElementById('battery-text').textContent = `Battery: ${level}%`;
        };
        update();
        battery.addEventListener('levelchange', update);
    } catch (e) {
        batteryElement.style.display = 'none';
    }
  } else if (batteryElement) {
    batteryElement.style.display = 'none';
  }
}
