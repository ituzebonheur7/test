/**
 * REQUIRED HTML STRUCTURE:
 * <canvas id="matrix"></canvas>
 * <div class="container">
 * <div id="greeting"></div>
 * <div id="clock"></div>
 * <div id="date"></div>
 * * * <div class="search-container">
 * <input type="text" id="searchInput" placeholder="Search..." autocomplete="off">
 * </div>
 * * * <div id="links" class="links-container"></div>
 * * <div class="status-bar">
 * <div id="weatherWedge"><span id="weatherText">Weather: Loading...</span></div>
 * <div id="battery-text">Battery: N/A</div>
 * <div id="battery-level-bar"></div>
 * </div>
 * * * <button id="settingsBtn">⚙️</button>
 * </div>
 * * * <div id="settingsModal" class="modal" hidden>
 * <div class="modal-content">
 * <h2>Settings</h2>
 * <label>Name: <input type="text" id="settingName"></label>
 * <label>Theme Color: <input type="color" id="settingColor"></label>
 * <label>Location (City): <input type="text" id="settingLocation"></label>
 * <label><input type="checkbox" id="settingMatrix"> Enable Matrix Rain</label>
 * <label><input type="checkbox" id="settingNewTab"> Open Links in New Tab</label>
 * <button id="saveSettings">Save & Reload</button>
 * <button id="closeSettings">Cancel</button>
 * </div>
 * </div>
 */

// --- Configuration & Default Links ---
const defaultLinks = [
    { name: "GitHub", url: "https://github.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "Reddit", url: "https://reddit.com" },
    { name: "Gmail", url: "https://mail.google.com" }
];

function applyGlobalSettings() {
    const themeColor = localStorage.getItem('themeColor') || '#00ff9c';
    const matrixEnabled = localStorage.getItem('matrixRain') !== 'false';
    const fontFamily = "'Courier New', Courier, monospace";

    document.documentElement.style.setProperty('--accent', themeColor);
    document.documentElement.style.setProperty('--text-main', themeColor);
    document.documentElement.style.setProperty('--font-main', fontFamily);

    // Apply background if matrix is disabled
    if (!matrixEnabled) {
        document.body.style.backgroundColor = "#0d0d0d";
        const canvas = document.getElementById('matrix');
        if (canvas) canvas.style.display = 'none';
    } else {
        const canvas = document.getElementById('matrix');
        if (canvas) canvas.style.display = 'block';
        initMatrix();
    }
}

// --- Matrix Animation (Latin & Numbers Only) ---
function initMatrix() {
    const canvas = document.getElementById('matrix');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Return if matrix is disabled in settings
    if (localStorage.getItem('matrixRain') === 'false') return;

    let animationFrameId = null;

    // Characters definition - KATAKANA REMOVED
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const chars = (latin + nums).split("");

    let columns, drops, fontSize;

    function setup() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        fontSize = 16;
        columns = Math.ceil(canvas.width / fontSize);
        drops = Array.from({ length: columns }, () => 1);
    }

    function drawMatrix() {
        ctx.fillStyle = "rgba(0,0,0,0.05)"; // Trail fade effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent') || "#00ff9c";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    function animate() {
        drawMatrix();
        animationFrameId = requestAnimationFrame(animate);
    }

    function startMatrix() {
        if (!animationFrameId) {
            setup();
            animate();
        }
    }

    function stopMatrix() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    window.addEventListener("resize", () => {
        stopMatrix();
        startMatrix();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopMatrix();
        else startMatrix();
    });

    startMatrix();
}

// --- Clock & Greeting ---
function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById("clock");
    const dateEl = document.getElementById("date");
    if (clockEl)
        clockEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    if (dateEl)
        dateEl.textContent = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

function updateGreeting() {
    const hour = new Date().getHours();
    const userName = localStorage.getItem("userName") || "Ituze";
    let text = `Welcome, ${userName}`;
    if (hour < 12) text = `Good morning, ${userName}`;
    else if (hour < 18) text = `Good afternoon, ${userName}`;
    else text = `Good evening, ${userName}`;
    
    const greetingEl = document.getElementById("greeting");
    if (greetingEl) greetingEl.textContent = text;
}

// --- Weather ---
async function fetchWeatherByCoordsSimple(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current_weather=true&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("weather failed");
        const data = await res.json();
        const cw = data.current_weather;
        if (cw) {
            return `${cw.temperature}°C, wind ${cw.windspeed} km/h`;
        }
    } catch (e) {
        return null;
    }
    return null;
}

