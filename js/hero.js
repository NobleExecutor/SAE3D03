async function loadHero(id) {
    // Promise.all permet d'attendre la réponse des 3 requêtes avant de procéder
    const [hero, items, stats] = await Promise.all([
        getHero(id),
        getItemsByHero(id),
        getAbilityStats(id)
    ]);

    // On se débarasse du premier item du tableau, pas besoin
    const abilityItems = items.slice(1);

    // On range les abilités dans l'ordre
    const signatures = [1, 2, 3, 4].map(n => hero.items[`signature${n}`]);

    const abilities = {};
    signatures.forEach((signature, index) => {
        const item = abilityItems.find(i => i.class_name === signature);

        if (!item) {
            console.warn(`Capacité introuvable pour signature${index + 1} : ${signature}`);
            return;
        }

        abilities[item.id] = {
            slot: index + 1,
            name: item.name,
            image: item.image,
            description: item.description
        };
    });

    return { hero, abilities, stats };
}