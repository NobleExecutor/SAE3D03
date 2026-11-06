(async function renderCharCards() {
    const characters = await fetchData(ENDPOINTS.ALL_HEROES_ASSETS);
    const charGrid = document.querySelector(".char-grid");

    for (const char of characters) {
        charGrid.innerHTML += `
            <div class="char-card">
                <img src="${char.images.icon_hero_card_webp}" height="200px" alt="">
                <div class="char-info">
                    <span class="char-name">${char.name}</span>
                    <p class="char-desc">${char.description.lore}</p>
                    <div class="char-tags">
                        <span class="char-tag">${char.tags[0]}</span>
                        <span class="char-tag">${char.tags[1]}</span>
                        <span class="char-tag">${char.tags[2]}</span>
                    </div>
                </div>
            </div>
        `;
    }
})();