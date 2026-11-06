function buildTree(sequences) {
    // Point de départ : racine de l'arbre
    const root = { id: "root", matches: 0, wins: 0, children: [] };

    // Boucle pour accéder à toutes les données récupérer de l'API
    for (const seq of sequences) {
        let node = root;
        // On ajoute le nombre de matchs & wins à la racine pour avoir le total
        root.matches += seq.matches;
        root.wins += seq.wins;

        // Boucle pour accéder à l'abilité présente dans chaque noeud
        for (const abilityId of seq.abilities) {
            let child = node.children.find(c => c.id === abilityId);
            if (!child) {
                child = { id: abilityId, matches: 0, wins: 0, children: [] };
                node.children.push(child);
            }
            child.matches += seq.matches;
            child.wins += seq.wins;
            node = child;
        }
    }
    return root;
}