document.addEventListener('DOMContentLoaded', () => {
    console.log("SlideCode est prêt !");

    // --- GESTION DU MENU BURGER ---
    const burgerBtn = document.getElementById('burgerBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    burgerBtn.addEventListener('click', () => {
        // Toggle la classe 'hidden' pour afficher/masquer
        dropdownMenu.classList.toggle('hidden');
    });

    // --- GESTION DU NOUVEAU PROJET ---
    window.createNewProject = function() {
    const projectName = prompt("Nom du nouveau projet :", "MonProjet");
    if (projectName) {
        // Sauvegarde le nom dans le navigateur pour le récupérer sur l'autre page
        localStorage.setItem('currentProjectName', projectName);
        
        // REDIRECTION : Comme index.html et main.html sont dans le même dossier
        window.location.href = 'main.html'; 
    }
};

    // --- GESTION DE LA MODALE "A PROPOS" ---
    const btnAbout = document.getElementById('btnAbout');
    const modalAbout = document.getElementById('modalAbout');
    const closeModal = document.querySelector('.close-modal');

    // Ouvrir
    btnAbout.addEventListener('click', (e) => {
        e.preventDefault(); // Empêche le lien de recharger la page
        modalAbout.classList.remove('hidden');
    });

    // Fermer avec la croix
    closeModal.addEventListener('click', () => {
        modalAbout.classList.add('hidden');
    });

    // Fermer en cliquant en dehors
    window.addEventListener('click', (e) => {
        if (e.target === modalAbout) {
            modalAbout.classList.add('hidden');
        }
    });
});