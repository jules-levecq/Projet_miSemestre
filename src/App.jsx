import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react';

import SlideEditor from './components/SlideEditor/SlideEditor';
import SlideViewer from './components/SlideViewer/SlideViewer';
import {
  getCurrentUser,
  createProject,
  updateProject,
  getProject,
  serializeProject,
  deserializeProject,
} from './services/api';

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
   * handleDoubleClick - Opens the slide editor on double-click (without Alt)
   * Alt + click = edit the slide name
   */
  const handleDoubleClick = (event) => {
    // If Alt is pressed, edit the name instead
    if (event.altKey) {
      setIsEditing(true);
    } else {
      // Double-click without Alt = open editor
      // Dispatch custom event to notify App component
      window.dispatchEvent(new CustomEvent('openSlideEditor', { detail: { id, data } }));
    }
  };

  /**
   * handleClick - Handles Alt + click to edit the name
   */
  const handleClick = (event) => {
    if (event.altKey) {
      event.stopPropagation();
      setIsEditing(true);
    }
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
   * Double-click = open editor
   * Alt + click = edit name
   */
  const renderDisplayMode = () => (
    <div className="slide-node" onDoubleClick={handleDoubleClick} onClick={handleClick}>
      <Handle type="target" position={Position.Top} />
      <div className="slide-node-text" ref={textDisplayRef} style={{ fontSize: `${fontSize}px` }}>
        {editText || id}
      </div>
      <Handle type="source" position={Position.Bottom} />
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

  // Check if coming from "New Project" button or loading existing project
  const isNewProject = useRef(false);
  const projectName = useRef(null);
  const loadProjectId = useRef(null);

  // Current project info (for saving)
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [currentProjectTitle, setCurrentProjectTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'saved', 'saving', 'error'

  // On first render, check localStorage for new project or project to load
  useEffect(() => {
    const storedProjectName = localStorage.getItem('currentProjectName');
    const storedProjectId = localStorage.getItem('loadProjectId');
    
    if (storedProjectName) {
      isNewProject.current = true;
      projectName.current = storedProjectName;
      localStorage.removeItem('currentProjectName');
    } else if (storedProjectId) {
      loadProjectId.current = storedProjectId;
      localStorage.removeItem('loadProjectId');
    }
  }, []);

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

  // State for the slide editor
  // - currentSlide: the slide being edited (null = show flow view)
  const [currentSlide, setCurrentSlide] = useState(null);

  // State for viewer/presentation mode
  // - isViewing: true when in presentation mode
  // - viewerStartSlide: the slide to start the presentation from
  const [isViewing, setIsViewing] = useState(false);
  const [viewerStartSlide, setViewerStartSlide] = useState(null);

  // ============================================
  // EFFECT - Load existing project from DB
  // ============================================
  useEffect(() => {
    const loadExistingProject = async () => {
      if (loadProjectId.current) {
        try {
          const project = await getProject(loadProjectId.current);
          const { nodes: loadedNodes, edges: loadedEdges } = deserializeProject(project.content);
          
          setNodes(loadedNodes);
          setEdges(loadedEdges);
          setCurrentProjectId(project.id);
          setCurrentProjectTitle(project.title);
          
          // Update slide counter based on loaded nodes
          const maxId = loadedNodes.reduce((max, node) => {
            const match = node.id.match(/slide-(\d+)/);
            return match ? Math.max(max, parseInt(match[1])) : max;
          }, 0);
          setSlideCounter(maxId + 1);
          
          loadProjectId.current = null;
        } catch (error) {
          console.error('Erreur chargement projet:', error);
        }
      }
    };
    
    loadExistingProject();
  }, [setNodes, setEdges]);

  // ============================================
  // EFFECT - Create first slide for new project & save to DB
  // ============================================
  useEffect(() => {
    const createNewProjectInDB = async () => {
      if (isNewProject.current && projectName.current) {
        const user = getCurrentUser();
        
        // Create the first slide with the project name
        const firstSlideId = 'slide-1';
        const firstSlideData = {
          label: projectName.current,
          elements: [],
          backgroundColor: '#ffffff',
        };

        const newNodes = [
          {
            id: firstSlideId,
            type: 'slideNode',
            position: { x: 250, y: 100 },
            data: firstSlideData,
          },
        ];

        // Add the first slide to the nodes
        setNodes(newNodes);
        setCurrentProjectTitle(projectName.current);

        // Save to DB if user is logged in
        if (user && user.id) {
          try {
            const content = serializeProject(newNodes, []);
            const project = await createProject(user.id, projectName.current, content);
            setCurrentProjectId(project.id);
            setSaveStatus('saved');
          } catch (error) {
            console.error('Erreur création projet:', error);
            setSaveStatus('error');
          }
        }

        // Reset the flag
        isNewProject.current = false;
      }
    };
    
    createNewProjectInDB();
  }, [setNodes]);

  // ============================================
  // EFFECT - Auto-save project when nodes/edges change
  // ============================================
  useEffect(() => {
    const autoSave = async () => {
      if (currentProjectId && nodes.length > 0) {
        setIsSaving(true);
        setSaveStatus('saving');
        
        try {
          const content = serializeProject(nodes, edges);
          await updateProject(currentProjectId, currentProjectTitle, content);
          setSaveStatus('saved');
        } catch (error) {
          console.error('Erreur sauvegarde:', error);
          setSaveStatus('error');
        } finally {
          setIsSaving(false);
        }
      }
    };

    // Debounce: save 1 second after last change
    const timeoutId = setTimeout(autoSave, 1000);
    return () => clearTimeout(timeoutId);
  }, [nodes, edges, currentProjectId, currentProjectTitle]);

  // ============================================
  // EFFECT - Listen for slide editor events
  // ============================================
  useEffect(() => {
    const handleOpenEditor = (event) => {
      const { id, data } = event.detail;
      setCurrentSlide({ id, data });
    };

    window.addEventListener('openSlideEditor', handleOpenEditor);
    return () => window.removeEventListener('openSlideEditor', handleOpenEditor);
  }, []);

  // ============================================
  // FUNCTIONS - Slide management
  // ============================================

  /**
   * handleBackToFlow - Returns to the flow view from the editor
   */
  const handleBackToFlow = () => {
    setCurrentSlide(null);
  };

  /**
   * startPresentation - Start the presentation mode
   * @param {string} startSlideId - Optional ID of the slide to start from
   */
  const startPresentation = useCallback((startSlideId = null) => {
    if (nodes.length === 0) {
      alert('Ajoutez au moins une slide pour lancer la présentation.');
      return;
    }
    
    // If no start slide specified, use the selected slide or the first slide
    const selectedNode = nodes.find(n => n.selected);
    const startId = startSlideId || selectedNode?.id || nodes[0]?.id;
    
    setViewerStartSlide(startId);
    setIsViewing(true);
  }, [nodes]);

  /**
   * closePresentation - Exit the presentation mode
   */
  const closePresentation = () => {
    setIsViewing(false);
    setViewerStartSlide(null);
  };

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
      data: { title: '', fontSize: 12 },                   // Empty title and default font size
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

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Clean up listener when component is destroyed
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [deleteSelectedSlide]);

  // ============================================
  // CONFIGURATION
  // ============================================

  // Map node types to components
  // When React Flow sees type: 'slide' or 'slideNode', it uses our SlideNode component
  const nodeTypes = {
    slide: SlideNode,
    slideNode: SlideNode,
  };

  // ============================================
  // RENDER - Interface display
  // ============================================

  /**
   * handleSaveSlide - Saves the slide content from the editor
   * Updates the node data with the new content
   * @param {string} slideId - ID of the slide being saved
   * @param {Object} slideData - The new data for the slide
   */
  const handleSaveSlide = (slideId, slideData) => {
    console.log('App.jsx handleSaveSlide called:', slideId, slideData);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === slideId) {
          console.log('Updating node:', node.id, 'with:', slideData);
          return {
            ...node,
            data: {
              ...node.data,
              ...slideData,
            },
          };
        }
        return node;
      })
    );
  };

  // If in presentation mode, show the SlideViewer component
  if (isViewing) {
    return (
      <SlideViewer
        nodes={nodes}
        edges={edges}
        startSlideId={viewerStartSlide}
        onClose={closePresentation}
      />
    );
  }

  // If editing a slide, show the SlideEditor component
  if (currentSlide) {
    // Find the current node to get its full data
    const currentNode = nodes.find((n) => n.id === currentSlide.id);
    const slideData = currentNode ? currentNode.data : currentSlide.data;

    return (
      <SlideEditor
        slide={{ id: currentSlide.id, ...slideData }}
        onSave={handleSaveSlide}
        onClose={handleBackToFlow}
      />
    );
  }

  // Otherwise, show the flow view
  return (
    <div className="app-container">
      {/* Header with project info and save status */}
      <div className="project-header">
        <div className="project-info">
          <h2 className="project-title">{currentProjectTitle || 'Nouveau Projet'}</h2>
          <span className={`save-status ${saveStatus}`}>
            {saveStatus === 'saving' && '⏳ Sauvegarde...'}
            {saveStatus === 'saved' && '✅ Sauvegardé'}
            {saveStatus === 'error' && '❌ Erreur de sauvegarde'}
            {!saveStatus && !currentProjectId && '💾 Non connecté'}
          </span>
        </div>
        <button 
          onClick={() => window.location.href = '/pages/home.html'} 
          className="button-common button-back"
        >
          ← Retour
        </button>
      </div>

      {/* Control panel with buttons */}
      <div className="control-panel">
        <button onClick={addSlide} className="button-common button-add">
          Ajouter Slide
        </button>
        <button 
          onClick={() => startPresentation()} 
          className="button-common button-present"
          disabled={nodes.length === 0}
        >
          ▶ Visionner
        </button>
        <small className="control-hint">
          <strong>Double-clic</strong> = ouvrir l'éditeur<br/>
          <strong>Alt + clic</strong> = modifier le nom<br/>
          <strong>Suppr</strong> = supprimer la slide
        </small>
      </div>

      {/* React Flow component - The main diagram */}
      <ReactFlow
        nodes={nodes}              // Slides to display
        edges={edges}              // Connections to display
        onNodesChange={onNodesChange}  // Handle node changes
        onEdgesChange={onEdgesChange}  // Handle connection changes
        onConnect={onConnect}      // Create new connections
        nodeTypes={nodeTypes}      // Custom node types
        fitView                    // Auto-zoom to fit all
      >
        {/* Patterned background */}
        <Background variant="dots" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}

export default App;