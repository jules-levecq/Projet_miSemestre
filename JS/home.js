document.addEventListener('DOMContentLoaded', () => {
    console.log("SlideCode est prêt !");

    // ==========================================
    // 1. GESTION DU MENU TIROIR (HOVER)
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const toggleHandle = document.getElementById('toggleSidebar');

    if (sidebar) {
        // Quand la souris entre sur la zone du menu (ou la poignée qui en fait partie)
        sidebar.addEventListener('mouseenter', () => {
            sidebar.classList.add('open');
        });

        // Quand la souris quitte la zone du menu
        sidebar.addEventListener('mouseleave', () => {
            sidebar.classList.remove('open');
        });
    }

    // ==========================================
    // 2. EFFET RADAR (SOURIS)
    // ==========================================
    const body = document.querySelector('body');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        body.style.setProperty('--x', x + 'px');
        body.style.setProperty('--y', y + 'px');
    });

    // ==========================================
    // 3. GESTION DU MENU BURGER (INTERNE)
    // ==========================================
    // Note: Si tu utilises le menu tiroir, as-tu encore besoin du burgerBtn ? 
    // Je le laisse au cas où.
    const burgerBtn = document.getElementById('burgerBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (burgerBtn && dropdownMenu) {
        burgerBtn.addEventListener('click', () => {
            dropdownMenu.classList.toggle('hidden');
        });
    }

    // ==========================================
    // 4. GESTION DU NOUVEAU PROJET
    // ==========================================
    window.createNewProject = function() {
        const projectName = prompt("Nom du nouveau projet :", "MonProjet");
        if (projectName) {
            localStorage.setItem('currentProjectName', projectName);
            window.location.href = 'main.html'; 
        }
    };

    // ==========================================
    // 5. GESTION DE LA MODALE "A PROPOS"
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
    // 6. GESTION DU CURSEUR (TYPEWRITER)
    // ==========================================
    setTimeout(() => {
        const tagline = document.querySelector('.tagline');
        if (tagline) {
            tagline.style.borderRight = 'none';
            tagline.style.animation = 'none';
        }
    }, 14000); // 14 secondes
});

// ==========================================
// 7. ANIMATION CANVAS (En dehors du DOMContentLoaded)
// ==========================================
const canvas = document.getElementById('bgCanvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray;

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

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });
}