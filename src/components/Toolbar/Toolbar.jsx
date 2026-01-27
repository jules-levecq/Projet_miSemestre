import './Toolbar.css';

function Toolbar({ onAddSlide, onDeleteSelected, hasSelection }) {
  // Retour à la page d'accueil
  const handleBackToHome = () => {
    window.location.href = '/index.html';
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button className="toolbar-btn home-btn" onClick={handleBackToHome}>
          🏠 Accueil
        </button>
        <h2 className="toolbar-title">Slid'R</h2>
      </div>
      
      <div className="toolbar-actions">
        <button className="toolbar-btn add-btn" onClick={onAddSlide}>
          ➕ Ajouter Slide
        </button>
        <button 
          className="toolbar-btn delete-btn" 
          onClick={onDeleteSelected}
          disabled={!hasSelection}
        >
          🗑️ Supprimer
        </button>
      </div>
      
      <p className="toolbar-hint">
        Double-cliquez sur une slide pour l'éditer
      </p>
    </div>
  );
}

export default Toolbar;
