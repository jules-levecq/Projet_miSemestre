// ==========================================
// API SERVICE - Communication avec le backend
// ==========================================

const API_URL = 'http://localhost:8080/api';

// ==========================================
// Récupérer l'utilisateur connecté
// ==========================================
export function getCurrentUser() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
}

// ==========================================
// PROJETS - CRUD
// ==========================================

/**
 * Récupère tous les projets d'un utilisateur
 */
export async function getProjects(userId) {
    const response = await fetch(`${API_URL}/projects/user/${userId}`);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des projets');
    }
    return response.json();
}

/**
 * Récupère un projet par son ID
 */
export async function getProject(projectId) {
    const response = await fetch(`${API_URL}/projects/${projectId}`);
    if (!response.ok) {
        throw new Error('Projet non trouvé');
    }
    return response.json();
}

/**
 * Crée un nouveau projet
 */
export async function createProject(userId, title, content) {
    const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, title, content }),
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la création du projet');
    }
    return response.json();
}

/**
 * Met à jour un projet existant
 */
export async function updateProject(projectId, title, content) {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du projet');
    }
    return response.json();
}

/**
 * Supprime un projet
 */
export async function deleteProject(projectId) {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Erreur lors de la suppression du projet');
    }
    return true;
}

/**
 * Convertit les nodes/edges React Flow en JSON pour la DB
 */
export function serializeProject(nodes, edges) {
    return JSON.stringify({ nodes, edges });
}

/**
 * Parse le JSON de la DB en nodes/edges React Flow
 */
export function deserializeProject(content) {
    try {
        const data = JSON.parse(content);
        return {
            nodes: data.nodes || [],
            edges: data.edges || [],
        };
    } catch {
        return { nodes: [], edges: [] };
    }
}
