import { useCallback, useState, useEffect } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';

import FlowEditor from './components/FlowEditor/FlowEditor';
import SlideEditor from './components/SlideEditor/SlideEditor';
import Toolbar from './components/Toolbar/Toolbar';
import { initialNodes, initialEdges } from './data/initialSlides';

import '@xyflow/react/dist/style.css';
import './App.css';

// Clés pour localStorage
const STORAGE_KEYS = {
  NODES: 'slides_nodes',
  EDGES: 'slides_edges',
  COUNTER: 'slides_counter',
};

// Charger les données depuis localStorage
const loadFromStorage = () => {
  try {
    const savedNodes = localStorage.getItem(STORAGE_KEYS.NODES);
    const savedEdges = localStorage.getItem(STORAGE_KEYS.EDGES);
    const savedCounter = localStorage.getItem(STORAGE_KEYS.COUNTER);
    
    return {
      nodes: savedNodes ? JSON.parse(savedNodes) : initialNodes,
      edges: savedEdges ? JSON.parse(savedEdges) : initialEdges,
      counter: savedCounter ? parseInt(savedCounter, 10) : 5,
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    return {
      nodes: initialNodes,
      edges: initialEdges,
      counter: 5,
    };
  }
};

function App() {
  // Charger les données sauvegardées au démarrage
  const savedData = loadFromStorage();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(savedData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(savedData.edges);
  const [slideCounter, setSlideCounter] = useState(savedData.counter);
  
  // État pour l'éditeur de slide
  const [editingSlide, setEditingSlide] = useState(null);

  // Sauvegarder automatiquement dans localStorage quand les données changent
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des nodes:', error);
    }
  }, [nodes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des edges:', error);
    }
  }, [edges]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTER, slideCounter.toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du compteur:', error);
    }
  }, [slideCounter]);

  // Ouvrir l'éditeur au double-clic
  const handleSlideDoubleClick = useCallback((node) => {
    // Récupérer le node à jour depuis le state
    const currentNode = nodes.find(n => n.id === node.id);
    setEditingSlide(currentNode || node);
  }, [nodes]);

  // Fermer l'éditeur
  const handleCloseEditor = useCallback(() => {
    setEditingSlide(null);
  }, []);

  // Sauvegarder les modifications d'une slide
  const handleSaveSlide = useCallback((slideId, content) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === slideId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...content,
            },
          };
        }
        return node;
      })
    );
    setEditingSlide(null);
  }, [setNodes]);

  // Ajouter une nouvelle slide
  const addSlide = useCallback(() => {
    const newId = `slide-${slideCounter}`;
    const newNode = {
      id: newId,
      type: 'slide',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { title: '', content: '' },
    };
    setNodes((nds) => [...nds, newNode]);
    setSlideCounter((counter) => counter + 1);
  }, [slideCounter, setNodes]);

  // Supprimer la slide sélectionnée
  const deleteSelectedSlide = useCallback(() => {
    const selectedNode = nodes.find((node) => node.selected);
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
    }
  }, [nodes, setNodes, setEdges]);

  // Vérifier si une slide est sélectionnée
  const hasSelection = nodes.some((node) => node.selected);

  // Si on édite une slide, afficher l'éditeur
  if (editingSlide) {
    return (
      <SlideEditor
        slide={editingSlide}
        onSave={handleSaveSlide}
        onClose={handleCloseEditor}
      />
    );
  }

  // Sinon, afficher la vue arbre
  return (
    <div className="app-container">
      <Toolbar
        onAddSlide={addSlide}
        onDeleteSelected={deleteSelectedSlide}
        hasSelection={hasSelection}
      />
      <FlowEditor
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        setEdges={setEdges}
        onSlideDoubleClick={handleSlideDoubleClick}
      />
    </div>
  );
}

export default App;
