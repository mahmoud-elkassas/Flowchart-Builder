import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { useFlowStore } from '../store/flowStore';

interface NodeData {
  label: string;
  color: string;
  width?: number;
  height?: number;
  textStyle?: {
    fontSize?: number;
    color?: string;
  };
}

interface NodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
}

const baseStyles = "transition-all duration-200 shadow-sm hover:shadow-md relative group";
const selectedStyles = "ring-2 ring-blue-500 ring-offset-2";

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

const EditableText = ({ id, initialText, textStyle, onSave }: { id: string, initialText: string, textStyle?: { fontSize?: number; color?: string }, onSave: (text: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onSave(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onSave(text);
    }
  };

  const textStyles = {
    fontSize: `${textStyle?.fontSize || 14}px`,
    color: textStyle?.color || '#374151',
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
        style={{ ...textStyles, maxWidth: '100%' }}
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="text-center font-medium cursor-text select-none"
      style={{ ...textStyles, wordBreak: 'break-word' }}
    >
      {text}
    </div>
  );
};

export const RectangleNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const updateNodeDimensions = useFlowStore((state) => state.updateNodeDimensions);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);

  const handleResize = useCallback((dx: number, dy: number) => {
    updateNodeDimensions(id, {
      width: Math.max(100, (data.width || 150) + dx),
      height: Math.max(60, (data.height || 100) + dy),
    });
  }, [id, data.width, data.height, updateNodeDimensions]);

  return (
    <div
      className={`${baseStyles} ${selected ? selectedStyles : ''}`}
      style={{
        backgroundColor: data.color,
        width: data.width || 150,
        height: data.height || 100,
      }}
    >
      <div className="w-full h-full p-4 rounded-lg border border-gray-200 drag-handle cursor-move flex items-center justify-center">
        <Handle type="target" position={Position.Top} className="!border-2" />
        <EditableText
          id={id}
          initialText={data.label}
          textStyle={data.textStyle}
          onSave={(text) => updateNodeLabel(id, text)}
        />
        <Handle type="source" position={Position.Bottom} className="!border-2" />
      </div>
      <ResizeHandle onResize={handleResize} position="bottom-right right-0 bottom-0" />
    </div>
  );
};

export const RoundedRectangleNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const updateNodeDimensions = useFlowStore((state) => state.updateNodeDimensions);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);

  const handleResize = useCallback((dx: number, dy: number) => {
    updateNodeDimensions(id, {
      width: Math.max(100, (data.width || 150) + dx),
      height: Math.max(60, (data.height || 100) + dy),
    });
  }, [id, data.width, data.height, updateNodeDimensions]);

  return (
    <div
      className={`${baseStyles} ${selected ? selectedStyles : ''}`}
      style={{
        backgroundColor: data.color,
        width: data.width || 150,
        height: data.height || 100,
      }}
    >
      <div className="w-full h-full p-4 rounded-2xl border border-gray-200 drag-handle cursor-move flex items-center justify-center">
        <Handle type="target" position={Position.Top} className="!border-2" />
        <EditableText
          id={id}
          initialText={data.label}
          textStyle={data.textStyle}
          onSave={(text) => updateNodeLabel(id, text)}
        />
        <Handle type="source" position={Position.Bottom} className="!border-2" />
      </div>
      <ResizeHandle onResize={handleResize} position="bottom-right right-0 bottom-0" />
    </div>
  );
};

export const CircleNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const updateNodeDimensions = useFlowStore((state) => state.updateNodeDimensions);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);

  const handleResize = useCallback((dx: number, dy: number) => {
    const newSize = Math.max(100, (data.width || 150) + Math.max(dx, dy));
    updateNodeDimensions(id, {
      width: newSize,
      height: newSize,
    });
  }, [id, data.width, updateNodeDimensions]);

  return (
    <div
      className={`${baseStyles} ${selected ? selectedStyles : ''}`}
      style={{
        backgroundColor: data.color,
        width: data.width || 150,
        height: data.height || 150,
      }}
    >
      <div className="w-full h-full rounded-full flex items-center justify-center border border-gray-200 drag-handle cursor-move">
        <Handle type="target" position={Position.Top} className="!border-2" />
        <EditableText
          id={id}
          initialText={data.label}
          textStyle={data.textStyle}
          onSave={(text) => updateNodeLabel(id, text)}
        />
        <Handle type="source" position={Position.Bottom} className="!border-2" />
      </div>
      <ResizeHandle onResize={handleResize} position="bottom-right right-0 bottom-0" />
    </div>
  );
};

