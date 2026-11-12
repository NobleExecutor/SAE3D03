# SAE3D03 — Arbre vivant des builds (Deadlock)

Projet de BUT MMI : traiter et afficher des données structurées de façon originale et artistique. Travail solo. Langue du projet, des commentaires et des commits : **français**.

## Stack et contraintes
- HTML, CSS, JavaScript **natifs**, sans framework ni build. Des librairies JS ne sont autorisées que si on les décide ensemble (ex. `<model-viewer>` pour le .glb).
- Le projet **doit contenir des éléments SVG** : l'arbre est dessiné en SVG.
- Pas de `type="module"` pour l'instant : les scripts sont chargés dans l'ordre (`api.js`, `render.js`, `tree.js`) et partagent la portée globale.
- Mettre les réponses de l'API en cache (erreurs 429) et vérifier le CORS.

## Consigne (résumé)
Pour un héros de Deadlock, un arbre vertical des ordres de montée des capacités (`GET /v1/analytics/ability-order-stats`). Le tronc (niveau 1) se divise en branches, une par capacité choisie à chaque niveau.
- **Épaisseur** = popularité. **Couleur** = taux de victoire, rouge → jaune → vert.
- Branches à mauvais taux de victoire : fines, ternes, tombantes.
- Icône ronde de la capacité à chaque nœud.
- **Animations** : l'arbre pousse du tronc vers les feuilles ; les branches faibles se flétrissent.

