import { useState, useRef, useEffect } from 'react';
import './SlideEditor.css';

// Templates prédéfinis - 5 Styles avec variantes
const TEMPLATES = [
  // ===== STYLE 1: MINIMALISTE =====
  {
    id: 'minimal-blank',
    name: 'Vierge',
    preview: '⬜',
    category: '🤍 Minimaliste',
    elements: [],
    backgroundColor: '#ffffff',
  },
  {
    id: 'minimal-title',
    name: 'Titre',
    preview: '📝',
    category: '🤍 Minimaliste',
    backgroundColor: '#ffffff',
    elements: [
      { id: 1, type: 'text', x: 100, y: 180, width: 600, height: 70, content: 'Titre principal', fontSize: 48, fontWeight: 'bold', color: '#1a1a1a', align: 'center' },
      { id: 2, type: 'rectangle', x: 350, y: 270, width: 100, height: 3, backgroundColor: '#1a1a1a', borderRadius: 2 },
      { id: 3, type: 'text', x: 150, y: 300, width: 500, height: 35, content: 'Sous-titre de la présentation', fontSize: 20, color: '#666666', align: 'center' },
    ],
  },
  {
    id: 'minimal-content',
    name: 'Contenu',
    preview: '📄',
    category: '🤍 Minimaliste',
    backgroundColor: '#ffffff',
    elements: [
      { id: 1, type: 'text', x: 60, y: 50, width: 680, height: 50, content: 'Titre de section', fontSize: 36, fontWeight: 'bold', color: '#1a1a1a' },
      { id: 2, type: 'rectangle', x: 60, y: 110, width: 60, height: 3, backgroundColor: '#1a1a1a', borderRadius: 2 },
      { id: 3, type: 'text', x: 60, y: 145, width: 680, height: 300, content: '• Premier point\n\n• Deuxième point\n\n• Troisième point', fontSize: 20, color: '#444444' },
    ],
  },
  {
    id: 'minimal-two-cols',
    name: 'Deux colonnes',
    preview: '▥',
    category: '🤍 Minimaliste',
    backgroundColor: '#ffffff',
    elements: [
      { id: 1, type: 'text', x: 60, y: 40, width: 680, height: 45, content: 'Comparaison', fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
      { id: 2, type: 'rectangle', x: 60, y: 100, width: 320, height: 350, backgroundColor: '#f5f5f5', borderRadius: 8 },
      { id: 3, type: 'rectangle', x: 420, y: 100, width: 320, height: 350, backgroundColor: '#f5f5f5', borderRadius: 8 },
      { id: 4, type: 'text', x: 80, y: 120, width: 280, height: 35, content: 'Option A', fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
      { id: 5, type: 'text', x: 440, y: 120, width: 280, height: 35, content: 'Option B', fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
      { id: 6, type: 'text', x: 80, y: 170, width: 280, height: 260, content: '• Point 1\n\n• Point 2\n\n• Point 3', fontSize: 16, color: '#555555' },
      { id: 7, type: 'text', x: 440, y: 170, width: 280, height: 260, content: '• Point 1\n\n• Point 2\n\n• Point 3', fontSize: 16, color: '#555555' },
    ],
  },
  {
    id: 'minimal-end',
    name: 'Fin',
    preview: '👋',
    category: '🤍 Minimaliste',
    backgroundColor: '#ffffff',
    elements: [
      { id: 1, type: 'text', x: 100, y: 180, width: 600, height: 70, content: 'Merci', fontSize: 56, fontWeight: 'bold', color: '#1a1a1a', align: 'center' },
      { id: 2, type: 'text', x: 200, y: 280, width: 400, height: 30, content: 'Des questions ?', fontSize: 20, color: '#888888', align: 'center' },
    ],
  },

  // ===== STYLE 2: CORPORATE BLEU =====
  {
    id: 'corporate-blank',
    name: 'Vierge',
    preview: '⬜',
    category: '💼 Corporate',
    elements: [
      { id: 1, type: 'rectangle', x: 0, y: 460, width: 800, height: 40, backgroundColor: '#1e40af', borderRadius: 0 },
    ],
    backgroundColor: '#f8fafc',
  },
  {
    id: 'corporate-title',
    name: 'Titre',
    preview: '📝',
    category: '💼 Corporate',
    backgroundColor: '#1e3a5f',
    elements: [
      { id: 1, type: 'rectangle', x: 0, y: 0, width: 800, height: 500, backgroundColor: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', borderRadius: 0 },
      { id: 2, type: 'rectangle', x: 60, y: 60, width: 8, height: 120, backgroundColor: '#3b82f6', borderRadius: 4 },
      { id: 3, type: 'text', x: 90, y: 70, width: 650, height: 60, content: 'PRÉSENTATION', fontSize: 18, fontWeight: 'bold', color: '#60a5fa', letterSpacing: 4 },
      { id: 4, type: 'text', x: 90, y: 110, width: 650, height: 70, content: 'Titre Principal', fontSize: 48, fontWeight: 'bold', color: '#ffffff' },
      { id: 5, type: 'text', x: 90, y: 350, width: 400, height: 35, content: 'Votre Entreprise', fontSize: 18, color: '#94a3b8' },
      { id: 6, type: 'text', x: 90, y: 385, width: 400, height: 30, content: 'Janvier 2026', fontSize: 14, color: '#64748b' },
    ],
  },
  {
    id: 'corporate-content',
    name: 'Contenu',
    preview: '📄',
    category: '💼 Corporate',
    backgroundColor: '#f8fafc',
    elements: [
      { id: 1, type: 'rectangle', x: 0, y: 0, width: 800, height: 80, backgroundColor: '#1e40af', borderRadius: 0 },
      { id: 2, type: 'text', x: 60, y: 25, width: 680, height: 40, content: 'Titre de la section', fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
      { id: 3, type: 'text', x: 60, y: 110, width: 680, height: 340, content: '• Premier point important à développer\n\n• Deuxième élément clé de votre argumentation\n\n• Troisième point avec les détails nécessaires\n\n• Conclusion ou transition', fontSize: 18, color: '#334155' },
    ],
  },
  {
    id: 'corporate-stats',
    name: 'Statistiques',
    preview: '📊',
    category: '💼 Corporate',
    backgroundColor: '#f8fafc',
    elements: [
      { id: 1, type: 'rectangle', x: 0, y: 0, width: 800, height: 80, backgroundColor: '#1e40af', borderRadius: 0 },
      { id: 2, type: 'text', x: 60, y: 25, width: 680, height: 40, content: 'Nos résultats', fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
      { id: 3, type: 'rectangle', x: 60, y: 110, width: 200, height: 140, backgroundColor: '#ffffff', borderRadius: 12 },
      { id: 4, type: 'text', x: 80, y: 130, width: 160, height: 50, content: '2.5M', fontSize: 36, fontWeight: 'bold', color: '#1e40af', align: 'center' },
      { id: 5, type: 'text', x: 80, y: 185, width: 160, height: 25, content: 'Utilisateurs', fontSize: 14, color: '#64748b', align: 'center' },
      { id: 6, type: 'rectangle', x: 300, y: 110, width: 200, height: 140, backgroundColor: '#ffffff', borderRadius: 12 },
      { id: 7, type: 'text', x: 320, y: 130, width: 160, height: 50, content: '+45%', fontSize: 36, fontWeight: 'bold', color: '#059669', align: 'center' },
      { id: 8, type: 'text', x: 320, y: 185, width: 160, height: 25, content: 'Croissance', fontSize: 14, color: '#64748b', align: 'center' },
      { id: 9, type: 'rectangle', x: 540, y: 110, width: 200, height: 140, backgroundColor: '#ffffff', borderRadius: 12 },
      { id: 10, type: 'text', x: 560, y: 130, width: 160, height: 50, content: '98%', fontSize: 36, fontWeight: 'bold', color: '#dc2626', align: 'center' },
      { id: 11, type: 'text', x: 560, y: 185, width: 160, height: 25, content: 'Satisfaction', fontSize: 14, color: '#64748b', align: 'center' },
      { id: 12, type: 'rectangle', x: 60, y: 280, width: 680, height: 170, backgroundColor: '#ffffff', borderRadius: 12 },
      { id: 13, type: 'text', x: 100, y: 340, width: 600, height: 40, content: '📈 Zone graphique', fontSize: 20, color: '#94a3b8', align: 'center' },
    ],
  },
  {
    id: 'corporate-end',
    name: 'Fin',
    preview: '👋',
    category: '💼 Corporate',
    backgroundColor: '#1e3a5f',
    elements: [
      { id: 1, type: 'text', x: 100, y: 150, width: 600, height: 70, content: 'Merci de votre attention', fontSize: 40, fontWeight: 'bold', color: '#ffffff', align: 'center' },
      { id: 2, type: 'rectangle', x: 300, y: 240, width: 200, height: 4, backgroundColor: '#3b82f6', borderRadius: 2 },
      { id: 3, type: 'text', x: 200, y: 280, width: 400, height: 30, content: 'Questions ?', fontSize: 24, color: '#94a3b8', align: 'center' },
      { id: 4, type: 'text', x: 200, y: 380, width: 400, height: 25, content: 'contact@entreprise.com', fontSize: 16, color: '#60a5fa', align: 'center' },
    ],
  },

  // ===== STYLE 3: CRÉATIF GRADIENT =====
  {
    id: 'creative-blank',
    name: 'Vierge',
    preview: '⬜',
    category: '🎨 Créatif',
    elements: [],
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'creative-title',
    name: 'Titre',
    preview: '📝',
    category: '🎨 Créatif',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    elements: [
      { id: 1, type: 'text', x: 100, y: 160, width: 600, height: 80, content: 'Créativité', fontSize: 64, fontWeight: 'bold', color: '#ffffff', align: 'center' },
      { id: 2, type: 'text', x: 150, y: 260, width: 500, height: 40, content: 'Libérez votre imagination', fontSize: 24, color: 'rgba(255,255,255,0.85)', align: 'center' },
      { id: 3, type: 'rectangle', x: 300, y: 340, width: 200, height: 50, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25 },
      { id: 4, type: 'text', x: 320, y: 352, width: 160, height: 30, content: 'Commencer →', fontSize: 16, fontWeight: 'bold', color: '#ffffff', align: 'center' },
    ],
  },
  {
    id: 'creative-content',
    name: 'Contenu',
    preview: '📄',
    category: '🎨 Créatif',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    elements: [
      { id: 1, type: 'rectangle', x: 50, y: 50, width: 700, height: 400, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
      { id: 2, type: 'text', x: 80, y: 80, width: 640, height: 50, content: 'Titre de section', fontSize: 36, fontWeight: 'bold', color: '#ffffff' },
      { id: 3, type: 'rectangle', x: 80, y: 140, width: 80, height: 4, backgroundColor: '#ffffff', borderRadius: 2 },
      { id: 4, type: 'text', x: 80, y: 175, width: 640, height: 250, content: '✦ Premier point créatif\n\n✦ Deuxième idée innovante\n\n✦ Troisième concept original', fontSize: 20, color: 'rgba(255,255,255,0.9)' },
    ],
  },
  {
    id: 'creative-quote',
    name: 'Citation',
    preview: '💬',
    category: '🎨 Créatif',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    elements: [
      { id: 1, type: 'text', x: 80, y: 120, width: 100, height: 100, content: '"', fontSize: 150, fontWeight: 'bold', color: 'rgba(255,255,255,0.3)' },
      { id: 2, type: 'text', x: 120, y: 180, width: 560, height: 120, content: 'L\'imagination est plus importante que le savoir.', fontSize: 32, color: '#ffffff', align: 'center' },
      { id: 3, type: 'text', x: 200, y: 340, width: 400, height: 30, content: '— Albert Einstein', fontSize: 18, color: 'rgba(255,255,255,0.7)', align: 'center' },
    ],
  },
  {
    id: 'creative-end',
    name: 'Fin',
    preview: '👋',
    category: '🎨 Créatif',
    backgroundColor: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    elements: [
      { id: 1, type: 'text', x: 100, y: 170, width: 600, height: 80, content: 'Merci ! ✨', fontSize: 56, fontWeight: 'bold', color: '#ffffff', align: 'center' },
      { id: 2, type: 'text', x: 200, y: 280, width: 400, height: 35, content: 'Restons connectés', fontSize: 22, color: 'rgba(255,255,255,0.8)', align: 'center' },
      { id: 3, type: 'rectangle', x: 250, y: 350, width: 300, height: 50, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 25 },
      { id: 4, type: 'text', x: 270, y: 362, width: 260, height: 30, content: '@votrecompte', fontSize: 18, color: '#ffffff', align: 'center' },
    ],
  },

  // ===== STYLE 4: SOMBRE ÉLÉGANT =====
  {
    id: 'dark-blank',
    name: 'Vierge',
    preview: '⬜',
    category: '🌙 Sombre',
    elements: [],
    backgroundColor: '#0a0a0a',
  },
  {
    id: 'dark-title',
    name: 'Titre',
    preview: '📝',
    category: '🌙 Sombre',
    backgroundColor: '#0a0a0a',
    elements: [
      { id: 1, type: 'rectangle', x: 60, y: 100, width: 4, height: 300, backgroundColor: '#fbbf24', borderRadius: 2 },
      { id: 2, type: 'text', x: 90, y: 120, width: 650, height: 35, content: 'PRÉSENTATION', fontSize: 16, fontWeight: 'bold', color: '#fbbf24', letterSpacing: 6 },
      { id: 3, type: 'text', x: 90, y: 170, width: 650, height: 80, content: 'Titre Élégant', fontSize: 56, fontWeight: 'bold', color: '#ffffff' },
      { id: 4, type: 'text', x: 90, y: 280, width: 500, height: 30, content: 'Sous-titre raffiné', fontSize: 22, color: '#737373' },
      { id: 5, type: 'text', x: 90, y: 380, width: 300, height: 25, content: '— Votre Nom', fontSize: 14, color: '#525252' },
    ],
  },
  {
    id: 'dark-content',
    name: 'Contenu',
    preview: '📄',
    category: '🌙 Sombre',
    backgroundColor: '#0a0a0a',
    elements: [
      { id: 1, type: 'rectangle', x: 60, y: 40, width: 4, height: 60, backgroundColor: '#fbbf24', borderRadius: 2 },
      { id: 2, type: 'text', x: 85, y: 45, width: 650, height: 50, content: 'Section', fontSize: 38, fontWeight: 'bold', color: '#ffffff' },
      { id: 3, type: 'text', x: 85, y: 130, width: 630, height: 320, content: '→ Premier point avec détails\n\n→ Deuxième élément important\n\n→ Troisième argument clé', fontSize: 20, color: '#a3a3a3' },
    ],
  },
  {
    id: 'dark-image',
    name: 'Image',
    preview: '🖼️',
    category: '🌙 Sombre',
    backgroundColor: '#0a0a0a',
    elements: [
      { id: 1, type: 'rectangle', x: 50, y: 50, width: 380, height: 400, backgroundColor: '#171717', borderRadius: 16 },
      { id: 2, type: 'text', x: 180, y: 230, width: 120, height: 40, content: '🖼️', fontSize: 40, align: 'center' },
      { id: 3, type: 'rectangle', x: 470, y: 80, width: 4, height: 100, backgroundColor: '#fbbf24', borderRadius: 2 },
      { id: 4, type: 'text', x: 500, y: 85, width: 250, height: 50, content: 'Titre', fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
      { id: 5, type: 'text', x: 500, y: 150, width: 250, height: 280, content: 'Description de l\'image ou contenu complémentaire.', fontSize: 16, color: '#737373' },
    ],
  },
  {
    id: 'dark-end',
    name: 'Fin',
    preview: '👋',
    category: '🌙 Sombre',
    backgroundColor: '#0a0a0a',
    elements: [
      { id: 1, type: 'rectangle', x: 300, y: 140, width: 200, height: 4, backgroundColor: '#fbbf24', borderRadius: 2 },
      { id: 2, type: 'text', x: 100, y: 180, width: 600, height: 70, content: 'Merci', fontSize: 64, fontWeight: 'bold', color: '#ffffff', align: 'center' },
      { id: 3, type: 'rectangle', x: 300, y: 270, width: 200, height: 4, backgroundColor: '#fbbf24', borderRadius: 2 },
      { id: 4, type: 'text', x: 200, y: 320, width: 400, height: 30, content: 'Questions & Réponses', fontSize: 18, color: '#525252', align: 'center' },
    ],
  },

  // ===== STYLE 5: NATURE / VERT =====
  {
    id: 'nature-blank',
    name: 'Vierge',
    preview: '⬜',
    category: '🌿 Nature',
    elements: [],
    backgroundColor: '#ecfdf5',
  },
  {
    id: 'nature-title',
    name: 'Titre',
    preview: '📝',
    category: '🌿 Nature',
    backgroundColor: 'linear-gradient(180deg, #065f46 0%, #064e3b 100%)',
    elements: [
      { id: 1, type: 'circle', x: 600, y: -100, width: 400, height: 400, backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: 200 },
      { id: 2, type: 'circle', x: -50, y: 300, width: 300, height: 300, backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: 150 },
      { id: 3, type: 'text', x: 80, y: 160, width: 640, height: 80, content: 'Titre Nature', fontSize: 52, fontWeight: 'bold', color: '#ffffff' },
      { id: 4, type: 'text', x: 80, y: 250, width: 500, height: 35, content: 'Inspiré par l\'environnement', fontSize: 22, color: '#6ee7b7' },
      { id: 5, type: 'rectangle', x: 80, y: 320, width: 120, height: 45, backgroundColor: '#10b981', borderRadius: 8 },
      { id: 6, type: 'text', x: 95, y: 332, width: 90, height: 25, content: '🌱 Go', fontSize: 16, fontWeight: 'bold', color: '#ffffff', align: 'center' },
    ],
  },
  {
    id: 'nature-content',
    name: 'Contenu',
    preview: '📄',
    category: '🌿 Nature',
    backgroundColor: '#ecfdf5',
    elements: [
      { id: 1, type: 'rectangle', x: 0, y: 0, width: 80, height: 500, backgroundColor: '#059669', borderRadius: 0 },
      { id: 2, type: 'text', x: 120, y: 50, width: 620, height: 50, content: 'Section écologique', fontSize: 34, fontWeight: 'bold', color: '#064e3b' },
      { id: 3, type: 'rectangle', x: 120, y: 110, width: 100, height: 4, backgroundColor: '#10b981', borderRadius: 2 },
      { id: 4, type: 'text', x: 120, y: 145, width: 620, height: 300, content: '🌿 Premier point durable\n\n🌿 Deuxième initiative verte\n\n🌿 Troisième action responsable', fontSize: 20, color: '#065f46' },
    ],
  },
  {
    id: 'nature-two-cols',
    name: 'Deux colonnes',
    preview: '▥',
    category: '🌿 Nature',
    backgroundColor: '#ecfdf5',
    elements: [
      { id: 1, type: 'text', x: 60, y: 30, width: 680, height: 45, content: 'Avant / Après', fontSize: 32, fontWeight: 'bold', color: '#064e3b' },
      { id: 2, type: 'rectangle', x: 60, y: 90, width: 320, height: 360, backgroundColor: '#d1fae5', borderRadius: 16 },
      { id: 3, type: 'rectangle', x: 420, y: 90, width: 320, height: 360, backgroundColor: '#065f46', borderRadius: 16 },
      { id: 4, type: 'text', x: 80, y: 110, width: 280, height: 35, content: '🏭 Avant', fontSize: 22, fontWeight: 'bold', color: '#064e3b' },
      { id: 5, type: 'text', x: 440, y: 110, width: 280, height: 35, content: '🌳 Après', fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
      { id: 6, type: 'text', x: 80, y: 160, width: 280, height: 270, content: '• Situation initiale\n\n• Problème identifié\n\n• Impact négatif', fontSize: 16, color: '#065f46' },
      { id: 7, type: 'text', x: 440, y: 160, width: 280, height: 270, content: '• Solution mise en place\n\n• Résultats obtenus\n\n• Bénéfices durables', fontSize: 16, color: '#d1fae5' },
    ],
  },
  {
    id: 'nature-end',
    name: 'Fin',
    preview: '👋',
    category: '🌿 Nature',
    backgroundColor: 'linear-gradient(180deg, #064e3b 0%, #022c22 100%)',
    elements: [
      { id: 1, type: 'circle', x: 250, y: 100, width: 300, height: 300, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 150 },
      { id: 2, type: 'text', x: 100, y: 170, width: 600, height: 70, content: 'Merci 🌱', fontSize: 52, fontWeight: 'bold', color: '#ffffff', align: 'center' },
      { id: 3, type: 'text', x: 200, y: 260, width: 400, height: 35, content: 'Ensemble pour la planète', fontSize: 20, color: '#6ee7b7', align: 'center' },
      { id: 4, type: 'text', x: 250, y: 380, width: 300, height: 25, content: 'contact@nature.eco', fontSize: 14, color: '#34d399', align: 'center' },
    ],
  },
];

// Formes disponibles
const SHAPES = [
  { type: 'rectangle', icon: '▭', name: 'Rectangle' },
  { type: 'circle', icon: '●', name: 'Cercle' },
  { type: 'triangle', icon: '△', name: 'Triangle' },
  { type: 'line', icon: '─', name: 'Ligne' },
  { type: 'arrow', icon: '→', name: 'Flèche' },
];

// Polices disponibles
const FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
  { name: 'Palatino', value: 'Palatino Linotype, serif' },
];

// Couleurs prédéfinies
const COLORS = [
  '#000000', '#ffffff', '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a',
  '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548',
];

function SlideEditor({ slide, onSave, onClose }) {
  // Support both shapes: slide.data.* (old) or slide.* (App passes merged props)
  const [elements, setElements] = useState(slide?.elements || slide?.data?.elements || []);
  const [backgroundColor, setBackgroundColor] = useState(slide?.backgroundColor || slide?.data?.backgroundColor || '#ffffff');
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [editingBackground, setEditingBackground] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const [activePanel, setActivePanel] = useState('templates'); // templates, elements, text, upload
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showTemplates, setShowTemplates] = useState(elements.length === 0);
  const [zoom, setZoom] = useState(1);
  const clipboardRef = useRef(null);
  const historyRef = useRef([]);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const slideNumber = slide?.id?.split('-')[1] || '?';
  const elementIdCounter = useRef(Date.now());

  const [slideTitle, setSlideTitle] = useState(slide?.data?.title || slide?.title || `Slide ${slideNumber}`);
  const titleSaveTimeout = useRef(null);

  // Générer un nouvel ID unique
  const generateId = () => {
    elementIdCounter.current += 1;
    return elementIdCounter.current;
  };

  const pushHistory = () => {
    // push shallow snapshot (deep clone elements)
    const snapshot = { elements: JSON.parse(JSON.stringify(elements)), backgroundColor };
    historyRef.current.push(snapshot);
    if (historyRef.current.length > 30) historyRef.current.shift();
  };

  // Sauvegarder
  const handleSave = () => {
    const baseData = slide?.data || {};
    onSave(slide.id, {
      ...baseData,
      elements,
      backgroundColor,
      title: slideTitle || elements.find(el => el.type === 'text')?.content || 'Sans titre',
    });
  };

  // Handler pour modification du titre (debounced save)
  const handleTitleChange = (value) => {
    setSlideTitle(value);
    if (titleSaveTimeout.current) clearTimeout(titleSaveTimeout.current);
    titleSaveTimeout.current = setTimeout(() => {
      const baseData = slide?.data || {};
      onSave(slide.id, { ...baseData, elements, backgroundColor, title: value });
    }, 600);
  };

  // Nettoyage du timeout au démontage
  useEffect(() => {
    return () => {
      if (titleSaveTimeout.current) clearTimeout(titleSaveTimeout.current);
    };
  }, []);

  // Si le slide change côté parent, synchroniser le titre
  useEffect(() => {
    const incomingTitle = slide?.data?.title || slide?.title;
    if (incomingTitle !== undefined && incomingTitle !== slideTitle) {
      setSlideTitle(incomingTitle);
    }
  }, [slide]);

  // Appliquer un template
  const applyTemplate = (template) => {
    pushHistory();
    setBackgroundColor(template.backgroundColor);
    setElements(template.elements.map(el => ({ ...el, id: generateId() })));
    setShowTemplates(false);
    setSelectedElement(null);
  };

  // === GESTION DES ÉLÉMENTS ===

  // Ajouter un texte
  const addText = () => {
    pushHistory();
    const newElement = {
      id: generateId(),
      type: 'text',
      x: 100,
      y: 100,
      width: 300,
      height: 50,
      content: '',
      placeholder: 'Double-cliquez pour éditer',
      fontSize: 24,
      backgroundColor: 'transparent',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#333333',
      align: 'left',
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setEditingBackground(false);
  };

  // Ajouter une forme
  const addShape = (shapeType) => {
    pushHistory();
    const newElement = {
      id: generateId(),
      type: shapeType,
      x: 150,
      y: 150,
      width: shapeType === 'line' ? 200 : 120,
      height: shapeType === 'line' ? 4 : 120,
      backgroundColor: '#4285f4',
      borderRadius: shapeType === 'circle' ? 999 : 8,
      borderWidth: 0,
      borderColor: '#000000',
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setEditingBackground(false);
  };

  // Upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        pushHistory();
        const newElement = {
          id: generateId(),
          type: 'image',
          x: 100,
          y: 100,
          width: 250,
          height: 180,
          src: event.target.result,
          borderRadius: 8,
        };
        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
        setEditingBackground(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Supprimer l'élément sélectionné
  const deleteSelected = () => {
    if (selectedElements && selectedElements.length > 0) {
      pushHistory();
      const toRemove = new Set(selectedElements);
      const newElements = elements.filter(el => !toRemove.has(el.id));
      setElements(newElements);
      setSelectedElements([]);
      setSelectedElement(null);
      return;
    }
    if (selectedElement) {
      pushHistory();
      const newElements = elements.filter(el => el.id !== selectedElement);
      setElements(newElements);
      setSelectedElement(null);
    }
  };

  // Dupliquer l'élément sélectionné
  const duplicateSelected = () => {
    const el = elements.find(e => e.id === selectedElement);
    if (el) {
      pushHistory();
      const newElement = { ...el, id: generateId(), x: el.x + 20, y: el.y + 20 };
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      setEditingBackground(false);
    }
  };

  // Modifier un élément
  const updateElement = (id, updates) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  // === DRAG & DROP & RESIZE ===

  const handleMouseDown = (e, element) => {
    e.stopPropagation();
    // start dragging element
    pushHistory();
    setSelectedElement(element.id);
    // ensure element becomes primary selection in multi-select
    setSelectedElements(prev => prev.includes(element.id) ? prev : [element.id]);
    setEditingBackground(false);
    setIsDragging(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - element.x * zoom,
      y: e.clientY - rect.top - element.y * zoom,
    });
  };

  // Démarrer le redimensionnement
  const handleResizeMouseDown = (e, element, handle) => {
    e.stopPropagation();
    pushHistory();
    setSelectedElement(element.id);
    setIsResizing(true);
    setResizeHandle(handle);
    
    const rect = canvasRef.current.getBoundingClientRect();
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    });
  };

  const handleMouseMove = (e) => {
    if (isSelecting && selectionStart) {
      // update selection rect
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.min(selectionStart.x, e.clientX);
      const y = Math.min(selectionStart.y, e.clientY);
      const w = Math.abs(selectionStart.x - e.clientX);
      const h = Math.abs(selectionStart.y - e.clientY);
      setSelectionRect({ x, y, w, h });
      return;
    }

    if (isResizing && selectedElement) {
      const el = elements.find(el => el.id === selectedElement);
      if (!el) return;

      const deltaX = (e.clientX - resizeStart.mouseX) / zoom;
      const deltaY = (e.clientY - resizeStart.mouseY) / zoom;

      let newX = resizeStart.x;
      let newY = resizeStart.y;
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      // Calculer les nouvelles dimensions selon le handle
      if (resizeHandle.includes('e')) {
        newWidth = Math.max(20, resizeStart.width + deltaX);
      }
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(20, resizeStart.width - deltaX);
        newX = resizeStart.x + (resizeStart.width - newWidth);
      }
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(20, resizeStart.height + deltaY);
      }
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(20, resizeStart.height - deltaY);
        newY = resizeStart.y + (resizeStart.height - newHeight);
      }

      updateElement(selectedElement, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
      return;
    }

    if (!isDragging || !selectedElement) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left - dragOffset.x) / zoom;
    const newY = (e.clientY - rect.top - dragOffset.y) / zoom;
    
    updateElement(selectedElement, {
      x: Math.max(0, Math.min(newX, 800 - (elements.find(el => el.id === selectedElement)?.width || 0))),
      y: Math.max(0, Math.min(newY, 500 - (elements.find(el => el.id === selectedElement)?.height || 0))),
    });
  };

  const handleMouseUp = (e) => {
    // finalize selection rectangle
    if (isSelecting) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x1 = Math.min(selectionStart.x, e.clientX) - rect.left;
      const y1 = Math.min(selectionStart.y, e.clientY) - rect.top;
      const x2 = Math.max(selectionStart.x, e.clientX) - rect.left;
      const y2 = Math.max(selectionStart.y, e.clientY) - rect.top;
      const sx = x1 / zoom;
      const sy = y1 / zoom;
      const sw = (x2 - x1) / zoom;
      const sh = (y2 - y1) / zoom;
      const hits = elements.filter(el => {
        const ex = el.x;
        const ey = el.y;
        const ew = el.width || 0;
        const eh = el.height || 0;
        return !(ex > sx + sw || ex + ew < sx || ey > sy + sh || ey + eh < sy);
      }).map(el => el.id);
      setSelectedElements(hits);
      setSelectedElement(hits[0] || null);
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionRect(null);
      return;
    }

    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Désélectionner en cliquant sur le canvas
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
      setSelectedElements([]);
      setEditingBackground(true);
    }
  };

  const handleCanvasMouseDown = (e) => {
    // Only start selection when clicking on empty canvas with Alt key
    if (e.target !== canvasRef.current) return;
    if (e.altKey) {
      setIsSelecting(true);
      setSelectionStart({ x: e.clientX, y: e.clientY });
      setSelectionRect({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
    } else {
      // normal click clears selection
      setSelectedElement(null);
      setSelectedElements([]);
      setEditingBackground(true);
    }
  };

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete element(s)
      if (e.key === 'Delete') {
        if ((selectedElement || (selectedElements && selectedElements.length > 0)) && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          deleteSelected();
        }
      }

      // Duplicate (Ctrl/Cmd + D)
      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        duplicateSelected();
      }

      // Copy / Paste / Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const k = e.key.toLowerCase();
        if (k === 'c') {
          // Copy selected element(s)
          if (selectedElements && selectedElements.length > 0) {
            const items = elements.filter(el => selectedElements.includes(el.id));
            clipboardRef.current = JSON.parse(JSON.stringify(items));
          } else {
            const el = elements.find(el => el.id === selectedElement);
            if (el) clipboardRef.current = JSON.parse(JSON.stringify(el));
          }
        }
        if (k === 'v') {
          // Paste (single or multiple)
          if (clipboardRef.current) {
            e.preventDefault();
            pushHistory();
            if (Array.isArray(clipboardRef.current)) {
              const pasted = clipboardRef.current.map(item => ({ ...item, id: generateId(), x: (item.x || 100) + 20, y: (item.y || 100) + 20 }));
              setElements(prev => [...prev, ...pasted]);
              setSelectedElements(pasted.map(p => p.id));
              setSelectedElement(pasted[0].id);
            } else {
              const copied = JSON.parse(JSON.stringify(clipboardRef.current));
              copied.id = generateId();
              copied.x = (copied.x || 100) + 20;
              copied.y = (copied.y || 100) + 20;
              setElements(prev => [...prev, copied]);
              setSelectedElement(copied.id);
              setSelectedElements([copied.id]);
            }
          }
        }
        if (k === 'z') {
          e.preventDefault();
          // Undo
          const prev = historyRef.current.pop();
          if (prev) {
            setElements(prev.elements);
            setBackgroundColor(prev.backgroundColor);
            setSelectedElement(null);
          }
        }
      }

      if (e.key === 'Escape') {
        setSelectedElement(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, selectedElements, elements]);

  // Obtenir l'élément sélectionné
  const selectedEl = elements.find(el => el.id === selectedElement);

  // Poignées de redimensionnement
  const renderResizeHandles = (element) => {
    const handles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
    return handles.map(handle => (
      <div
        key={handle}
        className={`resize-handle resize-${handle}`}
        onMouseDown={(e) => handleResizeMouseDown(e, element, handle)}
      />
    ));
  };

  // Rendu d'un élément
  const renderElement = (element) => {
    const isSelected = selectedElement === element.id || selectedElements.includes(element.id);
    const baseStyle = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      cursor: isDragging ? 'grabbing' : 'grab',
    };

    switch (element.type) {
      case 'text':
      return (
          <div
            key={element.id}
            className={`canvas-element ${isSelected ? 'selected' : ''}`}
            style={{
              ...baseStyle,
              backgroundColor: element.backgroundColor, // S'applique ici
              borderRadius: element.borderRadius || 0,   // Permet aussi d'arrondir le fond
              padding: element.padding || 0,            // Gère l'espace interne
            }}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
          <div
            contentEditable
            suppressContentEditableWarning
            className="text-content"
            data-placeholder="Double-cliquez pour éditer"
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily || 'Inter, sans-serif',
              fontWeight: element.fontWeight,
              fontStyle: element.fontStyle,
              textDecoration: element.textDecoration, // Ajoutez cette ligne
              color: element.color,
              textAlign: element.align,
              borderRadius: element.borderRadius || 0,
              width: '100%',
              height: '100%',
              outline: 'none',
            }}
            onBlur={(e) => updateElement(element.id, { content: e.target.innerText })}
          >
            {element.content}
          </div>
            {isSelected && renderResizeHandles(element)}
          </div>
        );

      case 'image':
        return (
          <div
            key={element.id}
            className={`canvas-element ${isSelected ? 'selected' : ''}`}
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <img
              src={element.src}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: element.borderRadius,
                pointerEvents: 'none',
              }}
            />
            {isSelected && renderResizeHandles(element)}
          </div>
        );

      case 'rectangle':
        return (
          <div
            key={element.id}
            className={`canvas-element ${isSelected ? 'selected' : ''}`}
            style={{
              ...baseStyle,
              backgroundColor: element.backgroundColor,
              borderRadius: element.borderRadius,
              border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
            }}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            {isSelected && renderResizeHandles(element)}
          </div>
        );

      case 'circle':
        return (
          <div
            key={element.id}
            className={`canvas-element ${isSelected ? 'selected' : ''}`}
            style={{
              ...baseStyle,
              backgroundColor: element.backgroundColor,
              borderRadius: '50%',
              border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
            }}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            {isSelected && renderResizeHandles(element)}
          </div>
        );

      case 'triangle':
        return (
          <div
            key={element.id}
            className={`canvas-element ${isSelected ? 'selected' : ''}`}
            style={{
              ...baseStyle,
              backgroundColor: 'transparent',
            }}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
              <polygon points="50,5 95,95 5,95" fill={element.backgroundColor} />
            </svg>
            {isSelected && renderResizeHandles(element)}
          </div>
        );

      case 'line':
        return (
          <div
            key={element.id}
            className={`canvas-element ${isSelected ? 'selected' : ''}`}
            style={{
              ...baseStyle,
              backgroundColor: element.backgroundColor,
              borderRadius: 2,
            }}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            {isSelected && renderResizeHandles(element)}
          </div>
        );

      case 'arrow':
        return (
          <div
            key={element.id}
            className={`canvas-element ${isSelected ? 'selected' : ''}`}
            style={{
              ...baseStyle,
              backgroundColor: 'transparent',
            }}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <svg viewBox="0 0 100 50" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
              <polygon points="0,15 70,15 70,0 100,25 70,50 70,35 0,35" fill={element.backgroundColor} />
            </svg>
            {isSelected && renderResizeHandles(element)}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="slide-editor-canva">
      {/* Input caché pour upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* Header */}
        <header className="editor-header-canva">
        <div className="header-left">
          <button className="back-button" onClick={() => { setEditingBackground(false); handleSave(); onClose(); }}>
            ← Retour
          </button>
          <input
            className="slide-title-input"
            value={slideTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            onFocus={() => setEditingBackground(false)}
            aria-label={`Titre de la slide ${slideNumber}`}
          />
        </div>
        <div className="header-center">
          <div className="zoom-controls">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>−</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))}>+</button>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-preview" onClick={() => setShowTemplates(true)}>
            📋 Templates
          </button>
          
        </div>
      </header>

      <div className="editor-body">
        {/* Sidebar gauche - Outils */}
        <aside className="sidebar-left">
          <div className="sidebar-section">
            <button
              className={`sidebar-btn ${activePanel === 'templates' ? 'active' : ''}`}
              onClick={() => setShowTemplates(true)}
            >
              <span className="icon">📋</span>
              <span>Templates</span>
            </button>
            <button
              className={`sidebar-btn ${activePanel === 'text' ? 'active' : ''}`}
              onClick={() => { setActivePanel('text'); addText(); }}
            >
              <span className="icon">T</span>
              <span>Texte</span>
            </button>
            <button
              className={`sidebar-btn ${activePanel === 'elements' ? 'active' : ''}`}
              onClick={() => setActivePanel('elements')}
            >
              <span className="icon">◇</span>
              <span>Formes</span>
            </button>
            <button
              className={`sidebar-btn ${activePanel === 'upload' ? 'active' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="icon">🖼️</span>
              <span>Image</span>
            </button>
          </div>

          {/* Panneau Formes */}
          {activePanel === 'elements' && (
            <div className="panel-content">
              <h4>Formes</h4>
              <div className="shapes-grid">
                {SHAPES.map(shape => (
                  <button
                    key={shape.type}
                    className="shape-btn"
                    onClick={() => addShape(shape.type)}
                    title={shape.name}
                  >
                    {shape.icon}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Canvas principal */}
        <main className="canvas-area">
          <div
            className="canvas-wrapper"
            style={{ transform: `scale(${zoom})` }}
          >
            <div
              ref={canvasRef}
              className="slide-canvas-canva"
              style={{ background: backgroundColor }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {elements.map(renderElement)}
              {isSelecting && selectionRect && (
                <div
                  className="selection-rect"
                  style={{
                    position: 'absolute',
                    left: selectionRect.x - canvasRef.current.getBoundingClientRect().left,
                    top: selectionRect.y - canvasRef.current.getBoundingClientRect().top,
                    width: selectionRect.w,
                    height: selectionRect.h,
                    border: '1px dashed rgba(124,58,237,0.9)',
                    background: 'rgba(124,58,237,0.08)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          </div>
        </main>

        {/* Sidebar droite - Propriétés */}
        <aside className="sidebar-right">
          {/* Couleur de fond de la slide (général) */}
          <div className={`property-group ${editingBackground ? 'background-active' : ''}`}>
            <label>Fond de la diapositive</label>
            <div className="color-grid">
              {COLORS.map(color => (
                <button
                  key={color}
                  className={`color-swatch ${backgroundColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setBackgroundColor(color)}
                />
              ))}
              {/* input couleur supprimé pour éviter le petit carré */}
            </div>
          </div>
          {selectedEl ? (
            <div className="properties-panel">
              <h3>Propriétés</h3>

              {/* 1. POSITION & TAILLE (Commun à tous) */}
              <div className="property-group">
                <label>Dimensions</label>
                <div className="input-row">
                  <div className="input-group"><span>X</span><input type="number" value={Math.round(selectedEl.x)} onChange={(e) => updateElement(selectedEl.id, { x: Number(e.target.value) })} /></div>
                  <div className="input-group"><span>Y</span><input type="number" value={Math.round(selectedEl.y)} onChange={(e) => updateElement(selectedEl.id, { y: Number(e.target.value) })} /></div>
                </div>
                <div className="input-row" style={{ marginTop: '8px' }}>
                  <div className="input-group"><span>L</span><input type="number" value={Math.round(selectedEl.width)} onChange={(e) => updateElement(selectedEl.id, { width: Number(e.target.value) })} /></div>
                  <div className="input-group"><span>H</span><input type="number" value={Math.round(selectedEl.height)} onChange={(e) => updateElement(selectedEl.id, { height: Number(e.target.value) })} /></div>
                </div>
              </div>

              {/* 2. STYLE DE TEXTE (Uniquement pour le texte) */}
              {selectedEl.type === 'text' && (
                <>
                  <div className="property-group">
                    <label>Police & Style</label>
                    <select className="font-select" value={selectedEl.fontFamily || 'Inter, sans-serif'} onChange={(e) => updateElement(selectedEl.id, { fontFamily: e.target.value })}>
                      {FONTS.map(font => <option key={font.value} value={font.value}>{font.name}</option>)}
                    </select>
                    <div className="style-buttons" style={{ marginTop: '8px' }}>
                      <button className={selectedEl.fontWeight === 'bold' ? 'active' : ''} onClick={() => updateElement(selectedEl.id, { fontWeight: selectedEl.fontWeight === 'bold' ? 'normal' : 'bold' })}>B</button>
                      <button className={selectedEl.fontStyle === 'italic' ? 'active' : ''} onClick={() => updateElement(selectedEl.id, { fontStyle: selectedEl.fontStyle === 'italic' ? 'normal' : 'italic' })}>I</button>
                      <button className={selectedEl.textDecoration === 'underline' ? 'active' : ''} onClick={() => updateElement(selectedEl.id, { textDecoration: selectedEl.textDecoration === 'underline' ? 'none' : 'underline' })}>U</button>
                    </div>
                    <div className="font-size-control" style={{ marginTop: 10 }}>
                      <label style={{ display: 'block', marginBottom: 6 }}>Taille</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="range" min="8" max="120" value={selectedEl.fontSize || 14} onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })} />
                        <input type="number" min="8" max="120" value={selectedEl.fontSize || 14} onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })} style={{ width: 64, padding: '6px', borderRadius: 6, border: '1px solid #555' }} />
                      </div>
                    </div>
                  </div>
                  <div className="property-group">
                    <label>Alignement</label>
                    <div className="style-buttons">
                      <button
                        className={selectedEl.align === 'left' ? 'active' : ''}
                        onClick={() => updateElement(selectedEl.id, { align: 'left' })}
                      >⬅</button>
                      <button
                        className={selectedEl.align === 'center' ? 'active' : ''}
                        onClick={() => updateElement(selectedEl.id, { align: 'center' })}
                      >⬌</button>
                      <button
                        className={selectedEl.align === 'right' ? 'active' : ''}
                        onClick={() => updateElement(selectedEl.id, { align: 'right' })}
                      >➡</button>
                    </div>
                  </div>
                  <div className="property-group">
                    <label>Couleur du texte</label>
                    <div className="color-grid">
                      {COLORS.map(color => (
                        <button key={color} className={`color-swatch ${selectedEl.color === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => updateElement(selectedEl.id, { color })} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 3. FOND & REMPLISSAGE (Sauf pour les lignes et images) */}
              {!['line', 'image'].includes(selectedEl.type) && (
                <div className="property-group">
                  <label>Couleur du fond</label>
                  <div className="color-grid">
                    <button className={`color-swatch transparent ${selectedEl.backgroundColor === 'transparent' ? 'active' : ''}`} onClick={() => updateElement(selectedEl.id, { backgroundColor: 'transparent' })}>T</button>
                    {COLORS.map(color => (
                      <button key={color} className={`color-swatch ${selectedEl.backgroundColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => updateElement(selectedEl.id, { backgroundColor: color })} />
                    ))}
                  </div>
                </div>
              )}

              {/* 4. BORDURES (Rectangle, Cercle, Texte) */}
              {['rectangle', 'circle'].includes(selectedEl.type) && (
                <div className="property-group">
                  <label>Bordure</label>
                  <div className="color-grid" style={{ marginBottom: '8px' }}>
                    <button className={`color-swatch transparent ${!selectedEl.borderWidth ? 'active' : ''}`} onClick={() => updateElement(selectedEl.id, { borderWidth: 0 })}>❌</button>
                    {COLORS.map(color => (
                      <button key={color} className={`color-swatch ${selectedEl.borderColor === color ? 'active' : ''}`} style={{ backgroundColor: color, border: '1px solid #ddd' }} onClick={() => updateElement(selectedEl.id, { borderColor: color, borderWidth: selectedEl.borderWidth || 2 })} />
                    ))}
                  </div>
                  <label>Épaisseur</label>
                  <input type="range" min="0" max="20" value={selectedEl.borderWidth || 0} onChange={(e) => updateElement(selectedEl.id, { borderWidth: Number(e.target.value) })} />
                </div>
              )}

              {/* 5. ARRONDI (Rectangle, Image, Texte) */}
              {['rectangle', 'image', 'text'].includes(selectedEl.type) && (
                <div className="property-group">
                  <label>Arrondi</label>
                  <input type="range" min="0" max="100" value={selectedEl.borderRadius || 0} onChange={(e) => updateElement(selectedEl.id, { borderRadius: Number(e.target.value) })} />
                  <span className="range-value">{selectedEl.borderRadius || 0}px</span>
                </div>
              )}

              {/* 6. ACTIONS */}
              <div className="property-group actions">
                <button className="action-btn duplicate" onClick={duplicateSelected}>📋 Dupliquer</button>
                <button className="action-btn delete" onClick={deleteSelected}>🗑️ Supprimer</button>
              </div>
            </div>
          ) : (
            <div className="no-selection">Sélectionnez un élément pour le modifier</div>
          )}
        </aside>
      </div>

      {/* Modal Templates */}
      {showTemplates && (
        <div className="templates-modal" onClick={() => setShowTemplates(false)}>
          <div className="templates-content" onClick={e => e.stopPropagation()}>
            <h2>Choisir un template</h2>
            <div className="templates-categories">
              {/* Grouper les templates par catégorie */}
              {[...new Set(TEMPLATES.map(t => t.category || 'Autre'))].map(category => (
                <div key={category} className="template-category">
                  <h3 className="category-title">{category}</h3>
                  <div className="templates-grid">
                    {TEMPLATES.filter(t => (t.category || 'Autre') === category).map(template => (
                      <button
                        key={template.id}
                        className="template-card"
                        onClick={() => applyTemplate(template)}
                      >
                        <div
                          className="template-preview"
                          style={{ background: template.backgroundColor }}
                        >
                          <span>{template.preview}</span>
                        </div>
                        <span className="template-name">{template.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="close-modal" onClick={() => setShowTemplates(false)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SlideEditor;