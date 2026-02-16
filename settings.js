document.addEventListener('DOMContentLoaded', () => {
    applyGlobalSettings();

    const userNameInput = document.getElementById('userNameInput');
    const themeColorPicker = document.getElementById('themeColorPicker');
    const searchEngineSelect = document.getElementById('searchEngineSelect');
    const suggestionsToggle = document.getElementById('suggestionsToggle');
    const autoSearchVoiceToggle = document.getElementById('autoSearchVoiceToggle');
    const keyboardShortcutsToggle = document.getElementById('keyboardShortcutsToggle');
    const openInNewTabToggle = document.getElementById('openInNewTabToggle');
    const weatherLocationInput = document.getElementById('weatherLocationInput');
    const matrixToggle = document.getElementById('matrixToggle');
    const editShortcutsBtn = document.getElementById('editShortcutsBtn');
    const resetStorage = document.getElementById('resetStorage');
    const themePresets = document.querySelectorAll('.preset-btn');

    // Load saved settings
    userNameInput.value = localStorage.getItem('userName') || 'Ituze';
    themeColorPicker.value = localStorage.getItem('themeColor') || '#00ff9c';
    searchEngineSelect.value = localStorage.getItem('searchEngine') || 'google';
    suggestionsToggle.checked = localStorage.getItem('showSuggestions') !== 'false';
    autoSearchVoiceToggle.checked = localStorage.getItem('autoSearchVoice') === 'true';
    keyboardShortcutsToggle.checked = localStorage.getItem('keyboardShortcuts') !== 'false';
    openInNewTabToggle.checked = localStorage.getItem('openInNewTab') !== 'false';
    weatherLocationInput.value = localStorage.getItem('manualWeatherLocation') || '';
    matrixToggle.checked = localStorage.getItem('matrixRain') !== 'false';

    // Set default values for the first three settings
    if (localStorage.getItem('showSuggestions') === null) {
        suggestionsToggle.checked = true;
        localStorage.setItem('showSuggestions', true);
    }
    if (localStorage.getItem('autoSearchVoice') === null) {
        autoSearchVoiceToggle.checked = true;
        localStorage.setItem('autoSearchVoice', true);
    }
    if (localStorage.getItem('keyboardShortcuts') === null) {
        keyboardShortcutsToggle.checked = true;
        localStorage.setItem('keyboardShortcuts', true);
    }


    // Save settings on change
    userNameInput.addEventListener('input', () => localStorage.setItem('userName', userNameInput.value));
    themeColorPicker.addEventListener('input', () => {
        localStorage.setItem('themeColor', themeColorPicker.value);
        applyGlobalSettings();
    });
    searchEngineSelect.addEventListener('change', () => localStorage.setItem('searchEngine', searchEngineSelect.value));
    suggestionsToggle.addEventListener('change', () => localStorage.setItem('showSuggestions', suggestionsToggle.checked));
    autoSearchVoiceToggle.addEventListener('change', () => localStorage.setItem('autoSearchVoice', autoSearchVoiceToggle.checked));
    keyboardShortcutsToggle.addEventListener('change', () => localStorage.setItem('keyboardShortcuts', keyboardShortcutsToggle.checked));
    openInNewTabToggle.addEventListener('change', () => localStorage.setItem('openInNewTab', openInNewTabToggle.checked));
    weatherLocationInput.addEventListener('input', () => localStorage.setItem('manualWeatherLocation', weatherLocationInput.value));
    matrixToggle.addEventListener('change', () => {
        localStorage.setItem('matrixRain', matrixToggle.checked);
        applyGlobalSettings();
    });

    themePresets.forEach(button => {
        button.addEventListener('click', () => {
            const color = button.dataset.color;
            themeColorPicker.value = color;
            localStorage.setItem('themeColor', color);
            applyGlobalSettings();
        });
    });

    editShortcutsBtn.addEventListener('click', () => {
        // This will be handled by the main UI script, which is not ideal.
        // A better approach would be a shared module or a more robust IPC mechanism.
        window.location.href = 'index.html#edit-shortcuts'; // A simple way to signal the main page
    });

    resetStorage.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data and reset to default settings?')) {
            localStorage.clear();
            window.location.reload();
        }
    });
});