import { useState, useEffect, useCallback, useRef } from 'react';
import './SlideViewer.css';

// Dimensions de référence de l'éditeur (pour le calcul du scale)
const EDITOR_WIDTH = 800;
const EDITOR_HEIGHT = 500;

/**
 * SlideViewer - Mode présentation avec navigation non-linéaire
 * Permet de naviguer entre les slides connectées
 */
function SlideViewer({ nodes, edges, startSlideId, onClose }) {
  const [currentSlideId, setCurrentSlideId] = useState(startSlideId || nodes[0]?.id);
  const [history, setHistory] = useState([]);
  const [showNavigation, setShowNavigation] = useState(true);
  const [warning, setWarning] = useState('');
  const [scale, setScale] = useState(1);
  const slideContainerRef = useRef(null);

  // Récupérer la slide courante
  const currentSlide = nodes.find(n => n.id === currentSlideId);

  // Trouver les slides suivantes (connectées depuis la slide courante)
  const getNextSlides = useCallback(() => {
    const outgoingEdges = edges.filter(e => e.source === currentSlideId);
    return outgoingEdges.map(edge => {
      const targetNode = nodes.find(n => n.id === edge.target);
      return targetNode;
    }).filter(Boolean);
  }, [currentSlideId, edges, nodes]);

  // Trouver les slides précédentes (qui mènent à la slide courante)
  const getPreviousSlides = useCallback(() => {
    const incomingEdges = edges.filter(e => e.target === currentSlideId);
    return incomingEdges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      return sourceNode;
    }).filter(Boolean);
  }, [currentSlideId, edges, nodes]);

  const nextSlides = getNextSlides();
  const previousSlides = getPreviousSlides();

  // Vérifier si le retour est possible (historique + arête bidirectionnelle)
  const canGoBack = useCallback(() => {
    if (history.length === 0) return false;
    const previousId = history[history.length - 1];
    const forwardEdge = edges.find(e => e.source === previousId && e.target === currentSlideId);
    const reverseEdge = edges.find(e => e.source === currentSlideId && e.target === previousId);
    return !!forwardEdge && (forwardEdge.markerStart === 'arrow' || !!reverseEdge);
  }, [history, edges, currentSlideId]);

  // Activer le mode plein écran lors du montage
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
      } catch (err) {
        console.log('Impossible d\'activer le plein écran:', err);
      }
    };

    enterFullscreen();

    // Quitter le plein écran lors du démontage
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Calculer le scale pour adapter la slide à l'écran
  useEffect(() => {
    const calculateScale = () => {
      if (slideContainerRef.current) {
        const container = slideContainerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculer le scale pour que la slide entre dans le conteneur
        const scaleX = containerWidth / EDITOR_WIDTH;
        const scaleY = containerHeight / EDITOR_HEIGHT;
        const newScale = Math.min(scaleX, scaleY, 1.5); // Max scale 1.5
        
        setScale(newScale);
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Naviguer vers une slide
  const navigateTo = (slideId) => {
    setHistory(prev => [...prev, currentSlideId]);
    setCurrentSlideId(slideId);
  };

  // Revenir en arrière
  const goBack = () => {
    if (history.length > 0) {
      const previousId = history[history.length - 1];

      // Find the forward edge that brought us from previousId -> currentSlideId
      const forwardEdge = edges.find(e => e.source === previousId && e.target === currentSlideId);
      const reverseEdge = edges.find(e => e.source === currentSlideId && e.target === previousId);

      // Allow back-navigation only if the forward edge explicitly allows reverse
      // (represented by markerStart === 'arrow') or if a reverse edge exists
      const allowBack = !!forwardEdge && (forwardEdge.markerStart === 'arrow' || !!reverseEdge);

      if (!allowBack) {
        setWarning('Retour bloqué : arête en sens unique');
        setTimeout(() => setWarning(''), 1200);
        return;
      }

      setHistory(prev => prev.slice(0, -1));
      setCurrentSlideId(previousId);
    }
  };

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
        case 'Backspace':
          goBack();
          break;
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          // Si une seule slide suivante, y aller directement
          if (nextSlides.length === 1) {
            navigateTo(nextSlides[0].id);
          }
          break;
        case 'h':
          setShowNavigation(prev => !prev);
          break;
        default:
          // Touches 1-9 pour sélection rapide
          const num = parseInt(e.key);
          if (num >= 1 && num <= nextSlides.length) {
            navigateTo(nextSlides[num - 1].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlides, history, onClose, edges]);

  if (!currentSlide) {
    return (
      <div className="viewer-container">
        <div className="viewer-error">
          <p>Aucune slide à afficher</p>
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    );
  }

  const slideData = currentSlide.data;
  const bgStyle = slideData.backgroundColor?.includes('gradient')
    ? { background: slideData.backgroundColor }
    : { backgroundColor: slideData.backgroundColor || '#ffffff' };

  return (
    <div className="viewer-container">
      {/* Barre de contrôle */}
      <div className={`viewer-controls ${showNavigation ? '' : 'hidden'}`}>
        <button className="control-btn close-btn" onClick={onClose} title="Fermer (Échap)">
          ✕
        </button>
        <div className="slide-info">
          <span className="slide-label">{slideData.label || currentSlide.id}</span>
          <span className="slide-progress">
            Historique: {history.length} | Suivantes: {nextSlides.length}
          </span>
        </div>
        {warning && (
          <div className="viewer-warning" style={{ color: '#ffcc00', marginLeft: 12 }}>{warning}</div>
        )}
        {canGoBack() && (
          <button 
            className="control-btn back-btn" 
            onClick={goBack}
            title="Retour (← ou Backspace)"
          >
            ←
          </button>
        )}
      </div>

      {/* Zone de la slide */}
      <div className="viewer-slide-container" ref={slideContainerRef}>
        <div 
          className="viewer-slide" 
          style={{
            ...bgStyle,
            width: EDITOR_WIDTH,
            height: EDITOR_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Rendu des éléments de la slide */}
          {slideData.elements?.map(element => (
            <div
              key={element.id}
              className={`viewer-element viewer-${element.type}`}
              style={{
                position: 'absolute',
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fontSize: element.fontSize,
                fontWeight: element.fontWeight,
                fontFamily: element.fontFamily,
                color: element.color,
                backgroundColor: element.type !== 'text' ? element.backgroundColor : 'transparent',
                borderRadius: element.borderRadius,
                textAlign: element.align,
                display: 'flex',
                alignItems: element.type === 'text' ? 'flex-start' : 'center',
                justifyContent: element.align === 'center' ? 'center' : 
                               element.align === 'right' ? 'flex-end' : 'flex-start',
                lineHeight: 1.4,
              }}
            >
              {element.type === 'text' && element.content}
              {element.type === 'image' && (
                <img 
                  src={element.src} 
                  alt="" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: element.borderRadius }} 
                />
              )}
            </div>
          ))}

          {/* Message si slide vide */}
          {(!slideData.elements || slideData.elements.length === 0) && (
            <div className="empty-slide-message">
              <h2>{slideData.label || slideData.title || 'Slide sans contenu'}</h2>
              <p>Cette slide est vide. Double-cliquez dessus dans l'éditeur pour ajouter du contenu.</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation vers les slides suivantes */}
      {showNavigation && nextSlides.length > 0 && (
        <div className="viewer-next-slides">
          {nextSlides.length === 1 ? (
            <button
              className="next-slide-single"
              onClick={() => navigateTo(nextSlides[0].id)}
            >
              <span className="next-slide-name">{nextSlides[0].data.label || 'Suivant'}</span>
              <span className="next-arrow">→</span>
            </button>
          ) : (
            <div className="next-slides-grid">
              {nextSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  className="next-slide-btn"
                  onClick={() => navigateTo(slide.id)}
                  title={`Touche ${index + 1}`}
                >
                  <span className="shortcut-key">{index + 1}</span>
                  <span className="next-slide-name">{slide.data.label || slide.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message si aucune slide suivante */}
      {showNavigation && nextSlides.length === 0 && (
        <div className="viewer-end">
          <p>🎉 Fin de la présentation</p>
          {canGoBack() && (
            <button onClick={goBack} className="back-to-previous">
              ← Retour
            </button>
          )}
          <button onClick={onClose} className="exit-viewer">
            Quitter
          </button>
        </div>
      )}

      {/* Aide */}
      <div className={`viewer-help ${showNavigation ? '' : 'hidden'}`}>
        <p>Raccourcis : <kbd>Échap</kbd> Quitter | <kbd>←</kbd> Retour | <kbd>→</kbd> Suivant | <kbd>1-9</kbd> Choix | <kbd>H</kbd> Masquer</p>
      </div>
    </div>
  );
}

export default SlideViewer;
