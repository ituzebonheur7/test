function updateGreeting() {
    const settings = JSON.parse(localStorage.getItem('ituzeSettings')) || {};
    const userName = settings.userName || "Ituze";
    const hour = new Date().getHours();
    let text = `Welcome, ${userName}`;
    if (hour < 12) text = `Good morning, ${userName}`;
    else if (hour < 18) text = `Good afternoon, ${userName}`;
    else text = `Good evening, ${userName}`;
    document.getElementById("greeting").textContent = text;
}

document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
});

window.addEventListener('storage', (event) => {
    if (event.key === 'ituzeSettings') {
        updateGreeting();
    }
});

function loadGame(url) {
  if (!url) return;
  if (!url.startsWith('http') && !url.startsWith('//')) url = 'https://' + url;

  document.getElementById('gameFrame').src = url;
  document.getElementById('menu').style.display = 'none';
  document.getElementById('stage').style.display = 'flex';
  document.querySelector('.top-btn').style.display = 'none';
  const canvas = document.getElementById('matrix');
  if (canvas) canvas.style.display = 'none';
}

function goBack() {
  document.getElementById('gameFrame').src = 'about:blank';
  document.getElementById('menu').style.display = 'flex';
  document.getElementById('stage').style.display = 'none';
  document.querySelector('.top-btn').style.display = 'flex';
  const canvas = document.getElementById('matrix');
  if (canvas) canvas.style.display = 'block';
}

function toggleFullscreen() {
  const stage = document.getElementById('stage');
  if (!document.fullscreenElement) stage.requestFullscreen();
  else document.exitFullscreen();
}

function addCustomGame() {
  const name = prompt("Enter Game Name:");
  if (!name) return;
  
  const url = prompt("Enter Game URL:");
  if (!url) return;

  const newCard = document.createElement("div");
  newCard.className = "game-card glass";
  newCard.textContent = name;
  newCard.dataset.url = url;

  const list = document.getElementById("gameList");
  list.insertBefore(newCard, list.querySelector(".add-btn"));
}

const customMenu = document.getElementById('custom-menu');
let currentTargetUrl = '';

document.addEventListener('contextmenu', function(e) {
  if (e.target.closest('.top-btn, .btn')) return;
  e.preventDefault();
  const card = e.target.closest('.game-card');
  if (card && !card.classList.contains('add-btn')) {
    currentTargetUrl = card.dataset.url;
    customMenu.style.display = 'block';
    customMenu.style.left = e.pageX + 'px';
    customMenu.style.top = e.pageY + 'px';
  } else {
    customMenu.style.display = 'none';
  }
});

customMenu.addEventListener('click', () => { loadGame(currentTargetUrl); customMenu.style.display = 'none'; });
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('game-card') && !e.target.classList.contains('add-btn')) {
        loadGame(e.target.dataset.url);
    }
    if (e.target.classList.contains('add-btn')) {
        addCustomGame();
    }
    customMenu.style.display = 'none';
});

window.onload = applyGlobalSettings;
