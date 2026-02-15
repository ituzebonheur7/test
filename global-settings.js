function applyGlobalSettings() {
    try {
        const settingsStr = localStorage.getItem('ituzeSettings');
        if (!settingsStr) return;
        const settings = JSON.parse(settingsStr);

        // 1. Theme and Colors
        const theme = settings.theme;
        let color = '#00ff9c'; // default green
        const colorMap = {
            green:  '#00ff9c',
            blue:   '#4da3ff',
            red:    '#ff4d4d',
            yellow: '#ffe44d'
        };
        if (theme === 'custom') {
            color = settings.customColor || '#00ff9c';
        } else {
            color = colorMap[theme] || color;
        }
        document.documentElement.style.setProperty('--accent', color);
        document.documentElement.style.setProperty('--matrix-color', color);

        // 2. Glassmorphism
        const blur = settings.glassmorphism || '26';
        document.documentElement.style.setProperty('--glass-blur', `${blur}px`);

        // 3. Dynamic Background
        if (settings.dynamicBg) {
             if (!document.body.style.backgroundImage.includes('unsplash')) { // prevent refetching
                fetch('https://source.unsplash.com/1920x1080/?calm,nature')
                    .then(response => {
                        if(response.ok) document.body.style.backgroundImage = `url('${response.url}')`;
                    });
             }
        } else {
            document.body.style.backgroundImage = 'radial-gradient(circle at top, #0b1120 0%, #020617 55%, #000 100%)';
        }

        // 4. Custom CSS
        let customStyleEl = document.getElementById('ituze-custom-css');
        if (!customStyleEl) {
            customStyleEl = document.createElement('style');
            customStyleEl.id = 'ituze-custom-css';
            document.head.appendChild(customStyleEl);
        }
        customStyleEl.textContent = settings.customCSS || '';

        // 5. Matrix disable event
        const matrixEvent = new CustomEvent('matrixToggle', { detail: { enabled: !settings.matrix } });
        window.dispatchEvent(matrixEvent);

    } catch (e) {
        console.error("Error applying global settings:", e);
    }
}

window.addEventListener('storage', (event) => {
    if (event.key === 'ituzeSettings') {
        applyGlobalSettings();
    }
});

document.addEventListener('DOMContentLoaded', applyGlobalSettings);