export const EllipseNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const updateNodeDimensions = useFlowStore((state) => state.updateNodeDimensions);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);

  const handleResize = useCallback((dx: number, dy: number) => {
    updateNodeDimensions(id, {
      width: Math.max(100, (data.width || 150) + dx),
      height: Math.max(60, (data.height || 100) + dy),
    });
  }, [id, data.width, data.height, updateNodeDimensions]);

  return (
    <div
      className={`${baseStyles} ${selected ? selectedStyles : ''}`}
      style={{
        backgroundColor: data.color,
        width: data.width || 150,
        height: data.height || 100,
      }}
    >
      <div className="w-full h-full rounded-[50%] flex items-center justify-center border border-gray-200 drag-handle cursor-move">
        <Handle type="target" position={Position.Top} className="!border-2" />
        <EditableText
          id={id}
          initialText={data.label}
          textStyle={data.textStyle}
          onSave={(text) => updateNodeLabel(id, text)}
        />
        <Handle type="source" position={Position.Bottom} className="!border-2" />
      </div>
      <ResizeHandle onResize={handleResize} position="bottom-right right-0 bottom-0" />
    </div>
  );
};

export const TriangleNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const updateNodeDimensions = useFlowStore((state) => state.updateNodeDimensions);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);

  const handleResize = useCallback((dx: number, dy: number) => {
    updateNodeDimensions(id, {
      width: Math.max(100, (data.width || 150) + dx),
      height: Math.max(60, (data.height || 100) + dy),
    });
  }, [id, data.width, data.height, updateNodeDimensions]);

  return (
    <div
      className={`${baseStyles} ${selected ? selectedStyles : ''}`}
      style={{
        backgroundColor: 'transparent',
        width: data.width || 150,
        height: data.height || 100,
      }}
    >
      <div 
        className="w-full h-full relative drag-handle cursor-move flex items-center justify-center"
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          backgroundColor: data.color,
        }}
      >
        <Handle type="target" position={Position.Top} className="!border-2" />
        <EditableText
          id={id}
          initialText={data.label}
          textStyle={data.textStyle}
          onSave={(text) => updateNodeLabel(id, text)}
        />
        <Handle type="source" position={Position.Bottom} className="!border-2" />
      </div>
      <ResizeHandle onResize={handleResize} position="bottom-right right-0 bottom-0" />
    </div>
  );
};

export const DiamondNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const updateNodeDimensions = useFlowStore((state) => state.updateNodeDimensions);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);

  const handleResize = useCallback((dx: number, dy: number) => {
    updateNodeDimensions(id, {
      width: Math.max(100, (data.width || 150) + dx),
      height: Math.max(100, (data.height || 150) + dy),
    });
  }, [id, data.width, data.height, updateNodeDimensions]);

  return (
    <div
      className={`${baseStyles} ${selected ? selectedStyles : ''}`}
      style={{
        backgroundColor: data.color,
        width: data.width || 150,
        height: data.height || 150,
      }}
    >
      <div
        className="w-full h-full border border-gray-200 drag-handle cursor-move"
        style={{ transform: 'rotate(45deg)' }}
      >
        <Handle type="target" position={Position.Top} className="!border-2" />
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: 'rotate(-45deg)' }}
        >
          <EditableText
            id={id}
            initialText={data.label}
            textStyle={data.textStyle}
            onSave={(text) => updateNodeLabel(id, text)}
          />
        </div>
        <Handle type="source" position={Position.Bottom} className="!border-2" />
      </div>
      <ResizeHandle onResize={handleResize} position="bottom-right right-0 bottom-0" />
    </div>
  );
};

export const BubbleNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const updateNodeDimensions = useFlowStore((state) => state.updateNodeDimensions);
  const updateNodeLabel = useFlowStore((state) => state.updateNodeLabel);

  const handleResize = useCallback((dx: number, dy: number) => {
    updateNodeDimensions(id, {
      width: Math.max(100, (data.width || 150) + dx),
      height: Math.max(60, (data.height || 100) + dy),
    });
  }, [id, data.width, data.height, updateNodeDimensions]);

  return (
    <div
      className={`${baseStyles} ${selected ? selectedStyles : ''}`}
      style={{
        backgroundColor: data.color,
        width: data.width || 150,
        height: data.height || 100,
        position: 'relative',
      }}
    >
      <div className="w-full h-full border border-gray-200 drag-handle cursor-move flex items-center justify-center">
        <Handle type="target" position={Position.Top} className="!border-2" />
        <EditableText
          id={id}
          initialText={data.label}
          textStyle={data.textStyle}
          onSave={(text) => updateNodeLabel(id, text)}
        />
        <Handle type="source" position={Position.Bottom} className="!border-2" />
        <svg
          className="absolute -bottom-6 left-1/2 -translate-x-1/2"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={data.color}
          style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))' }}
        >
          <path
            d="M12 0L24 24H0L12 0Z"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </svg>
      </div>
      <ResizeHandle onResize={handleResize} position="bottom-right right-0 bottom-0" />
    </div>
  );
};