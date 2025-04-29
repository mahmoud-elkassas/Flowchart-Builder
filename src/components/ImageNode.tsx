import React, { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useFlowStore } from '../store/flowStore';

interface ImageNodeProps {
  id: string;
  data: {
    imageUrl: string;
    width: number;
    height: number;
    aspectRatio: number;
  };
  selected: boolean;
}

const ResizeHandle = ({ onResize, position }: { onResize: (dx: number, dy: number) => void, position: string }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      onResize(dx, dy);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`absolute w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 ${position}`}
      onMouseDown={handleMouseDown}
    />
  );
};

export const ImageNode: React.FC<ImageNodeProps> = ({ id, data, selected }) => {
  const updateNodeDimensions = useFlowStore((state) => state.updateNodeDimensions);
  const isDarkMode = useFlowStore((state) => state.isDarkMode);

  const handleResize = useCallback((dx: number, dy: number) => {
    const newWidth = Math.max(100, data.width + dx);
    const newHeight = newWidth / data.aspectRatio;
    
    updateNodeDimensions(id, {
      width: newWidth,
      height: newHeight,
    });
  }, [id, data.width, data.aspectRatio, updateNodeDimensions]);

  return (
    <div
      className={`${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} relative group`}
      style={{
        width: data.width,
        height: data.height,
      }}
    >
      <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 drag-handle cursor-move">
        <Handle type="target" position={Position.Top} className="!border-2" />
        <img
          src={data.imageUrl}
          alt="Uploaded content"
          className="w-full h-full object-cover"
          draggable={false}
        />
        <Handle type="source" position={Position.Bottom} className="!border-2" />
      </div>
      <ResizeHandle onResize={handleResize} position="bottom-right right-0 bottom-0" />
    </div>
  );
};