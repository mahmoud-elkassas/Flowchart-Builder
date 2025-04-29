import React, { useState } from 'react';
import { Square, UserRoundCog as RoundedCorner, Circle, Diamond, Triangle, MessageCircle, Undo2, Redo2, Save, Upload, Download, ChevronLeft, Search, Plus, Hand, MousePointer2, Frame, Palette, Type, Text, StickyNote as StickyNoteIcon, Bold, Italic, Pencil, Eraser, Sun, Moon, Image } from 'lucide-react';
import { useFlowStore } from '../store/flowStore';
import ShapesMenu from './ShapesMenu';

interface ToolbarProps {
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onDragStart, onSave, onLoad, onExport, onImageUpload }) => {
  const { 
    undo, 
    redo, 
    nodes, 
    updateNodeColor, 
    updateNodeTextStyle,
    drawing: { isDrawing, brushColor, brushSize, isEraser },
    currentTool,
    setTool,
    toggleDrawing,
    setBrushColor,
    setBrushSize,
    toggleEraser,
    isDarkMode,
    toggleDarkMode,
  } = useFlowStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedColor, setSelectedColor] = useState(isDarkMode ? '#2d3748' : '#ffffff');
  const [selectedTextColor, setSelectedTextColor] = useState(isDarkMode ? '#e2e8f0' : '#374151');
  const [fontSize, setFontSize] = useState(14);

  const selectedNodes = nodes.filter(node => node.selected);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    selectedNodes.forEach(node => {
      updateNodeColor(node.id, newColor);
    });
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setSelectedTextColor(newColor);
    selectedNodes.forEach(node => {
      updateNodeTextStyle(node.id, { color: newColor });
    });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setFontSize(newSize);
    selectedNodes.forEach(node => {
      updateNodeTextStyle(node.id, { fontSize: newSize });
    });
  };

  const toggleTextStyle = (style: 'bold' | 'italic') => {
    selectedNodes.forEach(node => {
      const currentStyle = node.data.textStyle?.[style] || false;
      updateNodeTextStyle(node.id, { [style]: !currentStyle });
    });
  };

  return (
    <>
      {/* Left Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white'} shadow-lg transition-all duration-300 z-50 flex
                   ${isCollapsed ? 'w-[60px]' : 'w-[240px]'}`}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-full p-1 shadow-md hover:shadow-lg transition-shadow`}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        <div className="w-full flex flex-col h-full">
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className={`w-full ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100'} rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500
                          ${isCollapsed ? 'hidden' : ''}`}
              />
            </div>
          </div>

          {/* Tools Section */}
          <div className="p-2 border-b border-gray-700">
            <div className={`text-xs font-medium text-gray-500 mb-2 ${isCollapsed ? 'hidden' : ''}`}>
              Tools
            </div>
            <div className="space-y-1">
              <button 
                onClick={() => setTool('select')}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                  currentTool === 'select' 
                    ? 'bg-blue-50 text-blue-600' 
                    : isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-200' 
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <MousePointer2 className="w-5 h-5" />
                {!isCollapsed && <span>Select</span>}
              </button>
              <button 
                onClick={() => setTool('hand')}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                  currentTool === 'hand' 
                    ? 'bg-blue-50 text-blue-600' 
                    : isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-200' 
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Hand className="w-5 h-5" />
                {!isCollapsed && <span>Hand Tool</span>}
              </button>
              <button 
                onClick={() => setTool('frame')}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                  currentTool === 'frame' 
                    ? 'bg-blue-50 text-blue-600' 
                    : isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-200' 
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Frame className="w-5 h-5" />
                {!isCollapsed && <span>Frame Tool</span>}
              </button>
              <button
                onClick={toggleDrawing}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                  currentTool === 'draw'
                    ? 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-200'
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Pencil className="w-5 h-5" />
                {!isCollapsed && <span>Draw</span>}
              </button>
              <button
                onClick={toggleEraser}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${
                  currentTool === 'eraser'
                    ? 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-200'
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Eraser className="w-5 h-5" />
                {!isCollapsed && <span>Eraser</span>}
              </button>
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'text')}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} cursor-move ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
              >
                <Text className="w-5 h-5" />
                {!isCollapsed && <span>Text</span>}
              </div>
              <div
                draggable
                onDragStart={(e) => onDragStart(e, 'sticky')}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} cursor-move ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
              >
                <StickyNoteIcon className="w-5 h-5" />
                {!isCollapsed && <span>Sticky Note</span>}
              </div>
              <label className={`flex items-center space-x-3 w-full p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} cursor-pointer ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <Image className="w-5 h-5" />
                {!isCollapsed && <span>Upload Image</span>}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onImageUpload}
                />
              </label>
            </div>
          </div>

          {/* Drawing Tools - Only visible when drawing is active */}
          {isDrawing && (
            <div className="p-2 border-b border-gray-700">
              <div className={`text-xs font-medium text-gray-500 mb-2 ${isCollapsed ? 'hidden' : ''}`}>
                Drawing Tools
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 w-full p-2">
                  {!isCollapsed && <span className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>Brush Color</span>}
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-8 h-8 cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-3 w-full p-2">
                  {!isCollapsed && <span className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>Brush Size</span>}
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className={`${isCollapsed ? 'w-8' : 'w-32'}`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Style Section - Only visible when nodes are selected */}
          {selectedNodes.length > 0 && (
            <div className="p-2 border-b border-gray-700">
              <div className={`text-xs font-medium text-gray-500 mb-2 ${isCollapsed ? 'hidden' : ''}`}>
                Style
              </div>
              <div className="space-y-2">
                <div className={`flex items-center space-x-3 w-full p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Palette className="w-5 h-5" />
                  {!isCollapsed ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <span>Fill</span>
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={handleColorChange}
                        className="w-6 h-6 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={handleColorChange}
                      className="w-5 h-5 cursor-pointer"
                    />
                  )}
                </div>
                <div className={`flex items-center space-x-3 w-full p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Type className="w-5 h-5" />
                  {!isCollapsed ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <span>Text</span>
                      <input
                        type="color"
                        value={selectedTextColor}
                        onChange={handleTextColorChange}
                        className="w-6 h-6 cursor-pointer"
                      />
                      <input
                        type="number"
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        min="8"
                        max="72"
                        className={`w-16 px-2 py-1 text-sm border rounded ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'
                        }`}
                      />
                      <button
                        onClick={() => toggleTextStyle('bold')}
                        className={`p-1 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleTextStyle('italic')}
                        className={`p-1 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded`}
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <input
                        type="color"
                        value={selectedTextColor}
                        onChange={handleTextColorChange}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <input
                        type="number"
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        min="8"
                        max="72"
                        className={`w-8 px-1 text-xs border rounded ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shapes Section */}
          <ShapesMenu isCollapsed={isCollapsed} isDarkMode={isDarkMode} onDragStart={onDragStart} />
        </div>
      </div>

      {/* Top Toolbar */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white'} rounded-xl shadow-lg z-50 px-2 py-1.5 flex items-center space-x-1`}>
        <button
          onClick={undo}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={redo}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
          title="Redo"
        >
          <Redo2 size={18} />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          onClick={onSave}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
          title="Save"
        >
          <Save size={18} />
        </button>
        <label 
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors cursor-pointer ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
          title="Load"
        >
          <Upload size={18} />
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={onLoad}
          />
        </label>
        <button
          onClick={onExport}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
          title="Export as PNG"
        >
          <Download size={18} />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </>
  );
};