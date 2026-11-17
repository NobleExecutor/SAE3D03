#!/usr/bin/env python3
"""Exporte les modèles 3D des héros de Deadlock en .glb pour le site.

Adapté de scripts/export_hero_models.py du dépôt deadlock-api
(https://github.com/deadlock-api/deadlock-api). Différences :
- on choisit les héros (par hero_id) et le ou les clips d'animation de chacun,
  au lieu d'un seul clip pris dans une liste commune à tous les héros ;
- un mode « apercu » exporte toutes les poses et idles utiles d'un héros dans un
  seul .glb, pour les comparer dans tools/apercu/index.html ;
- pas besoin d'uv ni de Python 3.12 : la bibliothèque standard suffit.

Ce qui est repris tel quel : l'export par Source2Viewer, le masquage des
maillages que le jeu cache par défaut (bodygroups), la compression par
gltf-transform (meshopt + textures WebP).

Usage (depuis la racine du dépôt, après bash tools/setup.sh) :
    python3 tools/export_hero_models.py
        -> menu interactif
Ou directement (héros = ids et/ou noms, ou « tous ») :
    python3 tools/export_hero_models.py clips Rem 67     (ou « clips tous »)
        -> liste les clips, enregistrés dans tools/clips.json
    python3 tools/export_hero_models.py apercu 79 67     (ou « apercu tous »)
        -> tools/apercu/models/<hero_id>.glb + tools/apercu/clips.json
    python3 tools/export_hero_models.py final [héros…]
        -> assets/models/<hero_id>.glb, d'après tools/models.json

Archives du jeu (Linux, macOS, Windows), dans l'ordre :
    --vpk <chemin> ou variable DEADLOCK_VPK (le pak01_dir.vpk ou le dossier du jeu),
    sinon ~/deadlock-vpk/pak01_dir.vpk (clones APFS, voir tools/README.md),
    sinon détection automatique dans les bibliothèques Steam.
"""

import json
import os
import platform
import re
import struct
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path, PurePosixPath

TOOLS = Path(__file__).resolve().parent
ROOT = TOOLS.parent
VENDOR = TOOLS / "vendor"

# Clips gardés dans l'aperçu : poses de menu et idles debout.
APERCU_GARDE = re.compile(r"idle|^ui_|pose|select|roster|shop|menu|postgame|bindpose")
APERCU_EXCLU = re.compile(
    r"\.vnmclip|_up$|_down$|crouch|rope|climb|landing|^aim_|reload|shoot|melee|respawn|to_occ|sprint|run_|walk|jump|slide|zipline"
)

MODEL_RE = re.compile(r'm_strModelName\s*=\s*resource_name:"([^"]+\.vmdl)"')
HERO_ID_RE = re.compile(r"m_HeroID\s*=\s*(\d+)")
MESH_RE = re.compile(r'm_Name = "([^"]+)"\s+m_nMeshIndex = (\d+)')
DEFAULT_MASK_RE = re.compile(r"m_nDefaultMeshGroupMask = (\d+)")
GROUP_MASKS_RE = re.compile(r"m_refMeshGroupMasks = \s*\[([^\]]*)\]")


# --- Outils et chemins ---------------------------------------------------------

SYSTEME = platform.system()  # "Linux", "Darwin" (macOS) ou "Windows"
DEADLOCK_APP_ID = "1422450"
# Chemin de l'archive à partir du dossier d'installation du jeu (…/common/Deadlock).
VPK_DANS_LE_JEU = Path("game", "citadel", "pak01_dir.vpk")


def source2viewer() -> str:
    systeme = {"Darwin": "macos", "Linux": "linux", "Windows": "windows"}.get(SYSTEME)
    arch = {"arm64": "arm64", "aarch64": "arm64", "x86_64": "x64", "amd64": "x64"}.get(platform.machine().lower())
    if systeme is None or arch is None:
        sys.exit(f"Système non géré : {SYSTEME} {platform.machine()}")
    nom = "Source2Viewer-CLI.exe" if SYSTEME == "Windows" else "Source2Viewer-CLI"
    exe = VENDOR / "source2viewer" / f"cli-{systeme}-{arch}" / nom
    if not exe.is_file():
        sys.exit("Source2Viewer introuvable : lancer d'abord bash tools/setup.sh")
    return str(exe)


