import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  NodeTypes,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';

import {
  RectangleNode,
  RoundedRectangleNode,
  CircleNode,
  EllipseNode,
  TriangleNode,
  DiamondNode,
  BubbleNode,
} from './components/CustomNodes';
import { TextNode } from './components/TextNode';
import { StickyNote } from './components/StickyNote';
import { ImageNode } from './components/ImageNode';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Toolbar } from './components/Toolbar';
import { useFlowStore } from './store/flowStore';

const nodeTypes: NodeTypes = {
  rectangle: RectangleNode,
  roundedRectangle: RoundedRectangleNode,
  circle: CircleNode,
  ellipse: EllipseNode,
  triangle: TriangleNode,
  diamond: DiamondNode,
  bubble: BubbleNode,
  text: TextNode,
  sticky: StickyNote,
  image: ImageNode,
};

function App() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    drawing: { isDrawing, brushColor, brushSize, isEraser },
    isDarkMode,
  } = useFlowStore();

  const flowRef = useRef<HTMLDivElement>(null);

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      addNode(type, position);
    },
    [addNode]
  );

  const handleSave = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowchart.json';
    link.click();
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const { nodes, edges } = JSON.parse(content);
          useFlowStore.setState({ nodes, edges });
        } catch (error) {
          console.error('Error loading file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    if (flowRef.current) {
      toPng(flowRef.current, {
        backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
        quality: 1,
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'flowchart.png';
        link.click();
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const width = 300; // Default width
          const height = width / aspectRatio;
          
          // Center the image in the viewport
          const flowElement = document.querySelector('.react-flow__viewport');
          const bounds = flowElement?.getBoundingClientRect();
          if (bounds) {
            const position = {
              x: (bounds.width - width) / 2,
              y: (bounds.height - height) / 2,
            };
            
            addNode('image', position, {
              imageUrl: e.target?.result as string,
              width,
              height,
              aspectRatio,
            });
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!isDrawing && event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        const position = {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        };
        addNode('text', position);
      }
    },
    [addNode, isDrawing]
  );

  return (
    <div className={`w-screen h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <ReactFlowProvider>
        <Toolbar 
          onDragStart={onDragStart}
          onSave={handleSave}
          onLoad={handleLoad}
          onExport={handleExport}
          onImageUpload={handleImageUpload}
        />
        <div className="w-full h-full pl-[240px]" ref={flowRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={handlePaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{
              type: 'default',
              style: { 
                strokeWidth: 2,
                stroke: isDarkMode ? '#e2e8f0' : '#64748b',
              },
              animated: false,
            }}
            fitView
          >
            <DrawingCanvas
              isDrawing={isDrawing}
              brushColor={brushColor}
              brushSize={brushSize}
              isEraser={isEraser}
            />
            <Background 
              color={isDarkMode ? '#4a5568' : '#94a3b8'} 
              gap={24} 
              size={1} 
            />
            <Controls className={`${isDarkMode ? '!bg-gray-800 !text-gray-200' : '!bg-white'} !border-none`} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}

export default App;