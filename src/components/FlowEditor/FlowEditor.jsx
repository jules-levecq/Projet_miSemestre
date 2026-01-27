import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
} from '@xyflow/react';
import SlideNode from '../SlideNode/SlideNode';
import '@xyflow/react/dist/style.css';
import './FlowEditor.css';

// Définition des types de nœuds personnalisés
const nodeTypes = {
  slide: SlideNode,
};

function FlowEditor({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  setEdges,
  onSlideDoubleClick 
}) {
  // Fonction pour connecter des slides ensemble
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Gestion du double-clic sur un nœud
  const onNodeDoubleClick = useCallback((event, node) => {
    onSlideDoubleClick(node);
  }, [onSlideDoubleClick]);

  return (
    <div className="flow-editor">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
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

export default FlowEditor;
