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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'saved', 'saving', 'error'

  // On first render, check localStorage for new project or project to load
  useEffect(() => {
    const storedProjectName = localStorage.getItem('currentProjectName');
    const storedProjectId = localStorage.getItem('loadProjectId');
    const persistedProjectId = localStorage.getItem('currentProjectId');
    const persistedProjectTitle = localStorage.getItem('currentProjectTitle');
    
    if (storedProjectName) {
      isNewProject.current = true;
      projectName.current = storedProjectName;
      localStorage.removeItem('currentProjectName');
    } else if (storedProjectId) {
      loadProjectId.current = storedProjectId;
      localStorage.removeItem('loadProjectId');
    } else if (persistedProjectId) {
      // Restore last opened project on page reload
      loadProjectId.current = persistedProjectId;
      if (persistedProjectTitle) setCurrentProjectTitle(persistedProjectTitle);
    }
  }, []);

  // Persist current project id/title so a page refresh can reload it
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('currentProjectId', currentProjectId);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  }, [currentProjectId]);

  useEffect(() => {
    if (currentProjectTitle) {
      localStorage.setItem('currentProjectTitle', currentProjectTitle);
    } else {
      localStorage.removeItem('currentProjectTitle');
    }
  }, [currentProjectTitle]);

  // focus title input when entering edit mode
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Save project title: update state, persist to server if project exists
  const handleSaveProjectTitle = async (newTitle) => {
    const trimmed = (newTitle || '').trim();
    setCurrentProjectTitle(trimmed);
    setIsEditingTitle(false);

    if (currentProjectId) {
      setIsSaving(true);
      setSaveStatus('saving');
      try {
        const content = serializeProject(nodes, edges, firstSlideId);
        await updateProject(currentProjectId, trimmed, content);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Erreur sauvegarde titre:', err);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    } else {
      // no project id yet: keep title in state/localStorage
      setSaveStatus('saved');
    }
  };

  // Clipboard and history for global nodes/edges
  const clipboardNodeRef = useRef(null);
  const nodesHistoryRef = useRef([]);

  const pushNodesHistory = () => {
    try {
      const snap = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
      nodesHistoryRef.current.push(snap);
      if (nodesHistoryRef.current.length > 40) nodesHistoryRef.current.shift();
    } catch (err) {
      // ignore
    }
  };

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

  // State for the first slide (Ctrl+click to set)
  // This slide will be highlighted and used as the starting point
  const [firstSlideId, setFirstSlideId] = useState(null);

  // ============================================
  // EFFECT - Load existing project from DB
  // ============================================
  useEffect(() => {
    const loadExistingProject = async () => {
      if (loadProjectId.current) {
        try {
          const project = await getProject(loadProjectId.current);
          const { nodes: loadedNodes, edges: loadedEdges, firstSlideId: loadedFirstSlideId } = deserializeProject(project.content);
          
          setNodes(loadedNodes);
          setEdges(loadedEdges);
          setFirstSlideId(loadedFirstSlideId);
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
            const content = serializeProject(newNodes, [], null);
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
          const content = serializeProject(nodes, edges, firstSlideId);
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
  }, [nodes, edges, firstSlideId, currentProjectId, currentProjectTitle]);

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
    // Clear current slide state to return to the in-app flow view
    // (do NOT navigate away to dashboard from the editor)
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
    
    // Priority: passed startSlideId > firstSlideId (Ctrl+click) > selected slide > first slide
    const selectedNode = nodes.find(n => n.selected);
    const startId = startSlideId || firstSlideId || selectedNode?.id || nodes[0]?.id;
    
    setViewerStartSlide(startId);
    setIsViewing(true);
  }, [nodes, firstSlideId]);

  /**
   * closePresentation - Exit the presentation mode
   */
  const closePresentation = () => {
    setIsViewing(false);
    setViewerStartSlide(null);
  };

  /**
   * handleNodeClick - Handles click on a node
   * Ctrl+click sets the node as the first slide of the presentation
   * @param {Event} event - The click event
   * @param {Object} node - The clicked node
   */
  const handleNodeClick = useCallback((event, node) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      // Toggle: if already first slide, unset it; otherwise set it
      setFirstSlideId(prevId => prevId === node.id ? null : node.id);
    }
  }, []);

  /**
   * onConnect - Creates a new connection between two slides
   * Called automatically when user draws a line
   * @param {Object} params - Contains source (starting slide ID) and target (destination slide ID)
   */
  const onConnect = useCallback(
    (params) => {
      pushNodesHistory();
      setEdges((eds) => {
        // Prevent exact duplicate
        const exists = eds.some(e => e.source === params.source && e.target === params.target);
        if (exists) return eds;

        // Remove reverse edge if present (enforce unique direction between two nodes)
        const withoutReverse = eds.filter(e => !(e.source === params.target && e.target === params.source));
        // Add the new directed edge (with arrow)
        const newParams = { ...params, arrowHeadType: 'arrow', id: `e${params.source}-${params.target}` };
        return addEdge(newParams, withoutReverse);
      });
    },
    [setEdges],
  );
 
   // Edge menu state for context actions (unique/double/delete)
  const [edgeMenu, setEdgeMenu] = useState({ open: false, x: 0, y: 0, edgeId: null, message: '' });
 
  const handleEdgeClick = useCallback((event, edge) => {
    event.preventDefault();
    setEdgeMenu({ open: true, x: event.clientX, y: event.clientY, edgeId: edge.id, message: '' });
  }, []);
 
   const closeEdgeMenu = () => setEdgeMenu({ open: false, x: 0, y: 0, edgeId: null });
 
  const setEdgeUnique = (edgeId) => {
    setEdges((eds) => {
      const targetEdge = eds.find(e => e.id === edgeId);
      if (!targetEdge) return eds;
      // remove reverse if exists
      const withoutReverse = eds.filter(e => !(e.source === targetEdge.target && e.target === targetEdge.source));
      // ensure the target edge has arrowHeadType
      return withoutReverse.map(e => e.id === edgeId ? { ...e, arrowHeadType: 'arrow', markerStart: undefined } : e);
    });
    // feedback in menu then close
    setEdgeMenu(prev => ({ ...prev, message: 'Sens unique appliqué' }));
    setTimeout(() => closeEdgeMenu(), 900);
  };
 
  const setEdgeDouble = (edgeId) => {
    setEdges((eds) => {
      const targetEdge = eds.find(e => e.id === edgeId);
      if (!targetEdge) return eds;
      // remove any standalone reverse edge: we'll represent double-sense with a single edge
      const withoutReverse = eds.filter(e => !(e.source === targetEdge.target && e.target === targetEdge.source));
      // set both end markers on the target edge
      const next = withoutReverse.map(e => e.id === edgeId ? { ...e, arrowHeadType: 'arrow', markerStart: 'arrow' } : e);
      return next;
    });
    // feedback in menu then close
    setEdgeMenu(prev => ({ ...prev, message: 'Double sens appliqué' }));
    setTimeout(() => closeEdgeMenu(), 1200);
  };
 
  const deleteEdgeById = (edgeId) => {
    setEdges((eds) => eds.filter(e => e.id !== edgeId));
    setEdgeMenu(prev => ({ ...prev, message: 'Arête supprimée' }));
    setTimeout(() => closeEdgeMenu(), 900);
  };

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

    // record history then add the new slide to the existing list
    pushNodesHistory();
    setNodes((nds) => [...nds, newNode]);

    // Increment counter for the next slide
    setSlideCounter((counter) => counter + 1);
  }, [slideCounter, setNodes]);

  /**
   * deleteSlide - Removes a specific slide and its connections
   * @param {string} slideId - The ID of the slide to remove
   */
  const deleteSlide = useCallback((slideId) => {
    // record history then remove the slide from nodes
    pushNodesHistory();
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

      // Global copy/paste/undo when not editing a slide
      if ((event.ctrlKey || event.metaKey) && !isEditingText) {
        const k = event.key.toLowerCase();
        // Copy selected node
        if (k === 'c') {
          const sel = nodes.find(n => n.selected);
          if (sel) {
            clipboardNodeRef.current = JSON.parse(JSON.stringify(sel));
          }
        }
        // Paste node (duplicate)
        if (k === 'v') {
          event.preventDefault();
          if (clipboardNodeRef.current) {
            pushNodesHistory();
            const copied = JSON.parse(JSON.stringify(clipboardNodeRef.current));
            const newId = slideCounter.toString();
            copied.id = newId;
            // offset position
            copied.position = { x: (copied.position?.x || 250) + 30, y: (copied.position?.y || 100) + 30 };
            setNodes((nds) => [...nds, copied]);
            setSlideCounter((c) => c + 1);
          }
        }
        // Undo
        if (k === 'z') {
          event.preventDefault();
          const prev = nodesHistoryRef.current.pop();
          if (prev) {
            setNodes(prev.nodes);
            setEdges(prev.edges);
          }
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Clean up listener when component is destroyed
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [deleteSelectedSlide, nodes, edges, slideCounter]);

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
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              className="project-title-input"
              value={currentProjectTitle}
              onChange={(e) => setCurrentProjectTitle(e.target.value)}
              onBlur={(e) => handleSaveProjectTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveProjectTitle(e.target.value);
                }
                if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                }
              }}
              aria-label="Nom du projet"
            />
          ) : (
            <h2 className="project-title" onClick={() => setIsEditingTitle(true)} title="Cliquer pour renommer">{currentProjectTitle || 'Nouveau Projet'}</h2>
          )}
          <span className={`save-status ${saveStatus}`}>
            {saveStatus === 'saving' && '⏳ Sauvegarde...'}
            {saveStatus === 'saved' && '✅ Sauvegardé'}
            {saveStatus === 'error' && '❌ Erreur de sauvegarde'}
            {!saveStatus && !currentProjectId && '💾 Non connecté'}
          </span>
        </div>
        <button 
          onClick={() => window.location.href = '/pages/dashboard.html'} 
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
          <strong>Ctrl + clic</strong> = définir 1ère slide<br/>
          <strong>Suppr</strong> = supprimer la slide
        </small>
      </div>

      {/* React Flow component - The main diagram */}
      <ReactFlow
        nodes={nodes.map(node => ({
          ...node,
          className: node.id === firstSlideId ? 'first-slide' : ''
        }))}
        edges={edges}              // Connections to display
        onNodesChange={onNodesChange}  // Handle node changes
        onEdgesChange={onEdgesChange}  // Handle connection changes
        onConnect={onConnect}      // Create new connections
        onEdgeClick={handleEdgeClick}
        onNodeClick={handleNodeClick}  // Handle Ctrl+click for first slide
        nodeTypes={nodeTypes}      // Custom node types
        fitView                    // Auto-zoom to fit all
      >
        {/* Patterned background */}
        <Background variant="dots" gap={16} size={1} />
      </ReactFlow>
      {/* Edge context menu */}
      {edgeMenu.open && (
        <div
          className="edge-menu"
          style={{ position: 'absolute', left: edgeMenu.x + 6, top: edgeMenu.y + 6, zIndex: 2000 }}
        >
          <button
            className="edge-menu-btn icon"
            onClick={() => setEdgeUnique(edgeMenu.edgeId)}
            aria-label="Sens unique"
            title="Sens unique"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12h12" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 8l4 4-4 4" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="edge-menu-label">Sens unique</div>
          </button>

          <button
            className="edge-menu-btn icon"
            onClick={() => setEdgeDouble(edgeMenu.edgeId)}
            aria-label="Double sens"
            title="Double sens"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12h16" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 8L4 12l4 4" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 8l-4 4 4 4" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="edge-menu-label">Double sens</div>
          </button>

          <button
            className="edge-menu-btn icon danger"
            onClick={() => deleteEdgeById(edgeMenu.edgeId)}
            aria-label="Supprimer arête"
            title="Supprimer"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 11v6M14 11v6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 6V4h6v2" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="edge-menu-label">Supprimer</div>
          </button>

          <button className="edge-menu-btn close" onClick={closeEdgeMenu} title="Fermer">✕</button>

          {edgeMenu.message && (
            <div className="edge-menu-message" style={{ marginTop: 6, fontSize: 12 }}>{edgeMenu.message}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;