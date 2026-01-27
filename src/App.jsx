import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import './App.css';

// ============================================
// COMPONENT: SlideNode
// Displays a slide (box) with an editable title
// ============================================

/**
 * adjustFontSizeDuringEditing - Reduces font size if text overflows
 * Called during editing (on each keystroke)
 * @param {HTMLElement} element - The textarea element to check
 * @param {Function} setFontSize - Function to update the font size
 */
function adjustFontSizeDuringEditing(element, setFontSize) {
  if (!element) return;

  let currentSize = 12;

  // Progressively reduce if content exceeds 80px height
  while (element.scrollHeight > 80 && currentSize > 8) {
    currentSize -= 1;
    setFontSize(currentSize);
  }

  // Reset to 12 if content fits
  if (element.scrollHeight <= 80 && currentSize < 12) {
    setFontSize(12);
  }
}

/**
 * adjustFontSizeDisplay - Adjusts font size for normal display
 * Called after validating the edit
 * Saves the size in the data object
 * @param {HTMLElement} element - The div element to check
 * @param {Function} setFontSize - Function to update the font size
 * @param {Object} data - Slide data object
 */
function adjustFontSizeDisplay(element, setFontSize, data) {
  if (!element) return;

  let currentSize = 12;

  // Progressively reduce if content overflows
  while (element.scrollHeight > 80 && currentSize > 8) {
    currentSize -= 1;
    setFontSize(currentSize);
  }

  // Save the calculated size in the data object
  data.fontSize = currentSize;
}

/**
 * SlideNode - Custom component for slides
 * @param {Object} data - Slide data (contains the title)
 * @param {string} id - Unique identifier for the slide
 * @returns {JSX.Element} A box displaying the title or ID in edit mode
 */
function SlideNode({ data, id }) {
  // State to track if in editing mode
  const [isEditing, setIsEditing] = useState(false);
  // State to store the text being edited
  const [editText, setEditText] = useState(data.title || id);
  // State for dynamic font size
  const [fontSize, setFontSize] = useState(data.fontSize || 12);
  // Reference to access the textarea
  const textareaRef = useRef(null);
  // Reference to access the displayed text
  const textDisplayRef = useRef(null);

  /**
   * useEffect - Adjusts font size during editing
   * Triggers each time the text changes
   */
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      adjustFontSizeDuringEditing(textareaRef.current, setFontSize);
    }
  }, [editText, isEditing]);

  /**
   * useEffect - Adjusts font size after validation
   * Triggers when exiting edit mode
   */
  useEffect(() => {
    if (!isEditing && textDisplayRef.current) {
      adjustFontSizeDisplay(textDisplayRef.current, setFontSize, data);
    }
  }, [isEditing]);

  /**
   * handleDoubleClick - Activates edit mode on double-click
   */
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  /**
   * handleSaveEdit - Saves the new title
   */
  const handleSaveEdit = () => {
    data.title = editText;
    setIsEditing(false);
  };

  /**
   * handleKeyDown - Handles keyboard shortcuts while editing
   * Enter (alone) = validates and exits edit mode
   * Shift+Enter = inserts a new line
   * Escape = cancels editing
   */
  const handleKeyDown = (event) => {
    // Enter WITHOUT Shift = validate and exit
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSaveEdit();
      return;
    }

    // Escape = cancel and restore old text
    if (event.key === 'Escape') {
      setEditText(data.title || id);
      setIsEditing(false);
    }
  };

  /**
   * renderEditingMode - Displays the textarea in edit mode
   */
  const renderEditingMode = () => (
    <div className="slide-node">
      <textarea
        ref={textareaRef}
        autoFocus={true}
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onBlur={handleSaveEdit}
        onKeyDown={handleKeyDown}
        className="slide-node-input"
        style={{ fontSize: `${fontSize}px` }}
      />
    </div>
  );

  /**
   * renderDisplayMode - Displays the text in read mode
   */
  const renderDisplayMode = () => (
    <div className="slide-node" onDoubleClick={handleDoubleClick}>
      <div className="slide-node-text" ref={textDisplayRef} style={{ fontSize: `${fontSize}px` }}>
        {editText || id}
      </div>
    </div>
  );

  // Display the corresponding mode
  return isEditing ? renderEditingMode() : renderDisplayMode();
}

// ============================================
// INITIAL DATA
// ============================================

// Array of initial slides (empty at startup)
const initialNodes = [];

// Array of initial connections (empty at startup)
const initialEdges = [];

