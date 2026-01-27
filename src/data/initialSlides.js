// Slides (nœuds) initiaux
export const initialNodes = [
  {
    id: 'slide-1',
    type: 'slide',
    position: { x: 250, y: 0 },
    data: { title: 'Introduction', content: '' },
  },
  {
    id: 'slide-2',
    type: 'slide',
    position: { x: 100, y: 150 },
    data: { title: 'Option A', content: '' },
  },
  {
    id: 'slide-3',
    type: 'slide',
    position: { x: 400, y: 150 },
    data: { title: 'Option B', content: '' },
  },
  {
    id: 'slide-4',
    type: 'slide',
    position: { x: 250, y: 300 },
    data: { title: 'Conclusion', content: '' },
  },
];

// Connexions (liens) entre les slides
export const initialEdges = [
  { id: 'e1-2', source: 'slide-1', target: 'slide-2' },
  { id: 'e1-3', source: 'slide-1', target: 'slide-3' },
  { id: 'e2-4', source: 'slide-2', target: 'slide-4' },
  { id: 'e3-4', source: 'slide-3', target: 'slide-4' },
];
