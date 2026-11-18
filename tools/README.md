# tools/ — export des modèles 3D des héros

Les `.glb` servis par l'API (`models.hero_select`) sont exportés avec **un seul clip** par héros, pris dans une liste commune : selon le héros, c'est une pose de menu figée ou un idle, et l'arme peut flotter à côté du personnage quand le clip ne la place pas dans ses mains. Ce dossier refait l'export depuis les fichiers du jeu, en choisissant les clips héros par héros.

`export_hero_models.py` est adapté de [`scripts/export_hero_models.py`](https://github.com/deadlock-api/deadlock-api/blob/master/scripts/export_hero_models.py) du dépôt deadlock-api (mêmes outils, mêmes versions).

## Installation

```bash
bash tools/setup.sh
```

Télécharge dans `tools/vendor/` (ignoré par git) Source2Viewer CLI 20.1 pour le système courant et gltf-transform 4.5.1 (npm). Requiert `curl` et `npm` ; Python 3.10+ suffit, sans dépendance. Sous Windows, lancer `setup.sh` depuis Git Bash, puis le script Python avec `python` ou `py`.

## Fichiers du jeu

Le script lit `pak01_dir.vpk` et ses morceaux `pak01_000.vpk`… (dossier `game/citadel` du jeu). Il les cherche dans cet ordre :

1. `--vpk <chemin>` sur la ligne de commande, ou la variable `DEADLOCK_VPK` : le `.vpk` lui-même ou le dossier du jeu (`…/Deadlock`, `…/Deadlock/game` ou `…/game/citadel`) ;
2. `~/deadlock-vpk/pak01_dir.vpk` (copie locale, voir ci-dessous) ;
3. **détection automatique** dans les bibliothèques Steam (`libraryfolders.vdf`, donc aussi un jeu installé sur un autre disque) :
   - Linux : `~/.local/share/Steam`, `~/.steam/steam`, Flatpak, Snap ;
   - Windows : chemin de Steam lu dans le registre, sinon `C:\Program Files (x86)\Steam` ;
   - macOS : bouteilles CrossOver et Whisky (Deadlock n'a pas de version macOS).

La ligne `Archive : … (build …)` affichée au lancement indique l'archive utilisée. Le cache (`tools/vendor/cache/<build>/`) est rangé par build du jeu : rien à supprimer après une mise à jour.

**macOS + Claude Code** : le dossier du jeu sous `~/Library` (CrossOver) n'est pas accessible à Claude ; on en fait des clones APFS (instantanés, sans place en plus) dans `~/deadlock-vpk`, à refaire après chaque mise à jour du jeu :

```bash
mkdir -p ~/deadlock-vpk
cd "$HOME/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/Deadlock/game/citadel"
cp -c pak01_*.vpk steam.inf ~/deadlock-vpk/
```

## Utilisation (depuis la racine du dépôt)

```bash
python3 tools/export_hero_models.py
```

Sans argument, le script affiche un menu :

1. lister les clips d'animation de héros choisis ;
2. lister les clips de **tous** les héros (~30 s) ;
3. exporter un aperçu des poses ;
4. exporter les modèles du site (tous ceux de `tools/models.json`, ou une partie).

Les héros se donnent par nom (accents et majuscules facultatifs) ou par id, séparés par des espaces : `rem celeste 67`, ou `tous`. Les clips listés sont enregistrés dans `tools/clips.json` (`{ "<hero_id>": { "nom", "modele", "clips": [...] } }`), complété à chaque liste.

Les mêmes actions existent sans menu, pour enchaîner des commandes :

| Commande | Résultat |
|---|---|
| `python3 tools/export_hero_models.py clips Rem` (ou `clips tous`) | liste les clips et les ajoute à `tools/clips.json` |
| `python3 tools/export_hero_models.py apercu 79 67` (ou `apercu tous`) | un `.glb` par héros avec ses poses et idles debout dans `tools/apercu/models/`, et `tools/apercu/clips.json` ; `tous` = les 44 héros actifs de `tools/heros.json` |
| `python3 tools/export_hero_models.py final` (ou `final Rem`) | `assets/models/<hero_id>.glb` avec les clips de `tools/models.json` |

**Aperçu** : servir la racine du dépôt en HTTP (`python3 -m http.server 8000`, ou Live Server de VS Code) puis ouvrir `http://localhost:8000/tools/apercu/`. À gauche l'export du dépôt, un bouton par clip ; à droite le modèle actuel de l'API.

**`models.json`** : `{ "<hero_id>": { "nom": "…", "clips": ["clip par défaut", "autre clip"…], "texture": 1024 } }`. Chaque clip pèse ~75 Ko une fois compressé, on peut donc en garder plusieurs et choisir côté site avec `<model-viewer animation-name="…">`. `texture` : taille maximale des textures (1024 par défaut, 2048 dans l'API).

## Repères

- Build du jeu exportée : 6861 (`steam.inf`).
- Rem (79) : `models/heroes_wip/familiar/familiar_wip.vmdl`, 125 clips. Paige (67) : `models/heroes_wip/bookworm/bookworm.vmdl`, 175 clips. Les variantes `….vnmclip+non_additive` de l'archive sont des doublons, écartés de la liste. Pour les deux, `ui_hero_select` (le clip de l'API) est une pose fixe de 0 s.
- Aperçu des 44 héros : 1,6 à 11,7 Mo par héros (~190 Mo en tout), 8 à 34 clips chacun, textures de 1024 px.
- Liste des clips : exporter toutes les animations d'un héros dépasse la mémoire de la VM de Claude (Dame Geist : plus de 3,7 Go). Le script lit donc les noms des fichiers `.vnmclip` dans l'archive : dossiers des clips cités par les graphes d'animation du modèle (`hero_ui.vnmgraph+<héros>`…) et par leurs sous-graphes (`hero_playercontrol…`), plus `clips/` à côté du modèle et du squelette. Les clips sont parfois loin du modèle (Lyanne : `heroes_staging/tengu/tengu_v2/clips`). Les anciens modèles (Seven, Myxo, Sinclair…) ont en plus des **séquences intégrées** au `.vmdl`, lues dans son bloc `ASEQ` : sans elles, Seven n'avait que 3 clips d'aperçu, Myxo et Sinclair un seul.
- Claude ne peut lancer que des commandes de 3 minutes : l'export de tous les héros se fait par lots, et chaque lot complète `clips.json` (les héros déjà présents sont sautés en passant leurs ids un par un).
- **Textures ORM en BGR sous macOS** : Source2Viewer 20.1 compose lui-même les textures `*_orm_*.png` (R occlusion, G rugosité, B métal) et, sous macOS, inverse le rouge et le bleu. Le modèle devient tout métallique, donc très sombre. `corriger_orm.cjs` (avec le `sharp` de gltf-transform) remet les canaux en ordre après l'export brut, par défaut seulement sous macOS (Linux est correct, Windows non vérifié ; forcer avec `DEADLOCK_ORM_BGR=1` ou `0`). Par ailleurs, les matériaux sans texture de métal reçoivent `metallicFactor: 0`, comme dans l'export de l'API.
- Les vêtements qui traversent le corps ne sont pas corrigés par le script (hypothèse : la simulation des tissus du jeu ne passe pas dans le glTF) : choisir les clips où ça se voit le moins.
