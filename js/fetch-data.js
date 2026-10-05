// Node 18+ (built-in fetch).
const fs = require("fs");

const API_KEY = "VOTRE_CLE_API";
const URL = "https://api.le-systeme-solaire.net/rest/bodies/";

// L'API n'a pas de filtre de popularité, alors les lunes sont choisis à la main
const NOTABLE_MOONS = {
  Earth: ["Moon"],
  Mars: ["Phobos", "Deimos"],
  Jupiter: ["Io", "Europa"],
  Saturn: ["Titan", "Enceladus"],
  Uranus: ["Titania", "Miranda"],
  Neptune: ["Triton", "Proteus"],
};

(async () => {
  const res = await fetch(URL, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const { bodies } = await res.json();

  // One request returns planets AND moons, so no per-moon calls are needed.
  const planets = bodies.filter((b) => b.isPlanet);

  const result = planets.map((planet) => {
    const name = planet.englishName;
    const hasMoons = Array.isArray(planet.moons) && planet.moons.length > 0;

    let selected = [];
    if (hasMoons) {
      const wanted = NOTABLE_MOONS[name];

      if (wanted) {
        selected = wanted
          .map((moonName) =>
            bodies.find(
              (b) =>
                b.englishName === moonName &&
                b.aroundPlanet &&
                b.aroundPlanet.planet === planet.id
            )
          )
          .filter(Boolean);
      }

      // Fallback: pas de liste (ou la lune n'a pas été trouvé) -> on prend la plus grosse lune
      if (selected.length < Math.min(2, planet.moons.length)) {
        const ids = planet.moons.map((m) => m.rel.split("/").pop());
        const largest = bodies
          .filter((b) => ids.includes(b.id) && !selected.includes(b))
          .sort((a, b) => b.meanRadius - a.meanRadius);
        selected = [...selected, ...largest].slice(0, 2);
      }
    }

    // Remplace {moon, rel} avec l'object complet de la lune
    return { ...planet, moons: selected.slice(0, 2) };
  });

  fs.writeFileSync(
    "js/data.js",
    "const planets = " + JSON.stringify(result, null, 2) + ";\n"
  );
  console.log(`${result.length} planètes enregistrées dans js/data.js`);
})();