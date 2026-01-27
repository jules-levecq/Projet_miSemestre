import { Handle, Position } from '@xyflow/react';
import './SlideNode.css';

function SlideNode({ data, id }) {
  // Extraire uniquement le chiffre de l'ID
  const slideNumber = id.split('-')[1];
  
  return (
    <div className="slide-node">
      <Handle type="target" position={Position.Top} />
      <div className="slide-node-content">
        <span className="slide-number">{slideNumber}</span>
        {data.title && <span className="slide-title">{data.title}</span>}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default SlideNode;
