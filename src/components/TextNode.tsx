import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useFlowStore } from '../store/flowStore';

interface TextNodeProps {
  id: string;
  data: {
    text: string;
    textStyle?: {
      fontSize?: number;
      color?: string;
    };
  };
  selected: boolean;
}

export const TextNode: React.FC<TextNodeProps> = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const updateNodeText = useFlowStore((state) => state.updateNodeText);
  const isDarkMode = useFlowStore((state) => state.isDarkMode);

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

  const textStyles = {
    fontSize: `${data.textStyle?.fontSize || 14}px`,
    color: data.textStyle?.color || (isDarkMode ? '#e2e8f0' : '#374151'),
  };

  return (
    <div
      className={`min-w-[100px] min-h-[40px] p-2 rounded drag-handle cursor-move relative group
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
    >
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full h-full min-h-[40px] bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 resize-none ${
            isDarkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'
          }`}
          style={textStyles}
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className="whitespace-pre-wrap break-words"
          style={textStyles}
        >
          {text || 'Double click to edit'}
        </div>
      )}
    </div>
  );
};