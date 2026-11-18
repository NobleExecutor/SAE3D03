// Vue héros : remplit la fiche et dessine le squelette de l'arbre.
// Les stats, les capacités et l'arbre sont des placeholders en attendant loadHero et buildTree.

const SVG_NS = "http://www.w3.org/2000/svg";
const TREE_LEVELS = 16;

// Géométrie de l'arbre (unités du viewBox 880 × 1060)
const TREE = {
    left: 60,       // début des lignes de niveau
    right: 860,     // fin des lignes de niveau
    top: 60,        // niveau 16
    bottom: 930,    // niveau 1
    rootY: 1000     // nœud racine (icône du héros)
};

// Ordonnée d'un niveau (1 en bas, 16 en haut)
function levelY(level) {
    const step = (TREE.bottom - TREE.top) / (TREE_LEVELS - 1);
    return TREE.bottom - (level - 1) * step;
}

// Crée un élément SVG avec ses attributs
function svgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

// Squelette de l'arbre : axe des points, lignes de niveau, tronc et racine
function drawTreeSkeleton(svg, hero) {
    svg.replaceChildren();
    const centerX = (TREE.left + TREE.right) / 2;

    // Lignes de niveau et numéros
    const grid = svgEl("g", { class: "tree-grid" });
    for (let level = 1; level <= TREE_LEVELS; level++) {
        const y = levelY(level);
        grid.append(svgEl("line", { x1: TREE.left, x2: TREE.right, y1: y, y2: y }));

        const label = svgEl("text", { x: TREE.left - 14, y: y + 4, class: "tree-level" });
        label.textContent = level;
        grid.append(label);
    }

    const axis = svgEl("text", {
        x: 0, y: 0, class: "tree-axis",
        transform: `translate(12 ${(TREE.top + TREE.bottom) / 2}) rotate(-90)`
    });
    axis.textContent = "POINTS";
    grid.append(axis);
    svg.append(grid);

    // Tronc placeholder : s'arrêtera au niveau 1, en attendant les vraies branches
    svg.append(svgEl("path", {
        class: "tree-trunk",
        d: `M ${centerX} 1060 L ${centerX} ${levelY(1)}`
    }));

    // Message d'attente au centre de l'arbre
    const message = svgEl("text", { x: centerX, y: levelY(9), class: "tree-placeholder" });
    message.textContent = "Arbre en préparation";
    svg.append(message);

    // Racine : icône ronde du héros
    const r = 24;
    const clipId = "tree-root-clip";
    const defs = svgEl("defs");
    const clip = svgEl("clipPath", { id: clipId });
    clip.append(svgEl("circle", { cx: centerX, cy: TREE.rootY, r }));
    defs.append(clip);
    svg.append(defs);

    svg.append(svgEl("circle", { cx: centerX, cy: TREE.rootY, r: r + 2, class: "tree-root" }));
    svg.append(svgEl("image", {
        href: hero.images.icon_image_small_webp,
        x: centerX - r, y: TREE.rootY - r, width: r * 2, height: r * 2,
        "clip-path": `url(#${clipId})`
    }));
}

function renderAbilities(list, abilities) {
    let html = abilities
    .map((ability) => 
                    `<li class="ability">
                        <img class="ability-icon" src="${ability.image}" alt="${ability.name}">
                        <div class="ability-text">
                            <h3 class="ability-name">${ability.name}</h3>
                            <p class="ability-desc">${ability.slot === 4 ? "Ultime · " : ""}${ability.description.desc ? ability.description.desc : "Passive: " + ability.description.passive + "<br><br>" + ability.description.active}</p>
                        </div>  
                    </li>`
    ).join("");
    list.innerHTML = html;
}

// Remplit la vue avec les infos déjà disponibles dans le détail du héros
function renderHeroView(view, hero, abilities) {
    view.style.setProperty("--hex", hero.colors.style_hex);
    view.style.setProperty("--rgb", hero.colors.style.join(" "));

    view.querySelector(".hero-eyebrow").textContent = `Héros · #${hero.id}`;
    view.querySelector(".hero-name").textContent = hero.name;
    view.querySelector(".hero-tags").innerHTML = hero.tags
        .map(tag => `<span class="char-tag">${tag}</span>`)
        .join("");

    const modelViewer = view.querySelector(".hero-model");
    modelViewer.setAttribute("src", hero.models.hero_select);

    // Le lore de l'API contient des <br> : on garde le premier paragraphe seulement
    const lore = hero.description?.lore ?? "";
    view.querySelector(".hero-lore").innerHTML = lore.split(/<br\s*\/?>\s*<br\s*\/?>/)[0];

    renderAbilities(view.querySelector(".ability-list"), abilities);
    drawTreeSkeleton(view.querySelector(".tree-svg"), hero);

    document.title = `${hero.name} · SAE3D03`;
}
