function applyGlobalSettings() {
    const themeColor = localStorage.getItem('themeColor') || '#00ff9c';
    const matrixEnabled = localStorage.getItem('matrixRain') !== 'false';

    document.documentElement.style.setProperty('--accent', themeColor);
    document.documentElement.style.setProperty('--text-main', themeColor);

    if (matrixEnabled) {
        initMatrix();
    }
}

function initMatrix() {
    const canvas = document.getElementById('matrix');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId = null;

    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const katakana + latin + nums;

    let columns, drops, fontSize;

    function setup() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        fontSize = 16;
        columns = Math.ceil(canvas.width / fontSize);
        drops = Array.from({ length: columns }, () => 1);
    }

    function drawMatrix() {
        ctx.fillStyle = "rgba(0,0,0,0.04)";
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
        if(document.hidden) {
            stopMatrix();
        } else {
            startMatrix();
        }
    });

    startMatrix();
}

function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById("clock");
    const dateEl = document.getElementById("date");
    if (clockEl)
        clockEl.textContent =
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    if(dateEl)
        dateEl.textContent =
        now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

function updateGreeting() {
    const hour = new Date().getHours();
    const userName = localStorage.getItem("userName") || "Ituze";
    let text = `Welcome, ${userName}`;
    if (hour < 12) text = `Good morning, ${userName}`;
    else if (hour < 18) text = `Good afternoon, ${userName}`;
    else text = `Good evening, ${userName}`;
    const greetingEl = document.getElementById("greeting");
    if(greetingEl) greetingEl.textContent = text;
}

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
    if (manual) {
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manual)}&format=json&limit=1`);
            if (!r.ok) throw new Error("geo fail");
            const d = await r.json();
            if (d && d.length) {
                const { lat, lon } = d[0];
                summary = await fetchWeatherByCoordsSimple(lat, lon);
            }
        } catch (e) { /* fallback to geolocation */ }
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
        if(weatherText) weatherText.textContent = `Weather: ${summary}`;
        if(weatherWedge) weatherWedge.setAttribute("aria-hidden", "false");
    } else {
        if(weatherText) weatherText.textContent = `Weather: N/A`;
        if(weatherWedge) weatherWedge.setAttribute("aria-hidden", "true");
    }
}

function updateBatteryDisplay(level, charging) {
    const batteryText = document.getElementById("battery-text");
    const batteryLevelBar = document.getElementById("battery-level-bar");
    const percent = Math.round(level * 100);
    if(batteryText) batteryText.textContent = `Battery: ${percent}%${charging ? " ⚡" : ""}`;
    if(batteryLevelBar) batteryLevelBar.style.width = Math.max(5, percent) + "%";
}




document.addEventListener('DOMContentLoaded', () => {
    applyGlobalSettings();
    updateClock();
    setInterval(updateClock, 1000);
    updateGreeting();

    const weatherWedge = document.getElementById('weatherWedge');
    if(weatherWedge) {
        weatherWedge.addEventListener("click", (e) => {
            e.stopPropagation();
            refreshWeatherWidget();
            // You need a showToast function for this to work
            // showToast("Weather refreshed", 900);
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

    // Handle 'Open links in new tab' setting
    if (localStorage.getItem('openInNewTab') === 'true') {
        document.body.addEventListener('click', e => {
            if (e.target.tagName === 'A' && e.target.href.startsWith('http')) {
                e.preventDefault();
                window.open(e.target.href, '_blank');
            }
        });
    }
});

window.addEventListener('load', applyGlobalSettings);
