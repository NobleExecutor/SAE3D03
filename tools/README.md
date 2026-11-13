# tools/ — export des modèles 3D des héros

Les `.glb` servis par l'API (`models.hero_select`) sont exportés avec **un seul clip** par héros, pris dans une liste commune : selon le héros, c'est une pose de menu figée ou un idle, et l'arme peut flotter à côté du personnage quand le clip ne la place pas dans ses mains. Ce dossier refait l'export depuis les fichiers du jeu, en choisissant les clips héros par héros.

`export_hero_models.py` est adapté de [`scripts/export_hero_models.py`](https://github.com/deadlock-api/deadlock-api/blob/master/scripts/export_hero_models.py) du dépôt deadlock-api (mêmes outils, mêmes versions).

## Installation

```bash
bash tools/setup.sh
```

Télécharge dans `tools/vendor/` (ignoré par git) Source2Viewer CLI 20.1 pour le système courant (macOS ou Linux) et gltf-transform 4.5.1 (npm). Python 3.10+ suffit, sans dépendance.

## Fichiers du jeu

Le script lit `pak01_dir.vpk` et ses morceaux `pak01_000.vpk`… Le dossier du jeu sous `~/Library` (CrossOver) n'est pas accessible à Claude : on en fait des **clones APFS** (instantanés, sans place en plus) dans `~/deadlock-vpk` :

```bash
mkdir -p ~/deadlock-vpk
cd "$HOME/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/Deadlock/game/citadel"
cp -c pak01_*.vpk steam.inf ~/deadlock-vpk/
```

À refaire après une mise à jour du jeu (les clones ne suivent pas les changements), puis supprimer `tools/vendor/cache/heroes.vdata`. Autre emplacement : variable `DEADLOCK_VPK=/chemin/pak01_dir.vpk`.

## Utilisation (depuis la racine du dépôt)

| Commande | Résultat |
|---|---|
| `python3 tools/export_hero_models.py clips 79` | liste tous les clips du modèle de Rem |
| `python3 tools/export_hero_models.py apercu 79 67` (ou `apercu tous`) | un `.glb` par héros avec ses poses et idles debout dans `tools/apercu/models/`, et `tools/apercu/clips.json` ; `tous` = les 44 héros actifs de `tools/heros.json` |
| `python3 tools/export_hero_models.py final` | `assets/models/<hero_id>.glb` avec les clips de `tools/models.json` |

**Aperçu** : servir la racine du dépôt en HTTP (`python3 -m http.server 8000`, ou Live Server de VS Code) puis ouvrir `http://localhost:8000/tools/apercu/`. À gauche l'export du dépôt, un bouton par clip ; à droite le modèle actuel de l'API.

**`models.json`** : `{ "<hero_id>": { "nom": "…", "clips": ["clip par défaut", "autre clip"…], "texture": 1024 } }`. Chaque clip pèse ~75 Ko une fois compressé, on peut donc en garder plusieurs et choisir côté site avec `<model-viewer animation-name="…">`. `texture` : taille maximale des textures (1024 par défaut, 2048 dans l'API).

## Repères

- Build du jeu exportée : 6861 (`steam.inf`).
- Rem (79) : `models/heroes_wip/familiar/familiar_wip.vmdl`, 118 clips. Paige (67) : `models/heroes_wip/bookworm/bookworm.vmdl`, 173 clips. Pour les deux, `ui_hero_select` (le clip de l'API) est une pose fixe de 0 s.
- Aperçu des 44 héros : 0,5 à 5,3 Mo par héros (~125 Mo en tout), 6 à 25 clips chacun, textures de 1024 px. Exceptions : Myxo (35) et Sinclair (60) n'ont qu'un clip exportable (`ui_hero_select`, `primary_stand_idle`) ; Source2Viewer ne trouve pas les autres.
- Liste des clips : exporter toutes les animations d'un héros dépasse la mémoire de la VM de Claude (Dame Geist : plus de 3,7 Go). Le script lit donc les noms des fichiers `.vnmclip` dans l'archive : dossiers des clips cités par les graphes d'animation du modèle (`hero_ui.vnmgraph+<héros>`…), plus `clips/` à côté du modèle et du squelette. Les clips sont parfois loin du modèle (Lyanne : `heroes_staging/tengu/tengu_v2/clips`).
- Claude ne peut lancer que des commandes de 3 minutes : l'export de tous les héros se fait par lots, et chaque lot complète `clips.json` (les héros déjà présents sont sautés en passant leurs ids un par un).
- Les vêtements qui traversent le corps ne sont pas corrigés par le script (hypothèse : la simulation des tissus du jeu ne passe pas dans le glTF) : choisir les clips où ça se voit le moins.
