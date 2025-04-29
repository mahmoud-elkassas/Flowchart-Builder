import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ShapeItemProps {
  shape: string;
  label: string;
  icon: React.FC;
  isCollapsed: boolean;
  isDarkMode: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
}

const ShapeItem: React.FC<ShapeItemProps> = ({ shape, label, icon: Icon, isCollapsed, isDarkMode, onDragStart }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      draggable
      onDragStart={(e) => {
        onDragStart(e, shape);
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isDragging ? { scale: 1.1, opacity: 0.8 } : { scale: 1, opacity: 1 }}
      className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors cursor-move
        ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}
        ${isDragging ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
    >
      <div className="relative">
        <Icon />
        {!isCollapsed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isDragging ? 1 : 0 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
          />
        )}
      </div>
      {!isCollapsed && (
        <span className="flex-1 text-sm font-medium">{label}</span>
      )}
    </motion.div>
  );
};

interface ShapeCategory {
  title: string;
  shapes: {
    type: string;
    label: string;
    icon: React.FC;
  }[];
}

interface CategorySectionProps {
  category: ShapeCategory;
  isCollapsed: boolean;
  isDarkMode: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, isCollapsed, isDarkMode, onDragStart }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center space-x-2 w-full px-2 py-1 text-xs font-medium ${
            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} />
          </motion.div>
          <span>{category.title}</span>
        </motion.button>
      )}
      <motion.div
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="space-y-1 overflow-hidden"
      >
        {category.shapes.map((shape) => (
          <ShapeItem
            key={shape.type}
            shape={shape.type}
            label={shape.label}
            icon={shape.icon}
            isCollapsed={isCollapsed}
            isDarkMode={isDarkMode}
            onDragStart={onDragStart}
          />
        ))}
      </motion.div>
    </div>
  );
};

interface ShapesMenuProps {
  isCollapsed: boolean;
  isDarkMode: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
}

// SVG Components with strokes instead of fills
const RectangleSVG: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <rect x="2" y="6" width="20" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const RoundedRectangleSVG: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <rect x="2" y="6" width="20" height="12" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const CircleSVG: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const EllipseSVG: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <ellipse cx="12" cy="12" rx="9" ry="5" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const TriangleSVG: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 4L4 20H20L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
  </svg>
);

const DiamondSVG: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 4L20 12L12 20L4 12L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
  </svg>
);

const BubbleSVG: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M4 12a8 8 0 018-8h4a8 8 0 010 16h-1l-3 3v-3h-4a8 8 0 01-8-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
  </svg>
);

const ShapesMenu: React.FC<ShapesMenuProps> = ({ isCollapsed, isDarkMode, onDragStart }) => {
  const categories: ShapeCategory[] = [
    {
      title: 'Basic Shapes',
      shapes: [
        { type: 'rectangle', label: 'Rectangle', icon: RectangleSVG },
        { type: 'roundedRectangle', label: 'Rounded Rectangle', icon: RoundedRectangleSVG },
        { type: 'circle', label: 'Circle', icon: CircleSVG },
        { type: 'ellipse', label: 'Ellipse', icon: EllipseSVG },
      ],
    },
    {
      title: 'Special Shapes',
      shapes: [
        { type: 'triangle', label: 'Triangle', icon: TriangleSVG },
        { type: 'diamond', label: 'Diamond', icon: DiamondSVG },
        { type: 'bubble', label: 'Speech Bubble', icon: BubbleSVG },
      ],
    },
  ];

  return (
    <div className="p-2 space-y-4">
      {!isCollapsed && (
        <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-2`}>
          Shapes
        </div>
      )}
      {categories.map((category) => (
        <CategorySection
          key={category.title}
          category={category}
          isCollapsed={isCollapsed}
          isDarkMode={isDarkMode}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
};

export default ShapesMenu;