(async function renderCharCards() {
    const characters = await fetchData(ENDPOINTS.ALL_HEROES_ASSETS);
    const charGrid = document.querySelector(".char-grid");

    // Trie les personnages par ordre alphabétique
    characters.sort(function (a, b) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
    });

    // Affiche tous les personnages sous forme de cartes avec leurs infos
    for (const char of characters) {
        charGrid.innerHTML += `
            <div class="char-card">
                <img src="${char.images.icon_image_small_webp}" height="150px" alt="Portrait du personnage ${char.name}" loading="lazy">
                <div class="char-info">
                    <span class="char-name">${char.name}</span>
                    <p class="char-desc">${char.description.lore}</p>
                    <div class="char-tags">
                        <span class="char-tag" style="--tag-bg-color: ${char.colors.style_hex}">${char.tags[0]}</span>
                        <span class="char-tag" style="--tag-bg-color: ${char.colors.style_hex}">${char.tags[1]}</span>
                        <span class="char-tag" style="--tag-bg-color: ${char.colors.style_hex}">${char.tags[2]}</span>
                    </div>
                </div>
            </div>
        `;
    }
})();