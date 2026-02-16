const SEARCH_ENGINES = {
    google: "https://www.google.com/search?q=",
    bing: "https://www.bing.com/search?q=",
    duckduckgo: "https://duckduckgo.com/?q=",
    brave: "https://search.brave.com/search?q=",
    startpage: "https://www.startpage.com/do/search?q=",
    you: "https://you.com/search?q="
};

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("suggestions");

    if (searchInput) {
        let activeSuggestionIndex = -1;

        function hideSuggestions() {
            if (suggestionsBox) {
                suggestionsBox.innerHTML = "";
                suggestionsBox.style.display = "none";
            }
        }

        function getEngineUrl() {
            const key = localStorage.getItem("searchEngine") || "google";
            return SEARCH_ENGINES[key] || SEARCH_ENGINES.google;
        }

        function openLink(url) {
            if (localStorage.getItem('openInNewTab') === 'true') {
                window.open(url, "_blank");
            } else {
                window.location.href = url;
            }
            searchInput.value = "";
            hideSuggestions();
        }

        function performSearch(query) {
            if (!query || !query.trim()) return;
            const trimmed = query.trim();

            if (trimmed.startsWith(":")) {
                const cmd = trimmed.slice(1).trim();
                const m = cmd.match(/^calc\s+(.+)$/i);
                if (m) {
                    const expr = m[1];
                    try {
                        const result = new Function('return ' + expr)();
                        showInlineSuggestion(`${expr} = ${result}`, `calc result`, expr);
                    } catch (e) {
                        showInlineSuggestion(`Invalid calculation`, `error`);
                    }
                    return;
                }
                showInlineSuggestion(`Unknown command`, `command`);
                return;
            }

            if (/^wiki:/i.test(trimmed)) {
                const term = trimmed.replace(/^wiki:/i, "").trim();
                if (!term) return;
                openLink("https://en.wikipedia.org/w/index.php?search=" + encodeURIComponent(term));
                return;
            }

            if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                openLink(trimmed);
                return;
            } else if (trimmed.includes(".") && !trimmed.includes(" ")) {
                openLink("https://" + trimmed);
                return;
            } else {
                const engineUrl = getEngineUrl();
                openLink(engineUrl + encodeURIComponent(trimmed));
            }
        }

        function showInlineSuggestion(text, meta, originalQuery) {
            if (!suggestionsBox) return;
            suggestionsBox.innerHTML = "";
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.dataset.query = originalQuery || text;
            div.innerHTML = `<span>${text}</span><span class="suggestion-meta">${meta || ""}</span>`;
            div.addEventListener('click', () => {
                performSearch(div.dataset.query);
            });
            suggestionsBox.appendChild(div);
            suggestionsBox.style.display = "block";
            activeSuggestionIndex = -1;
        }

        function updateActiveSuggestion(items) {
            items.forEach((item, index) => {
                if (index === activeSuggestionIndex) {
                    item.classList.add('active');
                    searchInput.value = item.dataset.query;
                } else {
                    item.classList.remove('active');
                }
            });
        }

        searchInput.addEventListener("keydown", e => {
            const items = Array.from(suggestionsBox.querySelectorAll(".suggestion-item"));
            if (e.key === "ArrowDown" && items.length > 0) {
                e.preventDefault();
                activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
                updateActiveSuggestion(items);
            } else if (e.key === "ArrowUp" && items.length > 0) {
                e.preventDefault();
                activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
                updateActiveSuggestion(items);
            } else if (e.key === "Enter") {
                e.preventDefault();
                performSearch(searchInput.value);
            }
        });

        searchInput.addEventListener("input", () => {
            const query = searchInput.value;
            if (query.length > 0 && localStorage.getItem('showSuggestions') !== 'false') {
                // Basic suggestion for now
                showInlineSuggestion(`Search for "${query}"`, `Search`);
            } else {
                hideSuggestions();
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target)) {
                hideSuggestions();
            }
        });
    }
});