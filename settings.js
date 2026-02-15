document.addEventListener('DOMContentLoaded', () => {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const settingsTabs = document.querySelectorAll('.settings-tab');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('/')) return;
            e.preventDefault();

            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('href').substring(1);
            settingsTabs.forEach(tab => {
                tab.classList.toggle('active', tab.id === targetId);
            });
        });
    });

    // General settings elements
    const settings = {
        userName: document.getElementById('userNameInput'),
        theme: document.getElementById('themeSelect'),
        customColor: document.getElementById('customColorInput'),
        customColorHex: document.getElementById('customColorHex'),
        matrix: document.getElementById('toggleMatrix'),
        dynamicBg: document.getElementById('toggleDynamicBackground'),
        glassmorphism: document.getElementById('glassmorphismSlider'),
        dragDrop: document.getElementById('toggleDragDrop'),
        launcherOpacity: document.getElementById('launcherOpacitySelect'),
        launcherCompact: document.getElementById('launcherCompact'),
        searchEngine: document.getElementById('engineSelect'),
        showSuggestions: document.getElementById('toggleSuggestions'),
        voiceAuto: document.getElementById('toggleVoiceAuto'),
        keyboardShortcuts: document.getElementById('toggleKeyboard'),
        openInNewTab: document.getElementById('toggleNewTab'),
        aiSearch: document.getElementById('toggleAiSearch'),
        localOnly: document.getElementById('toggleLocalOnly'),
        mustWinTask: document.getElementById('mustWinTask'),
        ambientSound: document.getElementById('ambientSound'),
        scratchpad: document.getElementById('scratchpad'),
        customCSS: document.getElementById('customCSS'),
        jsonEditor: document.getElementById('jsonEditor'),
        resetStorage: document.getElementById('resetStorage'),
        syncToCloud: document.getElementById('syncToCloud'),
    };

    const pomodoro = {
        time: document.getElementById('pomodoro-time'),
        start: document.getElementById('pomodoro-start'),
        pause: document.getElementById('pomodoro-pause'),
        reset: document.getElementById('pomodoro-reset'),
    };

    // --- Function to save all settings to localStorage ---
    const saveSettings = () => {
        try {
            const config = {
                userName: settings.userName.value || 'Ituze',
                theme: settings.theme.value,
                customColor: settings.customColor.value,
                matrix: settings.matrix.checked,
                dynamicBg: settings.dynamicBg.checked,
                glassmorphism: settings.glassmorphism.value,
                dragDrop: settings.dragDrop.checked,
                launcherOpacity: settings.launcherOpacity.value,
                launcherCompact: settings.launcherCompact.checked,
                searchEngine: settings.searchEngine.value,
                showSuggestions: settings.showSuggestions.checked,
                voiceAuto: settings.voiceAuto.checked,
                keyboardShortcuts: settings.keyboardShortcuts.checked,
                openInNewTab: settings.openInNewTab.checked,
                aiSearch: settings.aiSearch.checked,
                localOnly: settings.localOnly.checked,
                mustWinTask: settings.mustWinTask.value,
                ambientSound: settings.ambientSound.value,
                scratchpad: settings.scratchpad.value,
                customCSS: settings.customCSS.value,
            };
            localStorage.setItem('ituzeSettings', JSON.stringify(config));

            // Raw JSON editor (Power User)
            if (document.activeElement !== settings.jsonEditor) {
                settings.jsonEditor.value = JSON.stringify(config, null, 2);
            }
             window.postMessage({ type: 'settingsUpdated' }, '*');
        } catch (e) {
            console.error("Error saving settings:", e);
        }
    };

    // --- Function to load settings from localStorage ---
    const loadSettings = () => {
        try {
            const config = JSON.parse(localStorage.getItem('ituzeSettings'));
            if (!config) return;

            settings.userName.value = config.userName || '';
            settings.theme.value = config.theme || 'green';
            settings.customColor.value = config.customColor || '#00ff9c';
            settings.customColorHex.value = config.customColor || '#00ff9c';
            settings.matrix.checked = config.matrix || false;
            settings.dynamicBg.checked = config.dynamicBg || false;
            settings.glassmorphism.value = config.glassmorphism || '26';
            settings.dragDrop.checked = config.dragDrop || false;
            settings.launcherOpacity.value = config.launcherOpacity || '0.32';
            settings.launcherCompact.checked = config.launcherCompact || false;
            settings.searchEngine.value = config.searchEngine || 'google';
            settings.showSuggestions.checked = config.showSuggestions !== false;
            settings.voiceAuto.checked = config.voiceAuto || false;
            settings.keyboardShortcuts.checked = config.keyboardShortcuts !== false;
            settings.openInNewTab.checked = config.openInNewTab !== false;
            settings.aiSearch.checked = config.aiSearch || false;
            settings.localOnly.checked = config.localOnly || false;
            settings.mustWinTask.value = config.mustWinTask || '';
            settings.ambientSound.value = config.ambientSound || 'none';
            settings.scratchpad.value = config.scratchpad || '';
            settings.customCSS.value = config.customCSS || '';
            settings.jsonEditor.value = JSON.stringify(config, null, 2);

        } catch (e) {
            console.error("Error loading settings:", e);
        }
    };

    // --- Event Listeners for auto-saving ---
    Object.values(settings).forEach(element => {
        if (element) {
            const eventType = (element.type === 'range' || element.type === 'text' || element.tagName === 'TEXTAREA') ? 'input' : 'change';
            element.addEventListener(eventType, saveSettings);
        }
    });

    // Special handling for JSON editor (parses on blur)
    settings.jsonEditor.addEventListener('blur', () => {
        try {
            const newConfig = JSON.parse(settings.jsonEditor.value);
            localStorage.setItem('ituzeSettings', JSON.stringify(newConfig));
            loadSettings(); // Reload all fields to reflect JSON changes
        } catch (e) {
            alert("Invalid JSON in configuration editor.");
        }
    });
    
    // Clear storage button
    settings.resetStorage.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all local data? This cannot be undone.")) {
            localStorage.clear();
            location.reload();
        }
    });

    // Initial load
    loadSettings();
});
