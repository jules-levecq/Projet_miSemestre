import './Toolbar.css';

function Toolbar({ onAddSlide, onDeleteSelected, hasSelection }) {
  return (
    <div className="toolbar">
      <h2 className="toolbar-title">🎨 Diapositives Non Linéaires</h2>
      
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
