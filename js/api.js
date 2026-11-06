const API_URL = "https://api.deadlock-api.com";
const ENDPOINTS = {
    ALL_HEROES_ASSETS: "v1/assets/heroes/",
    HERO_ASSETS: "v1/assets/heroes",
    ABILITY_STATS: "v1/analytics/ability-order-stats",
    LIST_ITEMS: "v1/assets/items"
};
const FRENCH_PARAM = "language=french";

async function fetchData(endpoint, heroId) {
    try {
        if (endpoint === ENDPOINTS.ALL_HEROES_ASSETS) {
            const response = await fetch(`${API_URL}/${endpoint}?${FRENCH_PARAM}&only_active=true`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);

            return data;
        }

        else if (endpoint === ENDPOINTS.HERO_ASSETS) {
            const response = await fetch(`${API_URL}/${endpoint}/${heroId}?${FRENCH_PARAM}`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);

            return data;
        }

        else if (endpoint === ENDPOINTS.ABILITY_STATS) {
            const response = await fetch(`${API_URL}/${endpoint}/?hero_id=${heroId}&game_mode=normal&min_matches=100`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);

            return data;
        }

        else if (endpoint === ENDPOINTS.LIST_ITEMS) {
            const response = await fetch(`${API_URL}/${endpoint}?${FRENCH_PARAM}`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);

            return data;
        }
    }

    catch (error) {
        console.error(`Error fetching data: ${error}`);
    }
}