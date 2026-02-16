const themeColorPicker = document.getElementById('themeColorPicker');
const matrixToggle = document.getElementById('matrixToggle');
const userNameInput = document.getElementById('userNameInput');
const editShortcutsBtn = document.getElementById('editShortcutsBtn');
const searchEngineSelect = document.getElementById('searchEngineSelect');
const suggestionsToggle = document.getElementById('suggestionsToggle');
const weatherLocationInput = document.getElementById('weatherLocationInput');
const resetStorage = document.getElementById('resetStorage');
const presetBtns = document.querySelectorAll('.preset-btn');

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('ituzeSettings')) || {};
    themeColorPicker.value = settings.customColor || '#00ff9c';
    matrixToggle.checked = !settings.matrix;
    userNameInput.value = settings.userName || 'Ituze';
    searchEngineSelect.value = settings.searchEngine || 'google';
    suggestionsToggle.checked = settings.globalSuggestions !== false;
    weatherLocationInput.value = settings.manualWeatherLocation || '';
}

function saveSettings() {
    const settings = {
        customColor: themeColorPicker.value,
        matrix: !matrixToggle.checked,
        userName: userNameInput.value,
        searchEngine: searchEngineSelect.value,
        globalSuggestions: suggestionsToggle.checked,
        manualWeatherLocation: weatherLocationInput.value
    };
    localStorage.setItem('ituzeSettings', JSON.stringify(settings));
    applyGlobalSettings();
}

themeColorPicker.addEventListener('input', saveSettings);
matrixToggle.addEventListener('change', saveSettings);
userNameInput.addEventListener('input', saveSettings);
searchEngineSelect.addEventListener('change', saveSettings);
suggestionsToggle.addEventListener('change', saveSettings);
weatherLocationInput.addEventListener('input', saveSettings);

presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        themeColorPicker.value = btn.dataset.color;
        saveSettings();
    });
});

editShortcutsBtn.addEventListener('click', () => {
    window.open('index.html#edit-shortcuts', '_self');
});

resetStorage.addEventListener('click', () => {
    localStorage.clear();
    window.location.reload();
});

window.addEventListener('load', loadSettings);