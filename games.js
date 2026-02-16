const GAMES_KEY = 'userGames';
const DEFAULT_GAMES = [
    { name: "Geometry Dash", url: "https://ozgames.io/geometry-dash.embed" },
    { name: "Slope 2", url: "https://geometrylitepc.io/slope-2.embed" },
    { name: "Escape Road", url: "https://azgames.io/game/escape-road/" },
    { name: "Traffic Rider", url: "https://azgames.io/game/traffic-road/" },
    { name: "Smash Karts", url: "https://azgames.io/smash-karts.embed" }
];

document.addEventListener('DOMContentLoaded', () => {
    applyGlobalSettings();
    loadGames();

    const stage = document.getElementById('stage');
    const menu = document.getElementById('menu');
    const gameFrame = document.getElementById('gameFrame');
    const gameTitle = document.getElementById('gameTitle');
    const exitBtn = document.getElementById('exitBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const gameSearch = document.getElementById('gameSearch');
    const gameList = document.getElementById('gameList');
    const customMenu = document.getElementById('custom-menu');
    const homeBtn = document.querySelector('.top-btn');
    const matrixCanvas = document.getElementById('matrix');

    let contextTarget = null; // Store the element that was right-clicked

    function loadGame(name, url) {
        if (!url) return;
        if (!url.startsWith('http') && !url.startsWith('//')) {
            url = 'https://' + url;
        }
        gameTitle.textContent = name;
        gameFrame.src = url;
        menu.style.display = 'none';
        stage.style.display = 'flex';
        homeBtn.style.display = 'none';
        if (matrixCanvas) matrixCanvas.style.display = 'none';
    }

    function goBack() {
        gameFrame.src = 'about:blank';
        stage.style.display = 'none';
        menu.style.display = 'flex';
        homeBtn.style.display = 'flex';
        if (matrixCanvas) matrixCanvas.style.display = 'block';
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            stage.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    function saveGames() {
        const games = [];
        document.querySelectorAll('#gameList .game-card:not(.add-btn)').forEach(card => {
            games.push({ name: card.textContent.trim(), url: card.dataset.url });
        });
        localStorage.setItem(GAMES_KEY, JSON.stringify(games));
    }

    function createGameCard(name, url) {
        const card = document.createElement("div");
        card.className = "game-card glass";
        card.textContent = name;
        card.dataset.url = url;
        return card;
    }

    function addNewGame() {
        const name = prompt("Enter the name of the game:");
        if (!name) return;
        const url = prompt("Enter the URL for the game (e.g., https://game.com/embed):");
        if (!url) return;

        const newCard = createGameCard(name, url);
        gameList.insertBefore(newCard, gameList.querySelector(".add-btn"));
        saveGames();
    }

    function loadGames() {
        const addBtn = gameList.querySelector('.add-btn');
        const fragment = document.createDocumentFragment();
        
        // Clear existing game cards but not the add button
        gameList.querySelectorAll('.game-card:not(.add-btn)').forEach(card => card.remove());

        const userGames = JSON.parse(localStorage.getItem(GAMES_KEY) || '[]');
        const allGames = [...DEFAULT_GAMES, ...userGames];
        const uniqueGames = allGames.filter((game, index, self) =>
            index === self.findIndex((g) => g.name === game.name && g.url === game.url)
        );

        uniqueGames.forEach(game => {
            fragment.appendChild(createGameCard(game.name, game.url));
        });
        gameList.insertBefore(fragment, addBtn);
    }

    function filterGames() {
        const searchTerm = gameSearch.value.toLowerCase();
        document.querySelectorAll('#gameList .game-card:not(.add-btn)').forEach(card => {
            const gameName = card.textContent.toLowerCase();
            card.style.display = gameName.includes(searchTerm) ? 'block' : 'none';
        });
    }

    // Event Listeners
    exitBtn.addEventListener('click', goBack);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    gameSearch.addEventListener('input', filterGames);

    gameList.addEventListener('click', (e) => {
        const card = e.target.closest('.game-card');
        if (!card) return;

        if (card.classList.contains('add-btn')) {
            addNewGame();
        } else {
            loadGame(card.textContent.trim(), card.dataset.url);
        }
    });

    // Context Menu Logic
    document.addEventListener('contextmenu', (e) => {
        const card = e.target.closest('.game-card:not(.add-btn)');
        if (card) {
            e.preventDefault();
            contextTarget = card;
            customMenu.style.display = 'block';
            customMenu.style.left = `${e.pageX}px`;
            customMenu.style.top = `${e.pageY}px`;
        } else {
            customMenu.style.display = 'none';
        }
    });

    customMenu.addEventListener('click', () => {
        if (contextTarget) {
            loadGame(contextTarget.textContent.trim(), contextTarget.dataset.url);
        }
        customMenu.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
        if (!customMenu.contains(e.target)) {
            customMenu.style.display = 'none';
        }
    });
});