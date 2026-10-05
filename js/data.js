// Structure des données
/*

{
  "id": "terre",                  // String, identifiant de l'astre dans l'API.
  "name": "La Terre",             // String, nom de l'astre (en français).
  "englishName": "Earth",         // String, nom anglais de l'astre.
  "isPlanet": true,               // Booleen, est-ce une planète?
  "moons": [                      // Tableau, lune(s) de l'astre
    {
      [...]
      "aroundPlanet": {           // Objet, pour un satellite, la planète autour de laquelle orbite l'astre.
        "planet": "terre",        // String, nom de la planète
        "rel": "lien"             // String, lien vers l'endpoint API de l'astre
      }
      [...]
  ],
  "semimajorAxis": 149598023,     // Nombre, le demi grand axe (km)
  "perihelion": 147095000,        // Nombre, le périhélie (km)
  "aphelion": 152100000,          // Nombre, l'aphélie (km)
  "eccentricity": 0.0167,         // Nombre, l'aphélie (km)
  "inclination": 0,               // Nombre, l'inclinaison orbitale (°)
  "mass": {                       // Tableau Masse de l'astre (10^n kg)
    "massValue": 5.97237,         // Nombre, masse de l'astre
    "massExponent": 24            // Nombre, valeur de l'exposant
  },
  "vol": {                        // Tableau, volume de l'astre (10^n km^3)
    "volValue": 1.08321,          // Nombre, volume de l'astre
    "volExponent": 12             // Nombre, valeur de l'exposant
  },
  "density": 5.5136,              // Nombre, densité de l'astre (g.cm^3)
  "gravity": 9.80665,             // Nombre, gravité en surface (m.s^-2)
  "escape": 11190,                // Nombre, vitesse d'échappement (m.s^-1)
  "meanRadius": 6371.0084,        // Nombre, le rayon moyen (km)
  "equaRadius": 6378.1366,        // Nombre, le rayon équatorial (km)
  "polarRadius": 6356.8,          // Nombre, le rayon polaire (km)
  "flattening": 0.00335,          // Nombre, l'applatissement (?)
  "dimension": "",                // String, dimension de l'astre en kilomètres sur 3 axes X, Y et Z pour les astres non sphériques.
  "sideralOrbit": 365.256,        // Nombre, la période le révolution de l'astre autour d'un autre astre (le Soleil ou une planète) en jours terrestres.
  "sideralRotation": 23.9345,     // Nombre, la période de rotation de l'astre, le temps nécessaire pour astre pour réaliser un tour sur lui même, en heure.
  "aroundPlanet": null,           // Objet, pour un satellite, la planète autour de laquelle orbite l'astre.
  "discoveredBy": "",             // String, nom du découvreur de l'astre.
  "discoveryDate": "",            // String, date de découverte de l'astre
  "alternativeName": "",          // String, désignation temporaire.
  "axialTilt": 23.4393,           // Nombre, inclinaison sur l'axe.
  "avgTemp": 288,                 // Nombre, température moyenne. (K)
  "mainAnomaly": 358.617,         // Nombre, anomalie moyenne. (°)
  "argPeriapsis": 85.901,         // Nombre, argument du périhélie. (°)
  "longAscNode": 18.272,          // Nombre, nœud ascendant. (°)
  "bodyType": "Planet",           // String, type d'astre : Star, Planet, Dwarf Planet, Asteroid, Comet ou Moon.
  "rel": "lien"                   // String, lien vers l'endpoint API de l'astre
}

*/

