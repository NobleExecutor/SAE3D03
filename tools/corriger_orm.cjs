// Échange les canaux rouge et bleu des textures ORM (occlusion, rugosité, métal)
// exportées par Source2Viewer sous macOS, où elles sortent en BGR : le canal du
// métal se retrouve en rouge et l'occlusion en bleu, ce qui rend tout le modèle
// métallique, donc très sombre.
// Appelé par export_hero_models.py : node tools/corriger_orm.cjs <fichier.png>…
// Utilise sharp, installé avec gltf-transform dans tools/vendor/ (bash tools/setup.sh).
const path = require('path');
const sharp = require(path.join(__dirname, 'vendor', 'node_modules', 'sharp'));

(async () => {
    for (const fichier of process.argv.slice(2)) {
        // Lu en entier avant d'écrire : on remplace le fichier source.
        const png = await sharp(fichier)
            .removeAlpha()
            .recomb([[0, 0, 1], [0, 1, 0], [1, 0, 0]])
            .png()
            .toBuffer();
        await sharp(png).toFile(fichier);
    }
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
