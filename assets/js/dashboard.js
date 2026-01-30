document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard JS chargé !");

    // ==========================================
    // 1. CONFIGURATION API
    // ==========================================
    const API_URL = 'http://localhost:8080/api';
    
    // Récupérer l'utilisateur connecté
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
    
    // Fonction de déconnexion
    window.logout = function() {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = 'home.html';
    };

    // ==========================================
    // 2. DATA
    // ==========================================
    let projectsData = [];

    const container = document.getElementById('projectsContainer');
    const countValue = document.getElementById('countValue');
    const sortTypeSelect = document.getElementById('sortType');
    const filterFavCheckbox = document.getElementById('filterFav');
    
    // Afficher le nom de l'utilisateur
    const user = getCurrentUser();
    const usernameEl = document.getElementById('userName');
    const avatarEl = document.getElementById('userAvatar');
    const statusEl = document.getElementById('userStatus');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsDropdown = document.getElementById('settingsDropdown');
    
    if (user) {
        // Afficher le prénom et le nom complet
        const fullName = `${user.firstName || ''} ${user.lastName ? user.lastName.charAt(0) + '.' : ''}`.trim();
        if (usernameEl) usernameEl.textContent = fullName || user.name || 'Utilisateur';
        if (avatarEl) avatarEl.textContent = (user.firstName || user.name || 'U').charAt(0).toUpperCase();
        if (statusEl) statusEl.textContent = 'Connecté';
    } else {
        if (usernameEl) usernameEl.textContent = 'Non connecté';
        if (avatarEl) avatarEl.textContent = '?';
        if (statusEl) statusEl.textContent = 'Visiteur';
    }
    
    // Gestion du menu déroulant des paramètres
    if (settingsBtn && settingsDropdown) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsDropdown.classList.toggle('show');
        });
        
        // Fermer le menu si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!settingsDropdown.contains(e.target) && !settingsBtn.contains(e.target)) {
                settingsDropdown.classList.remove('show');
            }
        });
    }

    // ==========================================
    // 3. CHARGEMENT DES PROJETS DEPUIS L'API
    // ==========================================
    async function loadProjects() {
        const user = getCurrentUser();
        
        if (!user || !user.id) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="color: #f87171; font-size: 1.2rem; margin-bottom: 20px;">
                        ⚠️ Vous devez être connecté pour voir vos projets
                    </p>
                    <a href="connexion.html" style="color: var(--accent); text-decoration: underline;">
                        Se connecter
                    </a>
                </div>
            `;
            countValue.textContent = '0';
            return;
        }

        try {
            container.innerHTML = '<p style="color:#94a3b8; grid-column: 1/-1; text-align:center;">⏳ Chargement des projets...</p>';
            
            const response = await fetch(`${API_URL}/projects/user/${user.id}`);
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement');
            }
            
            const projects = await response.json();
            
            // Transformer les données de l'API au format attendu
            projectsData = projects.map(p => ({
                id: p.id,
                name: p.title,
                dateCreate: new Date().toISOString().split('T')[0], // TODO: ajouter createdAt dans le backend
                lastModified: new Date().toISOString().split('T')[0], // TODO: ajouter updatedAt dans le backend
                emoji: getStoredEmoji(p.id) || getProjectPreview(p.content),
                isFavorite: false // TODO: ajouter isFavorite dans le backend
            }));
            
            applyFiltersAndSort();
            
        } catch (error) {
            console.error('Erreur chargement projets:', error);
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="color: #f87171; font-size: 1.2rem; margin-bottom: 10px;">
                        ❌ Erreur de connexion au serveur
                    </p>
                    <p style="color: #94a3b8; font-size: 0.9rem;">
                        Vérifiez que le backend est lancé sur localhost:8080
                    </p>
                </div>
            `;
            countValue.textContent = '0';
        }
    }
    
    // Génère un aperçu basé sur le contenu du projet
    function getProjectPreview(content) {
        try {
            const data = JSON.parse(content);
            const slideCount = data.nodes ? data.nodes.length : 0;
            if (slideCount === 0) return '📄';
            if (slideCount === 1) return '📊';
            if (slideCount <= 3) return '📑';
            return '📚';
        } catch {
            return '📄';
        }
    }
    
    // Récupère l'emoji stocké pour un projet
    function getStoredEmoji(projectId) {
        const emojis = JSON.parse(localStorage.getItem('projectEmojis') || '{}');
        return emojis[projectId] || null;
    }
    
    // Stocke l'emoji pour un projet
    function storeEmoji(projectId, emoji) {
        const emojis = JSON.parse(localStorage.getItem('projectEmojis') || '{}');
        emojis[projectId] = emoji;
        localStorage.setItem('projectEmojis', JSON.stringify(emojis));
    }
    
    // Catégories d'emojis complètes
    const EMOJI_CATEGORIES = {
        '😀 Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮‍💨','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥴','😵','🤯','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
        '👋 Gestes': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄'],
        '❤️ Cœurs': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','🩷','🩵','🩶'],
        '🐱 Animaux': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔'],
        '🍎 Nourriture': ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽️','🥣','🥡','🥢','🧂'],
        '⚽ Sport': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🏇','⛰️','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪'],
        '🚗 Transport': ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🦯','🦽','🦼','🛴','🚲','🛵','🏍️','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩️','💺','🛰️','🚀','🛸','🚁','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','⚓','🪝','⛽','🚧','🚦','🚥','🚏','🗺️','🗿','🗽','🗼','🏰','🏯','🏟️','🎡','🎢','🎠','⛲','⛱️','🏖️','🏝️','🏜️','🌋','⛰️','🏔️','🗻','🏕️','⛺','🛖','🏠','🏡','🏘️','🏚️','🏗️','🏭','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏩','💒','🏛️','⛪','🕌','🕍','🛕','🕋','⛩️','🛤️','🛣️','🗾','🎑','🏞️','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙️','🌃','🌌','🌉','🌁'],
        '💡 Objets': ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','🪧','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'],
        '⭐ Symboles': ['⭐','🌟','✨','💫','⚡','🔥','💥','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌪️','🌫️','🌈','☔','💧','💦','🌊','🎄','🎋','🎍','🎑','🧨','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧️','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','🟰','♾️','💲','💱','™️','©️','®️','👁️‍🗨️','🔚','🔙','🔛','🔝','🔜','〰️','➰','➿','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','💬','💭','🗯️','♠️','♣️','♥️','♦️','🃏','🎴','🀄','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛','🕜','🕝','🕞','🕟','🕠','🕡','🕢','🕣','🕤','🕥','🕦','🕧'],
        '🚩 Drapeaux': ['🏳️','🏴','🏴‍☠️','🏁','🚩','🎌','🏳️‍🌈','🏳️‍⚧️','🇺🇳','🇦🇫','🇦🇽','🇦🇱','🇩🇿','🇦🇸','🇦🇩','🇦🇴','🇦🇮','🇦🇶','🇦🇬','🇦🇷','🇦🇲','🇦🇼','🇦🇺','🇦🇹','🇦🇿','🇧🇸','🇧🇭','🇧🇩','🇧🇧','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇲','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇮🇴','🇻🇬','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇰🇭','🇨🇲','🇨🇦','🇮🇨','🇨🇻','🇧🇶','🇰🇾','🇨🇫','🇹🇩','🇨🇱','🇨🇳','🇨🇽','🇨🇨','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇰','🇨🇷','🇨🇮','🇭🇷','🇨🇺','🇨🇼','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇲','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇸🇿','🇪🇹','🇪🇺','🇫🇰','🇫🇴','🇫🇯','🇫🇮','🇫🇷','🇬🇫','🇵🇫','🇹🇫','🇬🇦','🇬🇲','🇬🇪','🇩🇪','🇬🇭','🇬🇮','🇬🇷','🇬🇱','🇬🇩','🇬🇵','🇬🇺','🇬🇹','🇬🇬','🇬🇳','🇬🇼','🇬🇾','🇭🇹','🇭🇳','🇭🇰','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇲','🇮🇱','🇮🇹','🇯🇲','🇯🇵','🎌','🇯🇪','🇯🇴','🇰🇿','🇰🇪','🇰🇮','🇽🇰','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇮','🇱🇹','🇱🇺','🇲🇴','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇭','🇲🇶','🇲🇷','🇲🇺','🇾🇹','🇲🇽','🇫🇲','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇸','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇷','🇳🇵','🇳🇱','🇳🇨','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇳🇺','🇳🇫','🇰🇵','🇲🇰','🇲🇵','🇳🇴','🇴🇲','🇵🇰','🇵🇼','🇵🇸','🇵🇦','🇵🇬','🇵🇾','🇵🇪','🇵🇭','🇵🇳','🇵🇱','🇵🇹','🇵🇷','🇶🇦','🇷🇪','🇷🇴','🇷🇺','🇷🇼','🇼🇸','🇸🇲','🇸🇹','🇸🇦','🇸🇳','🇷🇸','🇸🇨','🇸🇱','🇸🇬','🇸🇽','🇸🇰','🇸🇮','🇬🇸','🇸🇧','🇸🇴','🇿🇦','🇰🇷','🇸🇸','🇪🇸','🇱🇰','🇧🇱','🇸🇭','🇰🇳','🇱🇨','🇵🇲','🇻🇨','🇸🇩','🇸🇷','🇸🇪','🇨🇭','🇸🇾','🇹🇼','🇹🇯','🇹🇿','🇹🇭','🇹🇱','🇹🇬','🇹🇰','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇹🇨','🇹🇻','🇻🇮','🇺🇬','🇺🇦','🇦🇪','🇬🇧','🏴󠁧󠁢󠁥󠁮󠁧󠁿','🏴󠁧󠁢󠁳󠁣󠁴󠁿','🏴󠁧󠁢󠁷󠁬󠁳󠁿','🇺🇸','🇺🇾','🇺🇿','🇻🇺','🇻🇦','🇻🇪','🇻🇳','🇼🇫','🇪🇭','🇾🇪','🇿🇲','🇿🇼']
    };

    // ==========================================
    // 4. RENDU DES PROJETS
    // ==========================================
    function renderProjects(projects) {
        container.innerHTML = '';
        countValue.textContent = projects.length;

        if (projects.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="color:#94a3b8; font-size: 1.1rem; margin-bottom: 20px;">
                        Aucun projet trouvé.
                    </p>
                    <button onclick="window.createNewProject()" class="btn-new-project" style="
                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 1rem;
                    ">
                        + Créer un projet
                    </button>
                </div>
            `;
            return;
        }
        
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            const starClass = project.isFavorite ? 'active' : '';

            card.innerHTML = `
                <div class="card-preview">
                    <span class="project-emoji" onclick="openEmojiPicker(event, ${project.id})" title="Cliquer pour changer l'emoji">${project.emoji}</span>
                    <span class="star-btn ${starClass}" onclick="toggleFavorite(event, ${project.id})">★</span>
                    <div class="preview-overlay" onclick="openProject(${project.id})"></div>
                </div>
                <div class="card-infos">
                    <h3 onclick="openProject(${project.id})" style="cursor:pointer">${project.name}</h3>
                    <div class="dates-info">
                        <span>📅 Créé : ${formatDate(project.dateCreate)}</span>
                        <span style="color:var(--accent)">🕒 Modif : ${formatDate(project.lastModified)}</span>
                    </div>
                    <div style="text-align: right; margin-top: auto; display: flex; gap: 8px; justify-content: flex-end;">
                        <button class="delete-btn" onclick="deleteProject(event, ${project.id})" title="Supprimer">🗑️</button>
                        <button class="options-btn">⋮</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // ==========================================
    // 5. LOGIQUE FILTRES & TRIS
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
    // 6. UTILITAIRES
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
    
    // Ouvre le picker d'emojis
    window.openEmojiPicker = function(event, projectId) {
        event.stopPropagation();
        
        // Supprimer un picker existant
        const existingPicker = document.querySelector('.emoji-picker');
        if (existingPicker) existingPicker.remove();
        
        // Créer les onglets de catégories
        const categoryNames = Object.keys(EMOJI_CATEGORIES);
        const tabsHtml = categoryNames.map((cat, i) => 
            `<button class="emoji-tab ${i === 0 ? 'active' : ''}" data-category="${cat}">${cat.split(' ')[0]}</button>`
        ).join('');
        
        // Créer le picker
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.innerHTML = `
            <div class="emoji-picker-header">
                <span>Choisir un emoji</span>
                <button class="emoji-picker-close" onclick="closeEmojiPicker()">✕</button>
            </div>
            <div class="emoji-tabs">${tabsHtml}</div>
            <div class="emoji-picker-grid" id="emojiGrid">
                ${EMOJI_CATEGORIES[categoryNames[0]].map(e => `<span class="emoji-option" onclick="selectEmoji(event, ${projectId}, '${e}')">${e}</span>`).join('')}
            </div>
        `;
        
        // Positionner le picker près du clic
        const rect = event.target.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.top = `${Math.min(rect.bottom + 10, window.innerHeight - 450)}px`;
        picker.style.left = `${Math.min(rect.left - 100, window.innerWidth - 360)}px`;
        
        document.body.appendChild(picker);
        
        // Gérer les clics sur les onglets
        picker.querySelectorAll('.emoji-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                // Mettre à jour l'onglet actif
                picker.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Mettre à jour la grille
                const category = tab.dataset.category;
                const grid = document.getElementById('emojiGrid');
                grid.innerHTML = EMOJI_CATEGORIES[category].map(emoji => 
                    `<span class="emoji-option" onclick="selectEmoji(event, ${projectId}, '${emoji}')">${emoji}</span>`
                ).join('');
            });
        });
        
        // Fermer en cliquant ailleurs
        setTimeout(() => {
            document.addEventListener('click', closeEmojiPickerOnClickOutside);
        }, 10);
    };
    
    function closeEmojiPickerOnClickOutside(e) {
        const picker = document.querySelector('.emoji-picker');
        if (picker && !picker.contains(e.target)) {
            closeEmojiPicker();
        }
    }
    
    window.closeEmojiPicker = function() {
        const picker = document.querySelector('.emoji-picker');
        if (picker) picker.remove();
        document.removeEventListener('click', closeEmojiPickerOnClickOutside);
    };
    
    window.selectEmoji = function(event, projectId, emoji) {
        event.stopPropagation();
        
        // Stocker l'emoji
        storeEmoji(projectId, emoji);
        
        // Mettre à jour les données
        const project = projectsData.find(p => p.id === projectId);
        if (project) {
            project.emoji = emoji;
            applyFiltersAndSort();
        }
        
        closeEmojiPicker();
    };

    window.openProject = function(id) {
        // Stocker l'ID du projet à charger et rediriger vers l'éditeur
        localStorage.setItem('loadProjectId', id);
        window.location.href = '/app.html';
    };
    
    window.deleteProject = async function(event, id) {
        event.stopPropagation();
        
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Recharger les projets
                loadProjects();
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert('Erreur de connexion au serveur');
        }
    };
    
    window.createNewProject = function() {
        const projectName = prompt("Nom du nouveau projet :", "MonProjet");
        if (projectName) {
            localStorage.setItem('currentProjectName', projectName);
            window.location.href = '/app.html';
        }
    };

    // Events
    if (sortTypeSelect) sortTypeSelect.addEventListener('change', applyFiltersAndSort);
    if (filterFavCheckbox) filterFavCheckbox.addEventListener('change', applyFiltersAndSort);

    // Initialisation - Charger les projets depuis l'API
    loadProjects();

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