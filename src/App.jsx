import { useCallback, useState } from 'react';
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

// Composant personnalisé pour afficher les diapositives avec leur ID
function SlideNode({ data, id }) {
  // Extraire uniquement le chiffre de l'ID
  const slideNumber = id.split('-')[1];
  
  return (
    <div style={{
      padding: '15px',
      border: '2px solid #222',
      borderRadius: '8px',
      background: '#fff',
      textAlign: 'center',
      minWidth: '70px',
      minHeight: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
        {slideNumber}
      </div>
    </div>
  );
}
// Exemple de slides (nœuds) initiaux
const initialNodes = [
  {
    id: 'slide-1',
    type: 'slide',
    position: { x: 250, y: 0 },
    data: { label: '' },
  },
  {
    id: 'slide-2',
    type: 'slide',
    position: { x: 100, y: 150 },
    data: { label: '' },
  },
  {
    id: 'slide-3',
    type: 'slide',
    position: { x: 400, y: 150 },
    data: { label: '' },
  },
  {
    id: 'slide-4',
    type: 'slide',
    position: { x: 250, y: 300 },
    data: { label: '' },
  },
];

// Exemple de connexions (liens) entre les slides
const initialEdges = [
  { id: '1', source: 'slide-1', target: 'slide-2' },
  { id: '2', source: 'slide-1', target: 'slide-3' },
  { id: '3', source: 'slide-2', target: 'slide-4' },  
  { id: '4', source: 'slide-3', target: 'slide-4' },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [slideCounter, setSlideCounter] = useState(5);

  // Fonction pour connecter des slides ensemble
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Fonction pour ajouter une nouvelle slide
  const addSlide = useCallback(() => {
    const newId = `slide-${slideCounter}`;
    const newNode = {
      id: newId,
      type: 'slide',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: '' },
    };
    setNodes((nds) => [...nds, newNode]);
    setSlideCounter((counter) => counter + 1);
  }, [slideCounter, setNodes]);

  // Fonction pour supprimer une slide
  const deleteSlide = useCallback((slideId) => {
    setNodes((nds) => nds.filter((node) => node.id !== slideId));
    setEdges((eds) => eds.filter((edge) => edge.source !== slideId && edge.target !== slideId));
  }, [setNodes, setEdges]);

  // Fonction pour supprimer la slide sélectionnée
  const deleteSelectedSlide = useCallback(() => {
    const selectedNode = nodes.find((node) => node.selected);
    if (selectedNode) {
      deleteSlide(selectedNode.id);
    }
  }, [nodes, deleteSlide]);

  // Définition des types de nœuds personnalisés
  const nodeTypes = {
    slide: SlideNode,
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1 style={{ position: 'absolute', zIndex: 10, margin: '10px' }}>
        🎨 Éditeur de Diapositives Non Linéaires
      </h1>
      
      {/* Menu de contrôle */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '10px',
        zIndex: 10,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '10px',
        flexDirection: 'column',
      }}>
        <button
          onClick={addSlide}
          style={{
            padding: '10px 15px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          ➕ Ajouter Slide
        </button>
        <button
          onClick={deleteSelectedSlide}
          style={{
            padding: '10px 15px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          🗑️ Supprimer Sélection
        </button>
        <small style={{ color: '#666', textAlign: 'center' }}>
          Cliquez sur une slide pour la sélectionner
        </small>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}

export default App;
