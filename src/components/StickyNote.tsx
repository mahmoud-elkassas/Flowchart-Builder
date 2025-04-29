import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, Copy } from 'lucide-react';
import { useFlowStore } from '../store/flowStore';

interface StickyNoteProps {
  id: string;
  data: {
    text: string;
    color: string;
    width?: number;
    height?: number;
    textStyle?: {
      fontSize?: number;
      color?: string;
      bold?: boolean;
      italic?: boolean;
    };
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

export const StickyNote: React.FC<StickyNoteProps> = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { updateNodeDimensions, updateNodeText, duplicateNode, deleteNode, isDarkMode } = useFlowStore();

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
    updateNodeText(id, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      updateNodeText(id, text);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  const handleResize = useCallback((dx: number, dy: number) => {
    updateNodeDimensions(id, {
      width: Math.max(150, (data.width || 200) + dx),
      height: Math.max(100, (data.height || 150) + dy),
    });
  }, [id, data.width, data.height, updateNodeDimensions]);

  const textStyles = {
    fontSize: `${data.textStyle?.fontSize || 14}px`,
    color: data.textStyle?.color || (isDarkMode ? '#e2e8f0' : '#374151'),
    fontWeight: data.textStyle?.bold ? 'bold' : 'normal',
    fontStyle: data.textStyle?.italic ? 'italic' : 'normal',
  };

  return (
    <>
      <div
        className={`${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} relative group`}
        style={{
          width: data.width || 200,
          height: data.height || 150,
        }}
        onContextMenu={handleContextMenu}
      >
        <div 
          className="w-full h-full rounded-lg shadow-lg drag-handle cursor-move flex flex-col"
          style={{ 
            backgroundColor: data.color,
            transform: 'rotate(-1deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <Handle type="target" position={Position.Top} className="!border-2" />
          {isEditing ? (
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`w-full h-full p-4 bg-transparent border-none outline-none focus:ring-0 resize-none ${
                isDarkMode ? 'placeholder-gray-500' : 'placeholder-gray-400'
              }`}
              style={textStyles}
              placeholder="Type your note here..."
            />
          ) : (
            <div
              onDoubleClick={handleDoubleClick}
              className="w-full h-full p-4 whitespace-pre-wrap break-words"
              style={textStyles}
            >
              {text || 'Double click to edit'}
            </div>
          )}
          <Handle type="source" position={Position.Bottom} className="!border-2" />
        </div>
        <ResizeHandle onResize={handleResize} position="bottom-right right-0 bottom-0" />
      </div>

      {showContextMenu && (
        <div
          className={`fixed ${
            isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
          } rounded-lg shadow-lg py-1 z-50`}
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <button
            className={`w-full px-4 py-2 text-left ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } flex items-center space-x-2`}
            onClick={() => {
              duplicateNode(id);
              setShowContextMenu(false);
            }}
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>
          <button
            className={`w-full px-4 py-2 text-left ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } text-red-600 flex items-center space-x-2`}
            onClick={() => {
              deleteNode(id);
              setShowContextMenu(false);
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </>
  );
};