async function refreshWeatherWidget() {
    const weatherText = document.getElementById("weatherText");
    const weatherWedge = document.getElementById("weatherWedge");
    const manual = (localStorage.getItem("manualWeatherLocation") || "").trim();
    let summary = null;

    if(weatherText) weatherText.textContent = "Loading Weather...";

    if (manual) {
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manual)}&format=json&limit=1`);
            if (!r.ok) throw new Error("geo fail");
            const d = await r.json();
            if (d && d.length) {
                const { lat, lon } = d[0];
                summary = await fetchWeatherByCoordsSimple(lat, lon);
            }
        } catch (e) { /* fallback */ }
    }
    
    if (!summary && navigator.geolocation) {
        try {
            const pos = await new Promise((res, rej) => {
                const t = setTimeout(() => rej(new Error("geo timeout")), 8000);
                navigator.geolocation.getCurrentPosition(p => { clearTimeout(t); res(p); }, err => { clearTimeout(t); rej(err); }, { timeout: 8000 });
            });
            if (pos && pos.coords) {
                summary = await fetchWeatherByCoordsSimple(pos.coords.latitude, pos.coords.longitude);
            }
        } catch (e) { /* ignore */ }
    }

    if (summary) {
        if (weatherText) weatherText.textContent = `Weather: ${summary}`;
        if (weatherWedge) weatherWedge.setAttribute("aria-hidden", "false");
    } else {
        if (weatherText) weatherText.textContent = `Weather: N/A`;
        if (weatherWedge) weatherWedge.setAttribute("aria-hidden", "true");
    }
}

// --- Battery ---
function updateBatteryDisplay(level, charging) {
    const batteryText = document.getElementById("battery-text");
    const batteryLevelBar = document.getElementById("battery-level-bar");
    const percent = Math.round(level * 100);
    if (batteryText) batteryText.textContent = `Battery: ${percent}%${charging ? " ⚡" : ""}`;
    if (batteryLevelBar) batteryLevelBar.style.width = Math.max(5, percent) + "%";
}

// --- Search Functionality ---
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                const newTab = localStorage.getItem('openInNewTab') === 'true';
                if (newTab) window.open(url, '_blank');
                else window.location.href = url;
                searchInput.value = '';
            }
        }
    });
}

// --- Links/Bookmarks ---
function initLinks() {
    const linksContainer = document.getElementById('links');
    if (!linksContainer) return;

    linksContainer.innerHTML = ''; 

    defaultLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = `[ ${link.name} ]`;
        a.className = "link-item";
        a.style.margin = "0 10px";
        a.style.color = "var(--accent)";
        a.style.textDecoration = "none";
        a.style.fontWeight = "bold";
        
        if (localStorage.getItem('openInNewTab') === 'true') {
            a.target = "_blank";
        }

        linksContainer.appendChild(a);
    });
}

// --- Settings UI ---
function initSettingsUI() {
    const modal = document.getElementById('settingsModal');
    const btn = document.getElementById('settingsBtn');
    const closeBtn = document.getElementById('closeSettings');
    const saveBtn = document.getElementById('saveSettings');

    if (!modal || !btn) return;

    // Load current values into inputs
    function loadValues() {
        document.getElementById('settingName').value = localStorage.getItem('userName') || "Ituze";
        document.getElementById('settingColor').value = localStorage.getItem('themeColor') || '#00ff9c';
        document.getElementById('settingLocation').value = localStorage.getItem('manualWeatherLocation') || "";
        document.getElementById('settingMatrix').checked = localStorage.getItem('matrixRain') !== 'false';
        document.getElementById('settingNewTab').checked = localStorage.getItem('openInNewTab') === 'true';
    }

    btn.addEventListener('click', () => {
        loadValues();
        modal.hidden = false;
        modal.style.display = "flex";
    });

    const closeModal = () => {
        modal.hidden = true;
        modal.style.display = "none";
    };

    closeBtn.addEventListener('click', closeModal);

    saveBtn.addEventListener('click', () => {
        localStorage.setItem('userName', document.getElementById('settingName').value);
        localStorage.setItem('themeColor', document.getElementById('settingColor').value);
        localStorage.setItem('manualWeatherLocation', document.getElementById('settingLocation').value);
        localStorage.setItem('matrixRain', document.getElementById('settingMatrix').checked);
        localStorage.setItem('openInNewTab', document.getElementById('settingNewTab').checked);
        
        closeModal();
        applyGlobalSettings(); 
        updateGreeting();      
        refreshWeatherWidget(); 
        window.location.reload(); 
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    applyGlobalSettings();
    updateClock();
    setInterval(updateClock, 1000);
    updateGreeting();
    
    initSearch();
    initLinks();
    initSettingsUI();

    const weatherWedge = document.getElementById('weatherWedge');
    if (weatherWedge) {
        weatherWedge.addEventListener("click", (e) => {
            e.stopPropagation();
            refreshWeatherWidget();
        });
        refreshWeatherWidget();
    }

    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            updateBatteryDisplay(battery.level, battery.charging);
            battery.addEventListener("levelchange", () => updateBatteryDisplay(battery.level, battery.charging));
            battery.addEventListener("chargingchange", () => updateBatteryDisplay(battery.level, battery.charging));
        }).catch(() => { 
            const batteryText = document.getElementById("battery-text");
            if(batteryText) batteryText.textContent = "Battery: N/A"; 
        });
    } else {
        const batteryText = document.getElementById("battery-text");
        if(batteryText) batteryText.textContent = "Battery: N/A";
    }

    if (localStorage.getItem('openInNewTab') === 'true') {
        document.body.addEventListener('click', e => {
            if (e.target.tagName === 'A' && e.target.href.startsWith('http')) {
                if (!e.target.getAttribute('target')) {
                    e.preventDefault();
                    window.open(e.target.href, '_blank');
                }
            }
        });
    }
});

window.addEventListener('load', applyGlobalSettings);
