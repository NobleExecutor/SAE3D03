const landing = document.querySelector(".landing");
const heroView = document.querySelector("#heroView");

// Fonction de routing pour récupérer l'ID héro dans l'URL sans avoir à changer de page
async function route() {
    const match = location.hash.match(/^#hero-(\d+)$/); // -> https://regex101.com

    if (!match) {
        landing.hidden = false;
        heroView.hidden = true;
        document.title = "SAE3D03";
        return;
    }

    const heroInfo = await loadHero(match[1]);
    renderHeroView(heroView, heroInfo.hero, heroInfo.abilities);

    landing.hidden = true;
    heroView.hidden = false;
    window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);
route();
