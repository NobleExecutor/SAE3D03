const API_URL = "https://api.deadlock-api.com";
const HERO_ASSETS_ENDPOINT = "v1/assets/heroes";                    // Hero information
const ABILITY_STATS_ENDPOINT = "v1/analytics/ability-order-stats";  // Ability stats
const LIST_ITEMS = "v1/assets/items";                               // All abilities (IDs &  images)

async function fetchData(endpoint, heroId) {
    try {
        if (!endpoint) {
            throw new Error("Incorrect endpoint");
        }
        else if (endpoint === HERO_ASSETS_ENDPOINT) {
            const response = await fetch(`${API_URL}/${endpoint}/${heroId}`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);

            return data;
        }

        else if (endpoint === ABILITY_STATS_ENDPOINT) {
            const response = await fetch(`${API_URL}/${endpoint}/?hero_id=${heroId}&game_mode=normal&min_matches=100`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);

            return data;
        }

        else if (endpoint === LIST_ITEMS) {
            const response = await fetch(`${API_URL}/${endpoint}`);

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