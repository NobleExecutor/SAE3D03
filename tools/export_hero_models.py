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
    python3 tools/export_hero_models.py apercu 79 67     (ou « apercu tous »)
        -> tools/apercu/models/<hero_id>.glb + tools/apercu/clips.json
    python3 tools/export_hero_models.py final
        -> assets/models/<hero_id>.glb, d'après tools/models.json
    python3 tools/export_hero_models.py clips 79
        -> liste tous les clips du modèle

Archives du jeu : variable DEADLOCK_VPK, sinon ~/deadlock-vpk/pak01_dir.vpk
(clones APFS des .vpk, voir tools/README.md).
"""

import json
import os
import platform
import re
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
ROOT = TOOLS.parent
VENDOR = TOOLS / "vendor"
CACHE = VENDOR / "cache"

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

def source2viewer() -> str:
    systeme = {"Darwin": "macos", "Linux": "linux"}[platform.system()]
    arch = {"arm64": "arm64", "aarch64": "arm64", "x86_64": "x64"}[platform.machine()]
    exe = VENDOR / "source2viewer" / f"cli-{systeme}-{arch}" / "Source2Viewer-CLI"
    if not exe.is_file():
        sys.exit("Source2Viewer introuvable : lancer d'abord bash tools/setup.sh")
    return str(exe)


def gltf_transform() -> str:
    exe = VENDOR / "node_modules" / ".bin" / "gltf-transform"
    if not exe.is_file():
        sys.exit("gltf-transform introuvable : lancer d'abord bash tools/setup.sh")
    return str(exe)


def vpk() -> str:
    candidats = [os.environ.get("DEADLOCK_VPK", "")]
    candidats += [str(Path.home() / d / "pak01_dir.vpk") for d in ("deadlock-vpk", "mnt/deadlock-vpk")]
    for c in candidats:
        if c and Path(c).is_file():
            return c
    sys.exit("pak01_dir.vpk introuvable : définir DEADLOCK_VPK (voir tools/README.md)")


def s2v(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run([source2viewer(), "-i", vpk(), *args], capture_output=True, text=True)


# --- Lecture des données du jeu ------------------------------------------------

def modeles_des_heros() -> dict[int, str]:
    """hero_id -> chemin du .vmdl, lu dans scripts/heroes.vdata (extrait une fois)."""
    vdata = CACHE / "heroes.vdata"
    if not vdata.is_file():
        CACHE.mkdir(parents=True, exist_ok=True)
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
    cible = dossier / Path(modele).stem
    r = s2v("-d", "-f", f"{modele}_c", "--gltf_export_format", "glb", *args, "--threads", "4", "-o", str(cible))
    glb = cible.with_suffix(".glb")
    if not glb.is_file():
        # Certains modèles écrivent plusieurs fichiers dans le dossier -o.
        trouves = [p for p in cible.rglob(f"{Path(modele).stem}.glb")] if cible.is_dir() else []
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
    cache = CACHE / "vpk.txt"
    if not cache.is_file():
        CACHE.mkdir(parents=True, exist_ok=True)
        sortie = s2v("-l").stdout
        cache.write_text("\n".join(l.split(" CRC:")[0] for l in sortie.splitlines() if " CRC:" in l))
    return cache.read_text().splitlines()


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
    bases = {str(Path(modele).parent)} | {
        str(Path(m).parent) for m in re.findall(r'"([^"]+\.vnmskel)"', rerl)
    }
    dossiers = {f"{b}/clips" for b in bases}
    for graphe in set(re.findall(r'"([^"]+\.vnmgraph)"', rerl)):
        cites = s2v("-f", f"{graphe}_c", "-b", "RERL").stdout
        dossiers |= {str(Path(c).parent) for c in re.findall(r'"([^"]+\.vnmclip)"', cites)}
    clips = set()
    for f in liste_vpk():
        if f.endswith(".vnmclip_c") and str(Path(f).parent) in dossiers:
            clips.add(Path(f).name.removesuffix(".vnmclip_c"))
    return sorted(clips)


# --- Commandes ---------------------------------------------------------------------

def cmd_clips(ids: list[int]) -> None:
    modeles = modeles_des_heros()
    for hid in ids:
        clips = tous_les_clips(modeles[hid])
        print(f"# {hid} : {modeles[hid]} ({len(clips)} clips)")
        print("\n".join(clips))


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


def cmd_final() -> None:
    config = json.loads((TOOLS / "models.json").read_text())
    modeles = modeles_des_heros()
    with tempfile.TemporaryDirectory() as tmp:
        for hid, conf in config.items():
            if hid.startswith("_"):
                continue
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
                  f"({dst.stat().st_size / 1e6:.1f} Mo)")


def main() -> None:
    if len(sys.argv) < 2 or sys.argv[1] not in ("clips", "apercu", "final"):
        sys.exit(__doc__)
    cmd = sys.argv[1]
    # « tous » : les héros actifs de tools/heros.json.
    ids = sorted(noms_des_heros()) if sys.argv[2:] == ["tous"] else [int(a) for a in sys.argv[2:]]
    if cmd == "final":
        cmd_final()
    elif not ids:
        sys.exit("Donner au moins un hero_id, ex. 79 67")
    elif cmd == "clips":
        cmd_clips(ids)
    else:
        cmd_apercu(ids)


if __name__ == "__main__":
    main()