const planets = [
  {
    "id": "uranus",
    "name": "Uranus",
    "englishName": "Uranus",
    "isPlanet": true,
    "moons": [
      {
        "id": "titania",
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
    "semimajorAxis": 2870658186,
    "perihelion": 2734998229,
    "aphelion": 3006318143,
    "eccentricity": 0.0457,
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
    "meanRadius": 25362,
    "equaRadius": 25559,
    "polarRadius": 24973,
    "flattening": 0.02293,
    "dimension": "",
    "sideralOrbit": 30685.4,
    "sideralRotation": -17.24,
    "aroundPlanet": null,
    "discoveredBy": "William Herschel",
    "discoveryDate": "13/03/1781",
    "alternativeName": "",
    "axialTilt": 97.77,
    "avgTemp": 76,
    "mainAnomaly": 142.2386,
    "argPeriapsis": 98.862,
    "longAscNode": 73.967,
    "bodyType": "Planet",
    "rel": "https://api.le-systeme-solaire.net/rest/bodies/uranus"
  },
  {
    "id": "neptune",
    "name": "Neptune",
    "englishName": "Neptune",
    "isPlanet": true,
    "moons": [
      {
        "id": "triton",
        "name": "Triton",
        "englishName": "Triton",
        "isPlanet": false,
        "moons": null,
        "semimajorAxis": 354760,
        "perihelion": 354753,
        "aphelion": 354765,
        "eccentricity": 0.00002,
        "inclination": 157.345,
        "mass": {
          "massValue": 2.14,
          "massExponent": 22
        },
        "vol": {
          "volValue": 1.03,
          "volExponent": 10
        },
        "density": 2.05,
        "gravity": 0.78,
        "escape": 0,
        "meanRadius": 1353.4,
        "equaRadius": 1353.4,
        "polarRadius": 0,
        "flattening": 0,
        "dimension": "",
        "sideralOrbit": 5.87685,
        "sideralRotation": 141.0444,
        "aroundPlanet": {
          "planet": "neptune",
          "rel": "https://api.le-systeme-solaire.net/rest/bodies/neptune"
        },
        "discoveredBy": "William Lassell",
        "discoveryDate": "10/10/1846",
        "alternativeName": "",
        "axialTilt": 0,
        "avgTemp": 0,
        "mainAnomaly": 0,
        "argPeriapsis": 0,
        "longAscNode": 0,
        "bodyType": "Moon",
        "rel": "https://api.le-systeme-solaire.net/rest/bodies/triton"
      },
      {
        "id": "protee",
        "name": "Protée",
        "englishName": "Proteus",
        "isPlanet": false,
        "moons": null,
        "semimajorAxis": 117647,
        "perihelion": 0,
        "aphelion": 0,
        "eccentricity": 0.0004,
        "inclination": 0.04,
        "mass": {
          "massValue": 5,
          "massExponent": 19
        },
        "vol": {
          "volValue": 3.87,
          "volExponent": 7
        },
        "density": 1.3,
        "gravity": 0.075,
        "escape": 0,
        "meanRadius": 210,
        "equaRadius": 210,
        "polarRadius": 0,
        "flattening": 0,
        "dimension": "220 x 208 x 202",
        "sideralOrbit": 1.12232,
        "sideralRotation": 0,
        "aroundPlanet": {
          "planet": "neptune",
          "rel": "https://api.le-systeme-solaire.net/rest/bodies/neptune"
        },
        "discoveredBy": "Stephen P. Synnott, Bradford A. Smith",
        "discoveryDate": "16/06/1989",
        "alternativeName": "S/1989 N 1",
        "axialTilt": 0,
        "avgTemp": 0,
        "mainAnomaly": 0,
        "argPeriapsis": 0,
        "longAscNode": 0,
        "bodyType": "Moon",
        "rel": "https://api.le-systeme-solaire.net/rest/bodies/protee"
      }
    ],
    "semimajorAxis": 4498396441,
    "perihelion": 4459753056,
    "aphelion": 4537039826,
    "eccentricity": 0.0113,
    "inclination": 1.769,
    "mass": {
      "massValue": 1.02413,
      "massExponent": 26
    },
    "vol": {
      "volValue": 6.254,
      "volExponent": 13
    },
    "density": 1.638,
    "gravity": 11.15,
    "escape": 23560,
    "meanRadius": 24622,
    "equaRadius": 24764,
    "polarRadius": 24341,
    "flattening": 0.01708,
    "dimension": "",
    "sideralOrbit": 60189,
    "sideralRotation": 16.11,
    "aroundPlanet": null,
    "discoveredBy": "Urbain Le Verrier, John Couch Adams, Johann Galle",
    "discoveryDate": "23/09/1846",
    "alternativeName": "",
    "axialTilt": 28.3,
    "avgTemp": 55,
    "mainAnomaly": 256.228,
    "argPeriapsis": 256.932,
    "longAscNode": 131.823,
    "bodyType": "Planet",
    "rel": "https://api.le-systeme-solaire.net/rest/bodies/neptune"
  },
  {
    "id": "jupiter",
    "name": "Jupiter",
    "englishName": "Jupiter",
    "isPlanet": true,
    "moons": [
      {
        "id": "io",
        "name": "Io",
        "englishName": "Io",
        "isPlanet": false,
        "moons": null,
        "semimajorAxis": 421800,
        "perihelion": 420071,
        "aphelion": 423529,
        "eccentricity": 0.004,
        "inclination": 0.036,
        "mass": {
          "massValue": 8.932,
          "massExponent": 22
        },
        "vol": {
          "volValue": 2.5319,
          "volExponent": 10
        },
        "density": 3.5271,
        "gravity": 1.79,
        "escape": 0,
        "meanRadius": 1821.5,
        "equaRadius": 1821.6,
        "polarRadius": 0,
        "flattening": 0,
        "dimension": "",
        "sideralOrbit": 1.76914,
        "sideralRotation": 42.4593,
        "aroundPlanet": {
          "planet": "jupiter",
          "rel": "https://api.le-systeme-solaire.net/rest/bodies/jupiter"
        },
        "discoveredBy": "Galileo Galilei",
        "discoveryDate": "07/01/1610",
        "alternativeName": "",
        "axialTilt": 0,
        "avgTemp": 0,
        "mainAnomaly": 0,
        "argPeriapsis": 0,
        "longAscNode": 0,
        "bodyType": "Moon",
        "rel": "https://api.le-systeme-solaire.net/rest/bodies/io"
      },
      {
        "id": "europe",
        "name": "Europe",
        "englishName": "Europa",
        "isPlanet": false,
        "moons": null,
        "semimajorAxis": 671100,
        "perihelion": 0,
        "aphelion": 0,
        "eccentricity": 0.009,
        "inclination": 0.466,
        "mass": {
          "massValue": 4.8,
          "massExponent": 22
        },
        "vol": {
          "volValue": 1.5926,
          "volExponent": 10
        },
        "density": 3.0129,
        "gravity": 1.31,
        "escape": 0,
        "meanRadius": 1560.8,
        "equaRadius": 1560.8,
        "polarRadius": 0,
        "flattening": 0,
        "dimension": "",
        "sideralOrbit": 3.55118,
        "sideralRotation": 85.2293,
        "aroundPlanet": {
          "planet": "jupiter",
          "rel": "https://api.le-systeme-solaire.net/rest/bodies/jupiter"
        },
        "discoveredBy": "Galileo Galilei",
        "discoveryDate": "08/01/1610",
        "alternativeName": "",
        "axialTilt": 0,
        "avgTemp": 0,
        "mainAnomaly": 0,
        "argPeriapsis": 0,
        "longAscNode": 0,
        "bodyType": "Moon",
        "rel": "https://api.le-systeme-solaire.net/rest/bodies/europe"
      }
    ],
    "semimajorAxis": 778340821,
    "perihelion": 740379835,
    "aphelion": 816620000,
    "eccentricity": 0.0489,
    "inclination": 1.304,
    "mass": {
      "massValue": 1.89819,
      "massExponent": 27
    },
    "vol": {
      "volValue": 1.43128,
      "volExponent": 15
    },
    "density": 1.3262,
    "gravity": 24.79,
    "escape": 60200,
    "meanRadius": 69911,
    "equaRadius": 71488,
    "polarRadius": 66842,
    "flattening": 0.06499,
    "dimension": "",
    "sideralOrbit": 4332.589,
    "sideralRotation": 9.925,
    "aroundPlanet": null,
    "discoveredBy": "",
    "discoveryDate": "",
    "alternativeName": "",
    "axialTilt": 3.12,
    "avgTemp": 165,
    "mainAnomaly": 20.02,
    "argPeriapsis": 273.442,
    "longAscNode": 100.398,
    "bodyType": "Planet",
    "rel": "https://api.le-systeme-solaire.net/rest/bodies/jupiter"
  },
  {
    "id": "mars",
    "name": "Mars",
    "englishName": "Mars",
    "isPlanet": true,
    "moons": [
      {
        "id": "phobos",
        "name": "Phobos",
        "englishName": "Phobos",
        "isPlanet": false,
        "moons": null,
        "semimajorAxis": 9378,
        "perihelion": 9234,
        "aphelion": 9518,
        "eccentricity": 0.0151,
        "inclination": 1.075,
        "mass": {
          "massValue": 1.06,
          "massExponent": 16
        },
        "vol": {
          "volValue": 5.78361,
          "volExponent": 4
        },
        "density": 1.872,
        "gravity": 0.0057,
        "escape": 11.39,
        "meanRadius": 11.1,
        "equaRadius": 13,
        "polarRadius": 9.1,
        "flattening": 0,
        "dimension": "26.8 × 22.4 × 18.4",
        "sideralOrbit": 0.31891,
        "sideralRotation": 0.7653,
        "aroundPlanet": {
          "planet": "mars",
          "rel": "https://api.le-systeme-solaire.net/rest/bodies/mars"
        },
        "discoveredBy": "Asaph Hall",
        "discoveryDate": "12/08/1877",
        "alternativeName": "",
        "axialTilt": 0,
        "avgTemp": 0,
        "mainAnomaly": 0,
        "argPeriapsis": 0,
        "longAscNode": 0,
        "bodyType": "Moon",
        "rel": "https://api.le-systeme-solaire.net/rest/bodies/phobos"
      },
      {
        "id": "deimos",
        "name": "Deïmos",
        "englishName": "Deimos",
        "isPlanet": false,
        "moons": null,
        "semimajorAxis": 23459,
        "perihelion": 23456,
        "aphelion": 23471,
        "eccentricity": 0.0002,
        "inclination": 1.075,
        "mass": {
          "massValue": 1.4762,
          "massExponent": 15
        },
        "vol": {
          "volValue": 9.9978,
          "volExponent": 3
        },
        "density": 1.471,
        "gravity": 0.003,
        "escape": 5.556,
        "meanRadius": 6.2,
        "equaRadius": 7.8,
        "polarRadius": 5.1,
        "flattening": 0,
        "dimension": "15.0 × 12 × 10.4 ",
        "sideralOrbit": 1.26244,
        "sideralRotation": 30.29856,
        "aroundPlanet": {
          "planet": "mars",
          "rel": "https://api.le-systeme-solaire.net/rest/bodies/mars"
        },
        "discoveredBy": "Asaph Hall",
        "discoveryDate": "12/08/1877",
        "alternativeName": "",
        "axialTilt": 0,
        "avgTemp": 0,
        "mainAnomaly": 0,
        "argPeriapsis": 0,
        "longAscNode": 0,
        "bodyType": "Moon",
        "rel": "https://api.le-systeme-solaire.net/rest/bodies/deimos"
      }
    ],
    "semimajorAxis": 227939200,
    "perihelion": 206700000,
    "aphelion": 249200000,
    "eccentricity": 0.0935,
    "inclination": 1.85,
    "mass": {
      "massValue": 6.41712,
      "massExponent": 23
    },
    "vol": {
      "volValue": 1.6318,
      "volExponent": 11
    },
    "density": 3.9341,
    "gravity": 3.71,
    "escape": 5030,
    "meanRadius": 3389.5,
    "equaRadius": 3396.19,
    "polarRadius": 3376.2,
    "flattening": 0.00589,
    "dimension": "",
    "sideralOrbit": 686.98,
    "sideralRotation": 24.6229,
    "aroundPlanet": null,
    "discoveredBy": "",
    "discoveryDate": "",
    "alternativeName": "",
    "axialTilt": 25.19,
    "avgTemp": 210,
    "mainAnomaly": 19.412,
    "argPeriapsis": 286.231,
    "longAscNode": 49.667,
    "bodyType": "Planet",
    "rel": "https://api.le-systeme-solaire.net/rest/bodies/mars"
  },
  {
    "id": "mercure",
    "name": "Mercure",
    "englishName": "Mercury",
    "isPlanet": true,
    "moons": [],
    "semimajorAxis": 57909050,
    "perihelion": 46001200,
    "aphelion": 69816900,
    "eccentricity": 0.2056,
    "inclination": 7,
    "mass": {
      "massValue": 3.30114,
      "massExponent": 23
    },
    "vol": {
      "volValue": 6.083,
      "volExponent": 10
    },
    "density": 5.4291,
    "gravity": 3.7,
    "escape": 4250,
    "meanRadius": 2439.4,
    "equaRadius": 2440.53,
    "polarRadius": 2439.7,
    "flattening": 0,
    "dimension": "",
    "sideralOrbit": 87.969,
    "sideralRotation": 1407.6,
    "aroundPlanet": null,
    "discoveredBy": "",
    "discoveryDate": "",
    "alternativeName": "",
    "axialTilt": 0.0352,
    "avgTemp": 0,
    "mainAnomaly": 174.796,
    "argPeriapsis": 29.022,
    "longAscNode": 48.378,
    "bodyType": "Planet",
    "rel": "https://api.le-systeme-solaire.net/rest/bodies/mercure"
  },
  {
    "id": "saturne",
    "name": "Saturne",
    "englishName": "Saturn",
    "isPlanet": true,
    "moons": [
      {
        "id": "titan",
        "name": "Titan",
        "englishName": "Titan",
        "isPlanet": false,
        "moons": null,
        "semimajorAxis": 1221865,
        "perihelion": 1186680,
        "aphelion": 1257060,
        "eccentricity": 0.0292,
        "inclination": 0.33,
        "mass": {
          "massValue": 1.3452,
          "massExponent": 23
        },
        "vol": {
          "volValue": 7.14,
          "volExponent": 10
        },
        "density": 1.8814,
        "gravity": 0,
        "escape": 0,
        "meanRadius": 2575,
        "equaRadius": 2574.73,
        "polarRadius": 0,
        "flattening": 0,
        "dimension": "",
        "sideralOrbit": 15.95,
        "sideralRotation": 382.8,
        "aroundPlanet": {
          "planet": "saturne",
          "rel": "https://api.le-systeme-solaire.net/rest/bodies/saturne"
        },
        "discoveredBy": "Christian Huygens",
        "discoveryDate": "25/03/1655",
        "alternativeName": "",
        "axialTilt": 0,
        "avgTemp": 0,
        "mainAnomaly": 0,
        "argPeriapsis": 0,
        "longAscNode": 0,
        "bodyType": "Moon",
        "rel": "https://api.le-systeme-solaire.net/rest/bodies/titan"
      },
      {
        "id": "encelade",
        "name": "Encelade",
        "englishName": "Enceladus",
        "isPlanet": false,
        "moons": null,
        "semimajorAxis": 238042,
        "perihelion": 236830,
        "aphelion": 239066,
        "eccentricity": 0.0045,
        "inclination": 0.019,
        "mass": {
          "massValue": 1.08,
          "massExponent": 20
        },
        "vol": {
          "volValue": 6.71,
          "volExponent": 7
        },
        "density": 1.6096,
        "gravity": 0,
        "escape": 0,
        "meanRadius": 504.2,
        "equaRadius": 252.1,
        "polarRadius": 0,
        "flattening": 0,
        "dimension": "",
        "sideralOrbit": 1.37,
        "sideralRotation": 32.88,
        "aroundPlanet": {
          "planet": "saturne",
          "rel": "https://api.le-systeme-solaire.net/rest/bodies/saturne"
        },
        "discoveredBy": "William Herschel",
        "discoveryDate": "28/08/1789",
        "alternativeName": "",
        "axialTilt": 0,
        "avgTemp": 0,
        "mainAnomaly": 0,
        "argPeriapsis": 0,
        "longAscNode": 0,
        "bodyType": "Moon",
        "rel": "https://api.le-systeme-solaire.net/rest/bodies/encelade"
      }
    ],
    "semimajorAxis": 1426666422,
    "perihelion": 1349823615,
    "aphelion": 1503509229,
    "eccentricity": 0.0565,
    "inclination": 2.485,
    "mass": {
      "massValue": 5.68336,
      "massExponent": 26
    },
    "vol": {
      "volValue": 8.2713,
      "volExponent": 14
    },
    "density": 0.6871,
    "gravity": 10.44,
    "escape": 36090,
    "meanRadius": 58232,
    "equaRadius": 60268,
    "polarRadius": 54364,
    "flattening": 0.09796,
    "dimension": "",
    "sideralOrbit": 10759.22,
    "sideralRotation": 10.656,
    "aroundPlanet": null,
    "discoveredBy": "",
    "discoveryDate": "",
    "alternativeName": "",
    "axialTilt": 26.73,
    "avgTemp": 134,
    "mainAnomaly": 317.02,
    "argPeriapsis": 336.178,
    "longAscNode": 113.759,
    "bodyType": "Planet",
    "rel": "https://api.le-systeme-solaire.net/rest/bodies/saturne"
  },
  {
    "id": "terre",
    "name": "La Terre",
    "englishName": "Earth",
    "isPlanet": true,
    "moons": [
      {
        "id": "lune",
        "name": "La Lune",
        "englishName": "Moon",
        "isPlanet": false,
        "moons": null,
        "semimajorAxis": 384400,
        "perihelion": 363300,
        "aphelion": 405500,
        "eccentricity": 0.0549,
        "inclination": 5.145,
        "mass": {
          "massValue": 7.346,
          "massExponent": 22
        },
        "vol": {
          "volValue": 2.1968,
          "volExponent": 10
        },
        "density": 3.344,
        "gravity": 1.62,
        "escape": 2380,
        "meanRadius": 1737,
        "equaRadius": 1738.1,
        "polarRadius": 1736,
        "flattening": 0.0012,
        "dimension": "",
        "sideralOrbit": 27.3217,
        "sideralRotation": 655.728,
        "aroundPlanet": {
          "planet": "terre",
          "rel": "https://api.le-systeme-solaire.net/rest/bodies/terre"
        },
        "discoveredBy": "",
        "discoveryDate": "",
        "alternativeName": "",
        "axialTilt": 6.68,
        "avgTemp": 0,
        "mainAnomaly": 0,
        "argPeriapsis": 0,
        "longAscNode": 0,
        "bodyType": "Moon",
        "rel": "https://api.le-systeme-solaire.net/rest/bodies/lune"
      }
    ],
    "semimajorAxis": 149598023,
    "perihelion": 147095000,
    "aphelion": 152100000,
    "eccentricity": 0.0167,
    "inclination": 0,
    "mass": {
      "massValue": 5.97237,
      "massExponent": 24
    },
    "vol": {
      "volValue": 1.08321,
      "volExponent": 12
    },
    "density": 5.5136,
    "gravity": 9.80665,
    "escape": 11190,
    "meanRadius": 6371.0084,
    "equaRadius": 6378.1366,
    "polarRadius": 6356.8,
    "flattening": 0.00335,
    "dimension": "",
    "sideralOrbit": 365.256,
    "sideralRotation": 23.9345,
    "aroundPlanet": null,
    "discoveredBy": "",
    "discoveryDate": "",
    "alternativeName": "",
    "axialTilt": 23.4393,
    "avgTemp": 288,
    "mainAnomaly": 358.617,
    "argPeriapsis": 85.901,
    "longAscNode": 18.272,
    "bodyType": "Planet",
    "rel": "https://api.le-systeme-solaire.net/rest/bodies/terre"
  },
  {
    "id": "venus",
    "name": "Vénus",
    "englishName": "Venus",
    "isPlanet": true,
    "moons": [],
    "semimajorAxis": 108208475,
    "perihelion": 107477000,
    "aphelion": 108939000,
    "eccentricity": 0.0067,
    "inclination": 3.39,
    "mass": {
      "massValue": 4.86747,
      "massExponent": 24
    },
    "vol": {
      "volValue": 9.2843,
      "volExponent": 11
    },
    "density": 5.243,
    "gravity": 8.87,
    "escape": 10360,
    "meanRadius": 6051.8,
    "equaRadius": 6051.8,
    "polarRadius": 6051.8,
    "flattening": 0,
    "dimension": "",
    "sideralOrbit": 224.701,
    "sideralRotation": -5832.5,
    "aroundPlanet": null,
    "discoveredBy": "",
    "discoveryDate": "",
    "alternativeName": "",
    "axialTilt": 177.36,
    "avgTemp": 737,
    "mainAnomaly": 50.115,
    "argPeriapsis": 54.78,
    "longAscNode": 76.785,
    "bodyType": "Planet",
    "rel": "https://api.le-systeme-solaire.net/rest/bodies/venus"
  }
];
