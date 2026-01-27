// ==========================================
// AUTHENTIFICATION - CONNEXION & INSCRIPTION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Effet radar (souris)
    const body = document.querySelector('body');
    document.addEventListener('mousemove', (e) => {
        body.style.setProperty('--x', e.clientX + 'px');
        body.style.setProperty('--y', e.clientY + 'px');
    });

    // ==========================================
    // FORMULAIRE DE CONNEXION
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = loginForm.querySelector('input[name="remember"]')?.checked;
            
            try {
                // Afficher un indicateur de chargement
                const submitBtn = loginForm.querySelector('.btn-submit');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Connexion...';
                submitBtn.disabled = true;

                // Appel API backend pour la connexion (endpoint: /api/auth/login)
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                if (response.ok) {
                    const message = await response.text();
                    
                    // Stocker les infos utilisateur
                    const storage = remember ? localStorage : sessionStorage;
                    storage.setItem('user', JSON.stringify({ 
                        email, 
                        name: email.split('@')[0],
                        isLoggedIn: true 
                    }));
                    
                    showSuccess(loginForm, '✅ ' + message + ' Redirection...');
                    
                    // Rediriger vers la page d'accueil
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 1500);
                } else {
                    const errorMessage = await response.text();
                    showError(loginForm, errorMessage || 'Email ou mot de passe incorrect');
                }
            } catch (error) {
                console.error('Erreur de connexion:', error);
                // Mode démo sans backend
                showError(loginForm, '⚠️ Serveur non disponible. Mode démo...');
                
                setTimeout(() => {
                    if (email && password) {
                        localStorage.setItem('user', JSON.stringify({ 
                            email, 
                            name: email.split('@')[0],
                            isDemo: true 
                        }));
                        showSuccess(loginForm, '✅ Connexion en mode démo !');
                        setTimeout(() => {
                            window.location.href = 'home.html';
                        }, 1500);
                    }
                }, 1500);
            }
        });
    }

    // ==========================================
    // FORMULAIRE D'INSCRIPTION
    // ==========================================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Vérification force du mot de passe
        const passwordInput = document.getElementById('password');
        const strengthIndicator = document.getElementById('passwordStrength');
        
        if (passwordInput && strengthIndicator) {
            passwordInput.addEventListener('input', () => {
                const strength = checkPasswordStrength(passwordInput.value);
                strengthIndicator.style.setProperty('--strength', strength.percent + '%');
                strengthIndicator.style.setProperty('--strength-color', strength.color);
            });
        }
        
        // Vérification confirmation mot de passe
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => {
                if (confirmPassword.value !== passwordInput.value) {
                    confirmPassword.setCustomValidity('Les mots de passe ne correspondent pas');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
        }
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPwd = document.getElementById('confirmPassword').value;
            
            // Validations
            if (password !== confirmPwd) {
                showError(registerForm, 'Les mots de passe ne correspondent pas');
                return;
            }
            
            if (password.length < 8) {
                showError(registerForm, 'Le mot de passe doit contenir au moins 8 caractères');
                return;
            }
            
            try {
                // Afficher un indicateur de chargement
                const submitBtn = registerForm.querySelector('.btn-submit');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Création en cours...';
                submitBtn.disabled = true;

                // Appel API backend pour l'inscription (endpoint: /api/auth/signup)
                const response = await fetch('http://localhost:8080/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        firstName, 
                        lastName, 
                        email, 
                        password 
                    }),
                });
                
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                if (response.ok) {
                    const message = await response.text();
                    
                    // Stocker les infos utilisateur
                    localStorage.setItem('user', JSON.stringify({ 
                        email, 
                        name: `${firstName} ${lastName}`,
                        isLoggedIn: true 
                    }));
                    
                    showSuccess(registerForm, '✅ ' + message + ' Redirection vers l\'accueil...');
                    
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 2500);
                } else {
                    const errorMessage = await response.text();
                    showError(registerForm, errorMessage || 'Erreur lors de l\'inscription');
                }
            } catch (error) {
                console.error('Erreur d\'inscription:', error);
                // Mode démo si le backend n'est pas accessible
                showError(registerForm, '⚠️ Serveur non disponible. Mode démo activé...');
                
                setTimeout(() => {
                    localStorage.setItem('user', JSON.stringify({ 
                        email, 
                        name: `${firstName} ${lastName}`,
                        isDemo: true 
                    }));
                    showSuccess(registerForm, '✅ Compte créé en mode démo ! Redirection...');
                    
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 2000);
                }, 1500);
            }
        });
    }
});

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

// Afficher/masquer le mot de passe
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// Vérifier la force du mot de passe
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    
    let color;
    if (strength < 30) color = '#ef4444'; // Rouge
    else if (strength < 60) color = '#f59e0b'; // Orange
    else if (strength < 80) color = '#10b981'; // Vert clair
    else color = '#22c55e'; // Vert
    
    return { percent: Math.min(strength, 100), color };
}

// Afficher un message d'erreur
function showError(form, message) {
    let errorDiv = form.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        form.insertBefore(errorDiv, form.firstChild);
    }
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

// Afficher un message de succès
function showSuccess(form, message) {
    let successDiv = form.querySelector('.success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        form.insertBefore(successDiv, form.firstChild);
    }
    successDiv.textContent = message;
    successDiv.classList.add('show');
}

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return localStorage.getItem('authToken') || 
           sessionStorage.getItem('authToken') || 
           localStorage.getItem('user');
}

// Déconnexion
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    window.location.href = 'home.html';
}
