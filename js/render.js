// Met un texte en minuscules sans accents, pour une recherche tolérante
function normalize(text) {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Met à jour le compteur sous l'en-tête
function updateCount(visible, total) {
    const count = document.querySelector(".char-count");
    const label = visible === total ? `${total} héros` : `${visible} sur ${total} héros`;
    count.textContent = `${label} · tri alphabétique`;
}

(async function renderCharCards() {
    // only_active=true ne renvoie déjà que les héros jouables en jeu
    const characters = await fetchData(ENDPOINTS.ALL_HEROES_ASSETS);
    const charGrid = document.querySelector(".char-grid");
    const searchInput = document.querySelector(".search-input");
    const emptyMessage = document.querySelector(".char-empty");

    if (!characters) return;

    // Trie les personnages par ordre alphabétique (gère les accents : Céleste, Rôdeur…)
    characters.sort((a, b) => a.name.localeCompare(b.name, "fr"));

    // Construit toutes les cartes en une seule chaîne, puis les insère d'un coup
    let html = "";
    for (const char of characters) {
        const tags = char.tags.map(tag => `<span class="char-tag">${tag}</span>`).join("");
        const searchText = normalize([char.name, ...char.tags].join(" "));

        html += `
            <a class="char-card" href="#hero-${char.id}" data-hero-id="${char.id}" data-search="${searchText}"
               style="--hex: ${char.colors.style_hex}; --rgb: ${char.colors.style.join(" ")}">
                <img class="char-icon" src="${char.images.icon_image_small_webp}" width="96" height="96" alt="" loading="lazy">
                <span class="char-name">${char.name}</span>
                <span class="char-tags">${tags}</span>
            </a>
        `;
    }
    charGrid.innerHTML = html;
    updateCount(characters.length, characters.length);

    // Recherche : filtre les cartes sur le nom et les tags
    const cards = charGrid.querySelectorAll(".char-card");
    searchInput.addEventListener("input", function () {
        const query = normalize(searchInput.value.trim());
        let visible = 0;

        for (const card of cards) {
            const match = card.dataset.search.includes(query);
            card.hidden = !match;
            if (match) visible++;
        }

        emptyMessage.hidden = visible > 0;
        updateCount(visible, cards.length);
    });
})();
