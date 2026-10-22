(function drawStars() {
    const canvas = document.querySelector("#starsBg");
    const ctx = canvas.getContext('2d');

    // On récupère la taille de l'écran en hauteur et largeur et la donne aux attributs du canvas
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    for (let i = 0; i <= 150; i++) {
        let x = Math.random() * canvas.width;   // Position x aléatoire
        let y = Math.random() * canvas.height;  // Position y aléatoire
        let radius = Math.random() * 1.5 + 0.5; // Radius aléatoire pour la taille de l'étoile

        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
})();

/* POUR PLUS TARD : couleurs
    Froid (0): #38bdf8
    Chaud(1): #f97316
    Soleil (à part): #fbbf24
    Fallback: #94a3b8
*/

function orNull(value) {
    if (value === 0 || value === "") {
        return null;
    }
    else return value;
}

function normalizeData(data) {
    let moons = [];
    if (data.moons !== null) {
        data.moons.forEach(moon => {
            moons.push({
                "id": moon.id,
                "name": moon.name,
                "englishName": moon.englishName,
                "isPlanet": moon.isPlanet,
                "moons": moon.moons,
                "semimajorAxis": moon.semimajorAxis,
                "perihelion": moon.perihelion,
                "aphelion": moon.aphelion,
                "eccentricity": moon.eccentricity,
                "inclination": moon.inclination,
                "mass": {
                    "massValue": moon.mass.massValue,
                    "massExponent": moon.mass.massExponent
                },
                "vol": {
                    "volValue": moon.vol.volValue,
                    "volExponent": moon.vol.volExponent
                },
                "density": moon.density,
                "gravity": moon.gravity,
                "escape": moon.escape,
                "meanRadius": moon.meanRadius,
                "equaRadius": moon.equaRadius,
                "polarRadius": moon.polarRadius,
                "flattening": moon.flattening,
                "dimension": moon.dimension,
                "sideralOrbit": moon.sideralOrbit,
                "sideralRotation": moon.sideralRotation,
                "aroundPlanet": {
                    "planet": moon.aroundPlanet.planet,
                    "rel": moon.aroundPlanet.rel
                },
                "discoveredBy": moon.discoveredBy,
                "discoveryDate": moon.discoveryDate,
                "alternativeName": moon.alternativeName,
                "axialTilt": moon.axialTilt,
                "avgTemp": moon.avgTemp,
                "mainAnomaly": moon.mainAnomaly,
                "argPeriapsis": moon.argPeriapsis,
                "longAscNode": moon.longAscNode,
                "bodyType": moon.bodyType,
                "rel": moon.rel
            });
        });
    }
    return {
        "id": data.id,
        "name": data.name,
        "englishName": data.englishName,
        "isPlanet": data.isPlanet,
        "moons": [
            {
                "id": data.moons.id,
                "name": "Titania",
                "englishName": "Titania",
                "isPlanet": false,
                "moons": null,
                "semimajorAxis": 436300,
                "perihelion": 435800,
                "aphelion": 436800,
                "eccentricity": 0.0011,
                "inclination": 0.08,
                "mass": {
                    "massValue": 34.2,
                    "massExponent": 20
                },
                "vol": {
                    "volValue": 2.05,
                    "volExponent": 9
                },
                "density": 1.714,
                "gravity": 0,
                "escape": 0,
                "meanRadius": 788.9,
                "equaRadius": 788.9,
                "polarRadius": 0,
                "flattening": 0,
                "dimension": "",
                "sideralOrbit": 8.70587,
                "sideralRotation": 208.9408,
                "aroundPlanet": {
                    "planet": "uranus",
                    "rel": "https://api.le-systeme-solaire.net/rest/bodies/uranus"
                },
                "discoveredBy": "William Herschel",
                "discoveryDate": "11/01/1787",
                "alternativeName": "",
                "axialTilt": 0,
                "avgTemp": 0,
                "mainAnomaly": 0,
                "argPeriapsis": 0,
                "longAscNode": 0,
                "bodyType": "Moon",
                "rel": "https://api.le-systeme-solaire.net/rest/bodies/titania"
            },
            {
                "id": "miranda",
                "name": "Miranda",
                "englishName": "Miranda",
                "isPlanet": false,
                "moons": null,
                "semimajorAxis": 129900,
                "perihelion": 129703,
                "aphelion": 130041,
                "eccentricity": 0.0013,
                "inclination": 4.34,
                "mass": {
                    "massValue": 6.6,
                    "massExponent": 19
                },
                "vol": {
                    "volValue": 5.49,
                    "volExponent": 7
                },
                "density": 1.2,
                "gravity": 0,
                "escape": 0,
                "meanRadius": 240,
                "equaRadius": 235.8,
                "polarRadius": 0,
                "flattening": 0,
                "dimension": "",
                "sideralOrbit": 1.41348,
                "sideralRotation": 33.9235,
                "aroundPlanet": {
                    "planet": "uranus",
                    "rel": "https://api.le-systeme-solaire.net/rest/bodies/uranus"
                },
                "discoveredBy": "Gerard Kuiper",
                "discoveryDate": "16/02/1948",
                "alternativeName": "",
                "axialTilt": 0,
                "avgTemp": 0,
                "mainAnomaly": 0,
                "argPeriapsis": 0,
                "longAscNode": 0,
                "bodyType": "Moon",
                "rel": "https://api.le-systeme-solaire.net/rest/bodies/miranda"
            }
        ],
        "semimajorAxis": orNull(data.semimajorAxis),
        "perihelion": orNull(data.perihelion),
        "aphelion": orNull(data.aphelion),
        "eccentricity": orNull(data.eccentricity),
        "inclination": 0.772,
        "mass": {
            "massValue": 8.68127,
            "massExponent": 25
        },
        "vol": {
            "volValue": 6.833,
            "volExponent": 13
        },
        "density": 1.27,
        "gravity": 8.87,
        "escape": 21380,
        "meanRadius": orNull(data.meanRadius),
        "equaRadius": orNull(data.equaRadius),
        "polarRadius": orNull(data.polarRadius),
        "flattening": 0.02293,
        "dimension": "",
        "sideralOrbit": orNull(data.sideralOrbit),
        "sideralRotation": -17.24,
        "aroundPlanet": null,
        "discoveredBy": orNull(data.discoveredBy),
        "discoveryDate": orNull(data.discoveryDate),
        "alternativeName": orNull(data.alternativeName),
        "axialTilt": 97.77,
        "avgTemp": orNull(data.avgTemp),
        "mainAnomaly": orNull(data.mainAnomaly),
        "argPeriapsis": orNull(data.argPeriapsis),
        "longAscNode": orNull(data.longAscNode),
        "bodyType": "Planet",
        "rel": "https://api.le-systeme-solaire.net/rest/bodies/uranus"
    }
}