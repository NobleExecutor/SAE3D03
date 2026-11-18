const landing = document.querySelector(".landing");
const heroView = document.querySelector("#heroView");
const testP = document.querySelector("#heroIdTest");

async function route() {
    const match = location.hash.match(/^#hero-(\d+)$/);

    if (!match) {
        landing.hidden = false;
        heroView.hidden = true;
        return;
    }

    const hero = await getHero(match[1]);
    heroView.style.setProperty("--hex", hero.colors.style_hex);
    heroView.style.setProperty("--rgb", hero.colors.style.join(" "));
    testP.textContent = hero.name;

    landing.hidden = true;
    heroView.hidden = false;
}

window.addEventListener("hashchange", route);
route();