## Structure du dépôt
- `index.html` : page unique (landing pour l'instant).
- `css/fontface.css` (polices), `css/style.css` (styles).
- `js/api.js` (`fetchData`, `ENDPOINTS`), `js/render.js` (cartes des héros), `js/tree.js` (`buildTree`, trie des séquences).
- `assets/fonts/` : `ValveOccult.woff2`, `ValvePulp.woff2`.

## Conventions
- Commits en français, style conventionnel : `feat(charCards): …`, `fix(…): …`, `style: …`, `content(font): …`, `chore: …`. Un commit par changement logique. Ne committe que si on te le demande.
- Indentation 4 espaces. Noms de classes en kebab-case (`char-card`, `char-tags`).
- Les couleurs et espacements communs sont des variables CSS dans `:root`.

## API (base `https://api.deadlock-api.com`, `language=french` pour les textes)
| Besoin | Endpoint |
|---|---|
| Liste des héros | `GET /v1/assets/heroes?only_active=true&language=french` |
| Détail d'un héros | `GET /v1/assets/heroes/{id}` (tags, `colors.style_hex`, `colors.style` en RGB, `images.*`, `models.hero_select` en .glb, `items.signature1..4`) |
| Détail d'une capacité | `GET /v1/assets/items/{class_name}?language=french` (`id`, `name`, `description` en HTML, `image`) |
| Ordres de montée | `GET /v1/analytics/ability-order-stats?hero_id={id}` (par séquence : `abilities[]`, `avg_upgrade_times_s`, `wins`, `losses`, `matches`, `players`, `total_kills/deaths/assists`) |

- **Lien clé** : l'`id` d'une capacité (items) est la valeur présente dans `abilities[]` des stats.
- Les 4 capacités d'un héros : `items.signature1..4` du détail héros, résolues via `/v1/assets/items/{class_name}`.
- Héros de référence pour les tests : **Rem (79)**, **Paige (67)**.
- Limite : les stats sont **par séquence**. Pour un préfixe ou un rameau, additionner `wins`, `matches`, `kills`… de toutes les séquences qui passent par ce préfixe ; moyenne pondérée pour les temps.

## Décisions de design (à respecter)
- **Couleur d'accent d'un héros = `colors.style_hex` uniquement.** `colors.ui` n'est pas utilisée. Variables : `--hex` (hexadécimal) et `--rgb` (`hero.colors.style.join(' ')`, pour `rgb(var(--rgb) / 22%)`).
- Le rouge, le jaune et le vert de l'arbre sont **réservés au taux de victoire**. L'accent du héros ne sert que pour l'interface (halo, tags, contours, surbrillance de branche), pas pour colorer les branches.
- **Couleur d'une branche** = écart entre le taux de victoire du nœud et la moyenne **de son niveau**, échelle −3 à +3 points (biais de survie : seules ~23-25 % des parties atteignent le niveau 16). Branche faible : écart < −1,5 point.
- **Épaisseur** = `2.5 + 22 × sqrt(parties du nœud / parties du niveau)`.
- **Arbre sur 16 niveaux** (16 points d'amélioration, 16 premiers éléments de `abilities[]`). Branches complètes : les 4 séquences les plus jouées. Rameaux courts : meilleur embranchement alternatif d'un nœud, gardé s'il pèse ≥ 3 % des parties du niveau, prolongé tant qu'il garde ≥ 45 % des parties du nœud précédent, 4 niveaux maximum. Ces seuils règlent la densité de l'arbre.
- Les séquences commencent souvent par la même capacité deux fois : envisager de fusionner ces étapes.
- Clic sur une branche : elle est mise en surbrillance (halo accent), le reste de l'arbre est assombri (~20 %), et ses statistiques s'affichent (séquence, victoires et écart au niveau 16, parties, joueurs, KDA moyen, temps du build complet et de l'ultime). Cliquer ailleurs désélectionne.

## Écrans prévus (maquette Figma)
Figma : https://www.figma.com/design/kbTRjDE5I6H3emwYVLiY73 (fileKey `kbTRjDE5I6H3emwYVLiY73`, page « Maquette »).
1. **Landing** : grille de 6 colonnes (cartes de 200 px, écart de 24 px, tous les héros renvoyés par `only_active=true` triés alphabétiquement, 44 en novembre 2026 ; ne pas filtrer `in_development`, ces héros sont jouables en jeu). Carte = icône ronde de 96 px, nom, 3 tags teintés à la couleur du héros. Au survol, contour à la couleur du héros. Clic → vue héros.
2. **Vue héros** : à gauche l'arbre ; à droite la fiche (nom, 3 tags, modèle 3D `.glb`, lore, stats globales, 4 capacités).
3. **Branche sélectionnée** : variante de la vue héros décrite ci-dessus.

Mesures des tags : hauteur 23 px, padding horizontal 8 px, rayon 999 px, fond couleur du héros à 22 %, bordure à 70 %, texte `#EDE6D6`, 11 px, conteneur flex wrap centré, écart 5 px.

## Typographie
- **Titres** : ValveOccult (une seule graisse, épaisse et irrégulière) → à partir de 14 px seulement, illisible en dessous.
- **Tags, surtitres, étiquettes** : ValvePulp (petites capitales natives : pas de `text-transform`).
- **Texte courant** : IBM Plex Sans (Google Fonts), pour les descriptions, légendes et statistiques.
- Licence des polices Valve : usage « Fan Art » ; redistribution non précisée. Ne pas committer de `.ttf` converti si le dépôt devient public.

## Palette actuelle (`:root`)
`--bg-primary #1E1E1E`, `--bg-secondary #333333`, `--bg-third #444444`, `--text-primary #ffffff`. La maquette Figma utilise un fond `#0E0F12`, des cartes `#1A1C22`, des bordures `#33363D`, un texte `#EDE6D6` et un texte atténué `#94918C` : à aligner si on suit la maquette.

## État du code (à corriger / à faire)
- `render.js` : la variable CSS est écrite `--rbg` (faute de frappe pour `--rgb`) ; le comparateur de `sort` ne renvoie pas `0` en cas d'égalité ; `innerHTML +=` dans la boucle est lent (construire une chaîne puis l'assigner une fois). Les cartes ne sont pas encore cliquables.
- `api.js` : une branche par endpoint avec du code répété, `console.log` partout, **pas de cache**, pas de gestion du 429. À factoriser en une fonction `getJSON(url)` avec cache (mémoire + `sessionStorage`) et nouvel essai après un 429. L'appel des stats ajoute `game_mode=normal&min_matches=100` : à garder ou à ajuster après essais.
- `tree.js` : `buildTree` construit le trie de toutes les séquences ; il reste à tronquer à 16 niveaux, à sélectionner branches et rameaux, puis à calculer épaisseur et couleur.
- Rien encore pour : la vue héros, le rendu SVG, les animations, le modèle 3D, la navigation entre landing et vue héros.

## Travail avec Claude (conversation + Claude Code)
Le projet se travaille à deux endroits :
- **Conversation Claude, projet « SAE3D03 »** : maquette Figma, réflexion sur le design, documents. Le document de passation `claude/maquette-figma.md` du projet décrit la maquette en détail (écrans, ids des nœuds, ids des capacités de Rem et Paige, seuils de l'arbre).
- **Claude Code (ce dépôt)** : implémentation, tests dans le navigateur, commits.

Quand une décision de design change côté code, la noter dans ce fichier (section « Décisions de design ») pour que l'autre côté la retrouve ; et inversement pour la maquette.
