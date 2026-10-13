(function drawStars() {
    const canvas = document.querySelector("#starsBg");
    const ctx = canvas.getContext('2d');

    // On récupère la taille de l'écran en hauteur et largeur et la donne aux attributs du canvas
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    for (let i = 0; i <= 150; i++) {
        let x = Math.random() * canvas.width;   // Position x aléatoire
        let y = Math.random() * canvas.height;  // Position y aléatoire
        let radius = Math.random() * 1.5 + 0.5; // Radius aléatoire pour la taille de l'étoile

        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
})();

function drawPlanets(data) {
    
}