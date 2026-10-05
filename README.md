# SAE 3D03

Projet de visualisation de données réalisé en **HTML, CSS et JavaScript natif** (sans bibliothèque ni framework).

## Objectif

Le but du projet est de visualiser un jeu de données **complexe** (des objets JavaScript contenant des tableaux et des objets imbriqués) **sans utiliser les représentations classiques** comme les diagrammes en barres ou les graphiques simples. Les données doivent être montrées de manière originale, expressive et interactive.

## Sujet choisi : le Système solaire

Le projet représente le Système solaire en 2D. En cliquant sur une planète, l'affichage zoome dessus et présente ses informations détaillées ainsi que ses lunes.

### Source des données

Les données proviennent de l'API [Le Système Solaire](https://api.le-systeme-solaire.net/) (planètes et lunes). Un script Node.js (`fetch-data.js`) récupère les données une seule fois, les met en forme et les enregistre dans un fichier `data.js`. Le projet fonctionne ensuite sans connexion à l'API.

Pour chaque planète, on conserve au maximum **2 lunes**, choisies parmi les plus célèbres (par exemple Io et Europe pour Jupiter, Titan et Encelade pour Saturne). Elles sont stockées avec toutes leurs informations dans le tableau `moons` de la planète, ce qui donne la structure imbriquée demandée.

### Structure des données

```
planète
├── moons[]            → lunes (objets complets)
├── mass { massValue, massExponent }
├── vol  { volValue, volExponent }
└── semimajorAxis, eccentricity, inclination, sideralOrbit,
    sideralRotation, axialTilt, avgTemp, gravity, escape, density...
```

## Idées de visualisation

Plutôt que des graphiques, chaque donnée est traduite en comportement ou en apparence :

- **Orbites** : forme elliptique (`perihelion`, `aphelion`, `eccentricity`) et vitesse de révolution (`sideralOrbit`)
- **Planète** : inclinaison de l'axe (`axialTilt`), vitesse et sens de rotation (`sideralRotation`)
- **Température** : couleur et lueur de la planète selon `avgTemp`
- **Lunes** : petits corps en orbite autour de la planète zoomée
- **Expériences interactives** : test de chute (`gravity`), vitesse de libération (`escape`), test de flottaison (`density`), « ton âge sur cette planète »

## Technologies

- HTML5, CSS3
- JavaScript (vanilla)
- SVG pour le rendu et les interactions
- Node.js (uniquement pour récupérer les données une fois)

## Lancer le projet

1. Cloner le dépôt.
2. Ouvrir `index.html` dans un navigateur.

Pour régénérer les données (clé API requise) :

1. Renseigner votre clé dans `fetch-data.js` (ne pas la publier sur GitHub).
2. Lancer `node fetch-data.js`.

## Crédits

Données : [Le Système Solaire](https://api.le-systeme-solaire.net/)