// ============================================
// MAIN COMPONENT: App
// ============================================
function App() {
  // ============================================
  // STATES - Reactive data management
  // ============================================

  // State of nodes (slides)
  // - nodes: array of current slides
  // - setNodes: function to modify slides
  // - onNodesChange: called automatically when user moves/modifies a node
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // State of connections (links between slides)
  // - edges: array of current connections
  // - setEdges: function to modify connections
  // - onEdgesChange: called automatically when user modifies a connection
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Counter to generate unique IDs
  // Starts at 1, increments with each new slide
  const [slideCounter, setSlideCounter] = useState(1);

  // ============================================
  // FUNCTIONS - Slide management
  // ============================================

  /**
   * onConnect - Creates a new connection between two slides
   * Called automatically when user draws a line
   * @param {Object} params - Contains source (starting slide ID) and target (destination slide ID)
   */
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  /**
   * addSlide - Adds a new slide to the list
   * Position shifts slightly with each addition
   * ID automatically increments (1, 2, 3, etc...)
   */
  const addSlide = useCallback(() => {
    // Convert counter to string for the ID
    const newId = slideCounter.toString();

    // Create the new slide with all its parameters
    const newNode = {
      id: newId,                                           // Unique ID
      type: 'slide',                                       // Type = our SlideNode component
      position: { x: 250 + (slideCounter * 5), y: slideCounter * 5 },  // Position with offset
      data: { label: '' },                                 // Empty data
    };

    // Add the new slide to the existing list
    setNodes((nds) => [...nds, newNode]);

    // Increment counter for the next slide
    setSlideCounter((counter) => counter + 1);
  }, [slideCounter, setNodes]);

  /**
   * deleteSlide - Removes a specific slide and its connections
   * @param {string} slideId - The ID of the slide to remove
   */
  const deleteSlide = useCallback((slideId) => {
    // Remove the slide from nodes
    setNodes((nds) => nds.filter((node) => node.id !== slideId));

    // Remove all associated connections
    // (connections that start OR end at this slide)
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== slideId && edge.target !== slideId)
    );
  }, [setNodes, setEdges]);

  /**
   * deleteSelectedSlide - Removes the currently selected slide
   * First finds the slide with node.selected === true
   */
  const deleteSelectedSlide = useCallback(() => {
    // Find the selected slide
    const selectedNode = nodes.find((node) => node.selected);

    // If a slide is selected, remove it
    if (selectedNode) {
      deleteSlide(selectedNode.id);
    }
  }, [nodes, deleteSlide]);

  // ============================================
  // KEYBOARD HANDLING
  // ============================================

  /**
   * useEffect - Listens to Delete key
   * When user presses Delete, removes the selected slide
   * BUT only removes if not currently editing a slide
   */
  useEffect(() => {
    // Function called on key press
    const handleKeyPress = (event) => {
      // Check if user is typing in a textarea or input
      const isEditingText = event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT';

      // Remove slide only if not in edit mode
      if (event.key === 'Delete' && !isEditingText) {
        deleteSelectedSlide();
      }
    };

    // Ajouter l'écouteur d'événement
    window.addEventListener('keydown', handleKeyPress);

    // Nettoyer l'écouteur quand le composant est détruit
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [deleteSelectedSlide]);

  // ============================================
  // CONFIGURATION
  // ============================================

  // Associer les types de nœuds aux composants
  // Quand React Flow voit type: 'slide', il utilise notre composant SlideNode
  const nodeTypes = {
    slide: SlideNode,
  };

  // ============================================
  // RENDU - Affichage de l'interface
  // ============================================
  return (
    <div className="app-container">
      {/* Panneau de contrôle avec boutons */}
      <div className="control-panel">
        <button onClick={addSlide} className="button-common button-add">
          Ajouter Slide
        </button>
        <small className="control-hint">
          Cliquez sur une slide pour la sélectionner <br></br>
          Appuyez sur "Suppr" pour supprimer la slide sélectionnée
        </small>
      </div>

      {/* Composant React Flow - Le diagramme principal */}
      <ReactFlow
        nodes={nodes}              // Les slides à afficher
        edges={edges}              // Les connexions à afficher
        onNodesChange={onNodesChange}  // Gestion des changements de nœuds
        onEdgesChange={onEdgesChange}  // Gestion des changements de connexions
        onConnect={onConnect}      // Création de nouvelles connexions
        nodeTypes={nodeTypes}      // Types de nœuds personnalisés
        fitView                    // Zoomer automatiquement pour tout voir
      >
        {/* Fond avec motif */}
        <Background variant="dots" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}

export default App;