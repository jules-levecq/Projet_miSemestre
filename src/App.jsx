import { useCallback } from 'react';
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

// Exemple de slides (nœuds) initiaux
const initialNodes = [
  {
    id: 'slide-1',
    type: 'default',
    position: { x: 250, y: 0 },
    data: { label: '🎬 Slide 1 - Introduction' },
  },
  {
    id: 'slide-2',
    type: 'default',
    position: { x: 100, y: 150 },
    data: { label: '📊 Slide 2 - Option A' },
  },
  {
    id: 'slide-3',
    type: 'default',
    position: { x: 400, y: 150 },
    data: { label: '📈 Slide 3 - Option B' },
  },
  {
    id: 'slide-4',
    type: 'default',
    position: { x: 250, y: 300 },
    data: { label: '🎯 Slide 4 - Conclusion' },
  },
];

// Exemple de connexions (liens) entre les slides
const initialEdges = [
  { id: 'e1-2', source: 'slide-1', target: 'slide-2', animated: true },
  { id: 'e1-3', source: 'slide-1', target: 'slide-3', animated: true },
  { id: 'e2-4', source: 'slide-2', target: 'slide-4' },
  { id: 'e3-4', source: 'slide-3', target: 'slide-4' },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Fonction pour connecter des slides ensemble
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1 style={{ position: 'absolute', zIndex: 10, margin: '10px' }}>
        🎨 Éditeur de Diapositives Non Linéaires
      </h1>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default App;