def gltf_transform() -> str:
    nom = "gltf-transform.cmd" if SYSTEME == "Windows" else "gltf-transform"
    exe = VENDOR / "node_modules" / ".bin" / nom
    if not exe.is_file():
        sys.exit("gltf-transform introuvable : lancer d'abord bash tools/setup.sh")
    return str(exe)


def dossiers_steam() -> list[Path]:
    """Dossiers d'installation de Steam possibles selon le système."""
    home = Path.home()
    if SYSTEME == "Windows":
        dossiers = []
        try:
            import winreg
            for racine, cle, valeur in (
                (winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam", "SteamPath"),
                (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Valve\Steam", "InstallPath"),
                (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Valve\Steam", "InstallPath"),
            ):
                try:
                    with winreg.OpenKey(racine, cle) as k:
                        dossiers.append(Path(winreg.QueryValueEx(k, valeur)[0]))
                except OSError:
                    pass
        except ImportError:
            pass
        pf = os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)")
        return dossiers + [Path(pf) / "Steam"]
    if SYSTEME == "Darwin":
        # Deadlock n'existe pas pour macOS : Steam Windows dans CrossOver ou Whisky.
        bouteilles = [
            home / "Library/Application Support/CrossOver/Bottles",
            home / "Library/Containers/com.isaacmarovitz.Whisky/Bottles",
        ]
        dossiers = [home / "Library/Application Support/Steam"]
        for b in bouteilles:
            dossiers += sorted(b.glob("*/drive_c/Program Files (x86)/Steam"))
        return dossiers
    # Linux : installation native, liens ~/.steam, Flatpak, Snap.
    return [
        home / ".local/share/Steam",
        home / ".steam/steam",
        home / ".steam/root",
        home / ".var/app/com.valvesoftware.Steam/.local/share/Steam",
        home / "snap/steam/common/.local/share/Steam",
    ]


def bibliotheques_steam(steam: Path) -> list[Path]:
    """Bibliothèques Steam déclarées dans libraryfolders.vdf (le jeu peut être
    installé sur un autre disque que Steam lui-même)."""
    biblios = [steam]
    vdf = steam / "steamapps" / "libraryfolders.vdf"
    try:
        texte = vdf.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return biblios
    for chemin in re.findall(r'"path"\s+"([^"]+)"', texte):
        # Les antislashs sont doublés dans le .vdf sous Windows.
        biblios.append(Path(chemin.replace("\\\\", "\\")))
    return biblios


def vpk_depuis(chemin: Path) -> Path | None:
    """Accepte le .vpk lui-même ou un dossier : …/game/citadel, …/game ou …/Deadlock."""
    if chemin.is_file():
        return chemin
    for sous in (Path("pak01_dir.vpk"), Path("citadel", "pak01_dir.vpk"), VPK_DANS_LE_JEU):
        if (chemin / sous).is_file():
            return chemin / sous
    return None


_VPK: Path | None = None


def vpk() -> Path:
    """Trouve pak01_dir.vpk, dans l'ordre :
    1. option --vpk ou variable DEADLOCK_VPK (fichier ou dossier du jeu) ;
    2. copie locale ~/deadlock-vpk (clones APFS sur macOS) ;
    3. détection automatique dans les bibliothèques Steam du système.
    """
    global _VPK
    if _VPK is not None:
        return _VPK
    explicite = os.environ.get("DEADLOCK_VPK")
    if explicite:
        trouve = vpk_depuis(Path(explicite).expanduser())
        if trouve is None:
            sys.exit(f"DEADLOCK_VPK ne mène à aucun pak01_dir.vpk : {explicite}")
        _VPK = trouve
        return _VPK
    candidats = [Path.home() / d / "pak01_dir.vpk" for d in ("deadlock-vpk", "mnt/deadlock-vpk")]
    vus = set()
    for steam in dossiers_steam():
        for biblio in bibliotheques_steam(steam):
            if biblio.is_dir():
                cle = biblio.resolve()
                if cle not in vus:
                    vus.add(cle)
                    candidats.append(biblio / "steamapps" / "common" / "Deadlock" / VPK_DANS_LE_JEU)
    for c in candidats:
        if c.is_file():
            _VPK = c
            return _VPK
    sys.exit("pak01_dir.vpk introuvable : passer --vpk <chemin> ou définir DEADLOCK_VPK "
             "(le .vpk, ou le dossier d'installation de Deadlock). Voir tools/README.md")


def build_du_jeu() -> str:
    """Numéro de build (ClientVersion de steam.inf, à côté du .vpk)."""
    try:
        texte = (vpk().parent / "steam.inf").read_text(encoding="utf-8", errors="replace")
        m = re.search(r"ClientVersion=(\d+)", texte)
        if m:
            return m.group(1)
    except OSError:
        pass
    return "inconnu"


def cache() -> Path:
    """Cache par build du jeu : une mise à jour du jeu repart d'un cache vide."""
    dossier = VENDOR / "cache" / build_du_jeu()
    dossier.mkdir(parents=True, exist_ok=True)
    return dossier


def s2v(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run([source2viewer(), "-i", str(vpk()), *args],
                          capture_output=True, text=True, encoding="utf-8", errors="replace")


# --- Lecture des données du jeu ------------------------------------------------

def modeles_des_heros() -> dict[int, str]:
    """hero_id -> chemin du .vmdl, lu dans scripts/heroes.vdata (extrait une fois)."""
    vdata = cache() / "heroes.vdata"
    if not vdata.is_file():
        # Un seul fichier en entrée : -o est le chemin du fichier de sortie.
        s2v("-d", "-f", "scripts/heroes.vdata_c", "-o", str(vdata))
    texte = vdata.read_text(encoding="utf-8")
    modeles = {}
    # Dans chaque bloc de héros, m_HeroID précède m_strModelName.
    for bloc in re.split(r"\n\t(?=\w+ =\s*\n\t\{)", texte):
        hid, mod = HERO_ID_RE.search(bloc), MODEL_RE.search(bloc)
        if hid and mod:
            modeles[int(hid.group(1))] = mod.group(1)
    return modeles


def read_glb(path: Path) -> tuple[dict, bytes]:
    data = path.read_bytes()
    json_len = struct.unpack_from("<I", data, 12)[0]
    return json.loads(data[20 : 20 + json_len]), data[20 + json_len :]


def write_glb(path: Path, gltf: dict, rest: bytes) -> None:
    chunk = json.dumps(gltf, separators=(",", ":")).encode()
    chunk += b" " * (-len(chunk) % 4)
    header = struct.pack("<4sII", b"glTF", 2, 12 + 8 + len(chunk) + len(rest))
    path.write_bytes(header + struct.pack("<I4s", len(chunk), b"JSON") + chunk + rest)


def nom_court(nom: str) -> str:
    """Source2Viewer exporte certains clips deux fois : `ui_shop` et
    `models/heroes_wip/<héros>/clips/ui_shop`. On garde le nom court."""
    return nom.rsplit("/", 1)[-1]


def durees(gltf: dict) -> dict[str, float]:
    acc = gltf["accessors"]
    res = {}
    for a in gltf.get("animations", []):
        d = max((acc[s["input"]].get("max", [0])[0] for s in a["samplers"]), default=0)
        res.setdefault(nom_court(a.get("name", "")), round(d, 2))
    return res


def maillages_caches(modele: str) -> set[str]:
    """Maillages hors des groupes affichés par défaut (ex. la théière de rechange de Baba)."""
    ctrl = s2v("-f", f"{modele}_c", "-b", "CTRL").stdout
    data = s2v("-f", f"{modele}_c", "-b", "DATA").stdout
    defaut, masques = DEFAULT_MASK_RE.search(data), GROUP_MASKS_RE.search(data)
    if defaut is None or masques is None:
        return set()
    group_masks = [int(m) for m in re.findall(r"\d+", masques.group(1))]
    mask = int(defaut.group(1))
    return {
        nom for nom, i in MESH_RE.findall(ctrl)
        if int(i) < len(group_masks) and group_masks[int(i)] & mask == 0
    }


# --- Export ------------------------------------------------------------------------

def exporter_brut(modele: str, clips: list[str] | None, dossier: Path, materiaux: bool = True) -> Path:
    """Export Source2Viewer d'un modèle ; clips=None : toutes les animations."""
    args = ["--gltf_export_materials", "--gltf_textures_adapt"] if materiaux else []
    args += ["--gltf_export_animations"]
    if clips is not None:
        args += ["--gltf_animation_list", ",".join(clips)]
    cible = dossier / PurePosixPath(modele).stem
    r = s2v("-d", "-f", f"{modele}_c", "--gltf_export_format", "glb", *args, "--threads", "4", "-o", str(cible))
    glb = cible.with_suffix(".glb")
    if not glb.is_file():
        # Certains modèles écrivent plusieurs fichiers dans le dossier -o.
        trouves = [p for p in cible.rglob(f"{PurePosixPath(modele).stem}.glb")] if cible.is_dir() else []
        if not trouves:
            raise RuntimeError(f"export raté pour {modele} : {r.stderr.strip()[-500:]}")
        glb = trouves[0]
    return glb


def nettoyer(glb: Path, caches: set[str], ordre: list[str] | None = None) -> list[str]:
    """Retire les maillages cachés et les clips en double ; range les clips dans
    `ordre` (le premier est celui joué par défaut). Renvoie les noms gardés."""
    gltf, rest = read_glb(glb)
    for node in gltf.get("nodes", []):
        if "mesh" in node and node.get("name", "").rsplit(".", 1)[-1] in caches:
            del node["mesh"]
            node.pop("skin", None)
    vus, anims = set(), []
    for a in gltf.get("animations", []):
        court = nom_court(a.get("name", ""))
        if court not in vus:
            vus.add(court)
            a["name"] = court
            anims.append(a)
    if ordre:
        rang = {n: i for i, n in enumerate(ordre)}
        anims.sort(key=lambda a: rang.get(a["name"], len(rang)))
    gltf["animations"] = anims
    write_glb(glb, gltf, rest)  # gltf-transform optimize élague ce qui n'est plus référencé
    return [a["name"] for a in anims]


def optimiser(src: Path, dst: Path, texture: int) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [gltf_transform(), "optimize", str(src), str(dst),
         "--compress", "meshopt", "--texture-compress", "webp",
         "--texture-size", str(texture), "--simplify", "false"],
        check=True, stdout=subprocess.DEVNULL,
    )


def liste_vpk() -> list[str]:
    """Chemins de tous les fichiers de l'archive (mis en cache)."""
    fichier = cache() / "vpk.txt"
    if not fichier.is_file():
        sortie = s2v("-l").stdout
        fichier.write_text("\n".join(l.split(" CRC:")[0] for l in sortie.splitlines() if " CRC:" in l),
                           encoding="utf-8")
    return fichier.read_text(encoding="utf-8").splitlines()


def tous_les_clips(modele: str) -> list[str]:
    """Noms des clips d'animation d'un modèle, sans tout exporter.

    Exporter toutes les animations d'un coup dépasse la mémoire de la VM pour
    certains héros (Dame Geist : plus de 3,7 Go). Les clips sont des fichiers
    `.vnmclip` rangés dans un dossier `clips/` (parfois `clip/`), à côté du
    modèle, de son squelette (`.vnmskel`) ou ailleurs : on prend les dossiers
    des clips cités par les graphes d'animation du modèle (`hero_ui.vnmgraph+<héros>`…),
    puis tous les clips de ces dossiers.
    """
    rerl = s2v("-f", f"{modele}_c", "-b", "RERL").stdout
    bases = {str(PurePosixPath(modele).parent)} | {
        str(PurePosixPath(m).parent) for m in re.findall(r'"([^"]+\.vnmskel)"', rerl)
    }
    dossiers = {f"{b}/clips" for b in bases}
    for graphe in set(re.findall(r'"([^"]+\.vnmgraph)"', rerl)):
        cites = s2v("-f", f"{graphe}_c", "-b", "RERL").stdout
        dossiers |= {str(PurePosixPath(c).parent) for c in re.findall(r'"([^"]+\.vnmclip)"', cites)}
    clips = set()
    for f in liste_vpk():
        # Les variantes « clip.vnmclip+non_additive » sont des doublons compilés : ignorées.
        if f.endswith(".vnmclip_c") and "+" not in f and str(PurePosixPath(f).parent) in dossiers:
            clips.add(PurePosixPath(f).name.removesuffix(".vnmclip_c"))
    return sorted(clips)


# --- Commandes ---------------------------------------------------------------------

def cmd_clips(ids: list[int]) -> None:
    """Affiche les clips des héros et les enregistre dans tools/clips.json
    (complété à chaque appel : les héros déjà listés sont gardés)."""
    modeles = modeles_des_heros()
    noms = noms_des_heros()
    chemin = TOOLS / "clips.json"
    index = json.loads(chemin.read_text(encoding="utf-8")) if chemin.is_file() else {}
    detail = len(ids) <= 3  # au-delà, on n'affiche que le nombre de clips
    for hid in ids:
        modele = modeles.get(hid)
        if modele is None:
            print(f"{hid} {noms.get(hid, '')} : pas de modèle dans heroes.vdata", flush=True)
            continue
        clips = tous_les_clips(modele)
        print(f"# {hid} {noms.get(hid, '')} : {modele} ({len(clips)} clips)", flush=True)
        if detail:
            print("\n".join(clips))
        index[str(hid)] = {"nom": noms.get(hid, ""), "modele": modele, "clips": clips}
    index["_build"] = build_du_jeu()
    index = dict(sorted(index.items(), key=lambda kv: (not kv[0].startswith("_"), kv[1]["nom"] if isinstance(kv[1], dict) else "")))
    chemin.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nListe enregistrée dans {chemin.relative_to(ROOT)}")


def noms_des_heros() -> dict[int, str]:
    """hero_id -> nom, d'après tools/heros.json (héros actifs)."""
    data = json.loads((TOOLS / "heros.json").read_text(encoding="utf-8"))
    return {int(k): v for k, v in data.items() if not k.startswith("_")}


def cmd_apercu(ids: list[int]) -> None:
    modeles = modeles_des_heros()
    noms = noms_des_heros()
    sortie = TOOLS / "apercu"
    index_path = sortie / "clips.json"
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.is_file() else {}
    for hid in ids:
        modele = modeles.get(hid)
        print(f"{hid} {noms.get(hid, '')} ({modele})", flush=True)
        if modele is None:
            print("  ! pas de modèle dans heroes.vdata", flush=True)
            continue
        # Un dossier temporaire par héros : les exports bruts pèsent jusqu'à ~150 Mo.
        try:
            with tempfile.TemporaryDirectory() as tmp:
                tout = tous_les_clips(modele)
                clips = [n for n in tout if APERCU_GARDE.search(n) and not APERCU_EXCLU.search(n)]
                print(f"  {len(clips)} clips sur {len(tout)} : {', '.join(clips)}", flush=True)
                if not clips:
                    raise RuntimeError("aucun clip trouvé")
                glb = exporter_brut(modele, clips, Path(tmp) / str(hid))
                gardes = nettoyer(glb, maillages_caches(modele), clips)
                d = durees(read_glb(glb)[0])
                dst = sortie / "models" / f"{hid}.glb"
                optimiser(glb, dst, 1024)
        except (RuntimeError, subprocess.CalledProcessError) as e:
            print(f"  ! échec : {e}", flush=True)
            continue
        index[str(hid)] = {"nom": noms.get(hid, ""), "modele": modele, "clips": {n: d.get(n, 0) for n in gardes}}
        # Écrit après chaque héros : un export interrompu garde ce qui est fait.
        index_path.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"  -> {dst.relative_to(ROOT)} ({dst.stat().st_size / 1e6:.1f} Mo)", flush=True)


def config_final() -> dict[str, dict]:
    """tools/models.json sans les clés d'aide."""
    config = json.loads((TOOLS / "models.json").read_text(encoding="utf-8"))
    return {k: v for k, v in config.items() if not k.startswith("_")}


def cmd_final(ids: list[int] | None = None) -> None:
    """Exporte les héros de tools/models.json (ou seulement `ids`)."""
    config = config_final()
    if ids:
        absents = [i for i in ids if str(i) not in config]
        if absents:
            print(f"  ! pas dans tools/models.json, ignorés : {', '.join(map(str, absents))}")
        config = {k: v for k, v in config.items() if int(k) in ids}
    modeles = modeles_des_heros()
    with tempfile.TemporaryDirectory() as tmp:
        for hid, conf in config.items():
            modele = modeles[int(hid)]
            clips = conf["clips"]
            glb = exporter_brut(modele, clips, Path(tmp) / hid)
            gardes = nettoyer(glb, maillages_caches(modele), clips)
            manquants = [c for c in clips if c not in gardes]
            if manquants:
                print(f"  ! {hid} : clips introuvables : {', '.join(manquants)}")
            dst = ROOT / "assets" / "models" / f"{hid}.glb"
            optimiser(glb, dst, conf.get("texture", 1024))
            print(f"{hid} ({conf.get('nom', '')}) : {', '.join(gardes)} -> {dst.relative_to(ROOT)} "
                  f"({dst.stat().st_size / 1e6:.1f} Mo)", flush=True)


# --- Menu interactif -----------------------------------------------------------------

def sans_accents(texte: str) -> str:
    return unicodedata.normalize("NFD", texte).encode("ascii", "ignore").decode().lower().strip()


def lire_heros(reponse: str, possibles: dict[int, str]) -> list[int] | None:
    """« tous », ou des ids et/ou des noms séparés par des espaces ou des virgules.
    Renvoie None (avec un message) si un élément n'est pas reconnu."""
    if sans_accents(reponse) in ("tous", "*"):
        return sorted(possibles)
    par_nom = {sans_accents(n): i for i, n in possibles.items()}
    ids = []
    for mot in re.split(r"[,\s]+", reponse.strip()):
        if not mot:
            continue
        if mot.isdigit() and int(mot) in possibles:
            ids.append(int(mot))
        elif sans_accents(mot) in par_nom:
            ids.append(par_nom[sans_accents(mot)])
        else:
            print(f"  Héros inconnu : {mot}")
            return None
    return ids or None


def demander_heros(possibles: dict[int, str], tous: bool = True) -> list[int]:
    print("  " + ", ".join(f"{n} ({i})" for i, n in sorted(possibles.items(), key=lambda kv: sans_accents(kv[1]))))
    invite = "Héros (noms ou ids séparés par des espaces" + (", ou « tous »" if tous else "") + ") : "
    while True:
        ids = lire_heros(input(invite), possibles)
        if ids:
            return ids


def menu() -> None:
    print(f"Archive : {vpk()} (build {build_du_jeu()})\n")
    choix = {
        "1": "Lister les clips d'animation de héros (enregistrés dans tools/clips.json)",
        "2": "Lister les clips de tous les héros",
        "3": "Exporter un aperçu des poses (tools/apercu/)",
        "4": "Exporter les modèles du site (assets/models/, d'après tools/models.json)",
        "q": "Quitter",
    }
    print("Que faire ?")
    for k, v in choix.items():
        print(f"  {k}. {v}")
    while (c := input("> ").strip().lower()) not in choix:
        print("  Choix invalide.")
    noms = noms_des_heros()
    if c == "1":
        cmd_clips(demander_heros(noms))
    elif c == "2":
        cmd_clips(sorted(noms))
    elif c == "3":
        cmd_apercu(demander_heros(noms))
    elif c == "4":
        config = config_final()
        print("Héros configurés : " + ", ".join(f"{v.get('nom', '')} ({k})" for k, v in config.items()))
        if input("Tous les exporter ? [O/n] ").strip().lower() in ("", "o", "oui", "y"):
            cmd_final()
        else:
            cmd_final(demander_heros({int(k): v.get("nom", k) for k, v in config.items()}, tous=False))


def main() -> None:
    args = sys.argv[1:]
    # --vpk <chemin> (ou --vpk=<chemin>), à n'importe quelle position : prioritaire sur DEADLOCK_VPK.
    for i, a in enumerate(args):
        if a == "--vpk" and i + 1 < len(args):
            os.environ["DEADLOCK_VPK"] = args[i + 1]
            del args[i : i + 2]
            break
        if a.startswith("--vpk="):
            os.environ["DEADLOCK_VPK"] = a.split("=", 1)[1]
            del args[i]
            break
    if not args:
        try:
            menu()
        except (KeyboardInterrupt, EOFError):
            print()
        return
    if args[0] not in ("clips", "apercu", "final"):
        sys.exit(__doc__)
    cmd = args[0]
    # « tous », ou des ids et/ou des noms de héros (tools/heros.json).
    ids = lire_heros(" ".join(args[1:]), noms_des_heros()) if args[1:] else []
    if ids is None:
        sys.exit(1)
    print(f"Archive : {vpk()} (build {build_du_jeu()})", flush=True)
    if cmd == "final":
        cmd_final(ids)
    elif not ids:
        sys.exit("Donner au moins un héros, ex. 79 67, Rem Paige ou tous")
    elif cmd == "clips":
        cmd_clips(ids)
    else:
        cmd_apercu(ids)

if __name__ == "__main__":
    main()
