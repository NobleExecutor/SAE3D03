const loader = document.querySelector("#loader");

const API_URL = "https://api.deadlock-api.com";
const getHeroes = () => getJSON("v1/assets/heroes", { only_active: true });
const getHero = (id) => getJSON(`v1/assets/heroes/${id}`);
const getItem = (n) => getJSON(`v1/assets/items/${n}`);
const getAbilityStats = (id) => getJSON("v1/analytics/ability-order-stats", { hero_id: id, game_mode: "normal", min_matches: 100 });

async function getJSON(endpoint, params = {}) {
    const query = Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    const url = query ? `${API_URL}/${endpoint}?${query}` : `${API_URL}/${endpoint}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} on ${endpoint}`);
        }

        const data = await response.json();
        console.log(data);

        return data;
    }

    catch (error) {
        console.error(`Error fetching data: ${error}`);
    }

    finally {
        loader.hidden = true;
    }
}