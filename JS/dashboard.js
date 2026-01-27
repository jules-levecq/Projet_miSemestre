document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard JS chargé !");

    // ==========================================
    // 1. DATA (SIMULATION BDD)
    // ==========================================
    let projectsData = [
        { 
            id: 1, name: "Présentation Client", 
            dateCreate: "2023-10-01", lastModified: "2023-10-25", 
            preview: "📊", isFavorite: true 
        },
        { 
            id: 2, name: "Projet Web CIR3", 
            dateCreate: "2023-10-20", lastModified: "2023-10-27", 
            preview: "💻", isFavorite: false 
        },
        { 
            id: 3, name: "Idées Startup", 
            dateCreate: "2023-09-10", lastModified: "2023-09-15", 
            preview: "🚀", isFavorite: false 
        },
        { 
            id: 4, name: "Bilan Annuel", 
            dateCreate: "2023-01-10", lastModified: "2023-10-26", 
            preview: "📈", isFavorite: true 
        },
        { 
            id: 5, name: "Cours Javascript", 
            dateCreate: "2023-10-05", lastModified: "2023-10-05", 
            preview: "JS", isFavorite: false 
        }
    ];

    const container = document.getElementById('projectsContainer');
    const countValue = document.getElementById('countValue');
    const sortTypeSelect = document.getElementById('sortType');
    const filterFavCheckbox = document.getElementById('filterFav');

    // ==========================================
    // 2. RENDU DES PROJETS
    // ==========================================
    function renderProjects(projects) {
        container.innerHTML = '';
        countValue.textContent = projects.length;

        if (projects.length === 0) {
            container.innerHTML = '<p style="color:#94a3b8; grid-column: 1/-1; text-align:center;">Aucun projet trouvé.</p>';
            return;
        }
        
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            const starClass = project.isFavorite ? 'active' : '';

            card.innerHTML = `
                <div class="card-preview" onclick="openProject(${project.id})">
                    ${project.preview}
                    <span class="star-btn ${starClass}" onclick="toggleFavorite(event, ${project.id})">★</span>
                </div>
                <div class="card-infos">
                    <h3 onclick="openProject(${project.id})" style="cursor:pointer">${project.name}</h3>
                    <div class="dates-info">
                        <span>📅 Créé : ${formatDate(project.dateCreate)}</span>
                        <span style="color:var(--accent)">🕒 Modif : ${formatDate(project.lastModified)}</span>
                    </div>
                    <div style="text-align: right; margin-top: auto;">
                        <button class="options-btn">⋮</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ==========================================
    // 3. LOGIQUE FILTRES & TRIS
    // ==========================================
    function applyFiltersAndSort() {
        let filtered = [...projectsData];

        if (filterFavCheckbox && filterFavCheckbox.checked) {
            filtered = filtered.filter(p => p.isFavorite === true);
        }

        const sortType = sortTypeSelect ? sortTypeSelect.value : 'lastMod_recent';
        filtered.sort((a, b) => {
            switch(sortType) {
                case 'lastMod_recent': return new Date(b.lastModified) - new Date(a.lastModified);
                case 'lastMod_old': return new Date(a.lastModified) - new Date(b.lastModified);
                case 'dateCreate_recent': return new Date(b.dateCreate) - new Date(a.dateCreate);
                case 'dateCreate_old': return new Date(a.dateCreate) - new Date(b.dateCreate);
                case 'az': return a.name.localeCompare(b.name);
                case 'za': return b.name.localeCompare(a.name);
                default: return 0;
            }
        });

        renderProjects(filtered);
    }

    // ==========================================
    // 4. UTILITAIRES
    // ==========================================
    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }

    window.toggleFavorite = function(event, id) {
        event.stopPropagation();
        const project = projectsData.find(p => p.id === id);
        if (project) {
            project.isFavorite = !project.isFavorite;
            applyFiltersAndSort();
        }
    };

    window.openProject = function(id) {
        window.location.href = 'main.html'; 
    };

    // Events
    if (sortTypeSelect) sortTypeSelect.addEventListener('change', applyFiltersAndSort);
    if (filterFavCheckbox) filterFavCheckbox.addEventListener('change', applyFiltersAndSort);

    // Initialisation
    applyFiltersAndSort();

    // ==========================================
    // 5. LANCEMENT ANIMATION CANVAS (FOND)
    // ==========================================
    // On copie la même fonction d'animation que dans home.js
    initCanvasAnimation();
});

// Fonction Animation Canvas (identique à home.js)
function initCanvasAnimation() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.directionX = (Math.random() * 0.4) - 0.2;
            this.directionY = (Math.random() * 0.4) - 0.2;
            this.size = (Math.random() * 20) + 10;
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
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }
    
    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.width * canvas.height) / 30000;
        for (let i = 0; i < numberOfParticles; i++) particlesArray.push(new Particle());
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            // Ajout des connexions pour le style (optionnel sur dashboard, mais joli)
            for (let j = i; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 255, 255, ' + (1 - distance/150) * 0.2 + ')';
                    ctx.lineWidth = 1;
                    ctx.moveTo(particlesArray[i].x + particlesArray[i].size/2, particlesArray[i].y + particlesArray[i].size/4);
                    ctx.lineTo(particlesArray[j].x + particlesArray[j].size/2, particlesArray[j].y + particlesArray[j].size/4);
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