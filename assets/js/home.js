document.addEventListener('DOMContentLoaded', () => {
    console.log("Home JS chargé !");

    // ==========================================
    // 0. GESTION DE L'ÉTAT DE CONNEXION
    // ==========================================
    function getCurrentUser() {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    return user;
                }
            } catch {
                return null;
            }
        }
        return null;
    }
    
    function logout() {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.reload();
    }
    
    // Exposer la fonction de déconnexion globalement
    window.logout = logout;
    
    const user = getCurrentUser();
    const topBar = document.querySelector('.top-bar');
    
    if (topBar) {
        if (user) {
            // Utilisateur connecté : afficher son nom et un bouton déconnexion
            topBar.innerHTML = `
                <div class="user-logged">
                    <span class="welcome-text">Bonjour, <strong>${user.firstName || user.name}</strong></span>
                    <button class="btn-dashboard" onclick="window.location.href='dashboard.html'">📊 Dashboard</button>
                    <button class="btn-logout" onclick="logout()">Déconnexion</button>
                </div>
            `;
        } else {
            // Utilisateur non connecté : afficher les boutons connexion/inscription
            topBar.innerHTML = `
                <button class="btn-login" onclick="window.location.href='connexion.html'">Connexion</button>
                <button class="btn-signup" onclick="window.location.href='inscription.html'">Inscription</button>
            `;
        }
    }
    
    // Mettre à jour la sidebar avec les infos utilisateur
    if (user) {
        const usernameEl = document.querySelector('.username');
        const avatarEl = document.querySelector('.avatar');
        const statusEl = document.querySelector('.status');
        
        if (usernameEl) usernameEl.textContent = user.firstName || user.name || 'Utilisateur';
        if (avatarEl) avatarEl.textContent = (user.firstName || user.name || 'U').charAt(0).toUpperCase();
        if (statusEl) statusEl.textContent = 'Connecté';
    }

    // ==========================================
    // 1. GESTION DU MENU TIROIR (HOVER)
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    
    if (sidebar) {
        // Ouverture souris
        sidebar.addEventListener('mouseenter', () => {
            sidebar.classList.add('open');
        });
        // Fermeture souris
        sidebar.addEventListener('mouseleave', () => {
            sidebar.classList.remove('open');
        });
    }

    // ==========================================
    // 2. EFFET RADAR (SOURIS SUR LE FOND)
    // ==========================================
    const body = document.querySelector('body');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        body.style.setProperty('--x', x + 'px');
        body.style.setProperty('--y', y + 'px');
    });

    // ==========================================
    // 3. GESTION DU NOUVEAU PROJET
    // ==========================================
    window.createNewProject = function() {
        const projectName = prompt("Nom du nouveau projet :", "MonProjet");
        if (projectName) {
            localStorage.setItem('currentProjectName', projectName);
            // Rediriger vers l'éditeur React
            window.location.href = '/app.html'; 
        }
    };

    // ==========================================
    // 4. GESTION DE LA MODALE "A PROPOS"
    // ==========================================
    const btnAbout = document.getElementById('btnAbout');
    const modalAbout = document.getElementById('modalAbout');
    const closeModal = document.querySelector('.close-modal');

    if (btnAbout && modalAbout) {
        btnAbout.addEventListener('click', (e) => {
            e.preventDefault();
            modalAbout.classList.remove('hidden');
        });

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modalAbout.classList.add('hidden');
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modalAbout) {
                modalAbout.classList.add('hidden');
            }
        });
    }

    // ==========================================
    // 5. GESTION DU CURSEUR (TYPEWRITER) - 12 SECONDES
    // ==========================================
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        setTimeout(() => {
            // On enlève la bordure (le curseur clignotant)
            tagline.style.borderRight = 'none';
        }, 12000); // 12000 ms = 12 secondes
    }

    // ==========================================
    // 6. ANIMATION CANVAS (RECTANGLES ET LIGNES)
    // ==========================================
    // On lance l'animation ici pour être sûr que le DOM est prêt
    initCanvasAnimation();
});

// Fonction isolée pour l'animation (réutilisable proprement)
function initCanvasAnimation() {
    const canvas = document.getElementById('bgCanvas');
    
    // Si pas de canvas sur la page, on arrête
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray;

    // Réglage taille
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.directionX = (Math.random() * 1.0) - 0.5;
            this.directionY = (Math.random() * 1.0) - 0.5;
            this.size = (Math.random() * 30) + 15;
        }
        draw() {
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.size, this.size * 0.6);
            // Rectangles blancs très légers
            ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        update() {
            if (this.x > canvas.width + 50 || this.x < -50) this.directionX = -this.directionX;
            if (this.y > canvas.height + 50 || this.y < -50) this.directionY = -this.directionY;
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        // Densité des particules
        let numberOfParticles = (canvas.width * canvas.height) / 22000; 
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();

            // Gestion des connexions (Lignes)
            for (let j = i; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 255, 255, ' + (1 - distance/200) * 0.4 + ')';
                    ctx.lineWidth = 1;
                    
                    let p1x = particlesArray[i].x + particlesArray[i].size/2;
                    let p1y = particlesArray[i].y + particlesArray[i].size/4;
                    let p2x = particlesArray[j].x + particlesArray[j].size/2;
                    let p2y = particlesArray[j].y + particlesArray[j].size/4;
                    
                    // Courbe de Bézier pour effet organique
                    let midX = (p1x + p2x) / 2;
                    let midY = (p1y + p2y) / 2;
                    let cpX = midX + (p1y - p2y) * 0.2; 
                    let cpY = midY - (p1x - p2x) * 0.2;

                    ctx.moveTo(p1x, p1y);
                    ctx.quadraticCurveTo(cpX, cpY, p2x, p2y);
                    ctx.stroke();
                }
            }
        }
    }

    init();
    animate();

    // Redimensionnement
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });
}