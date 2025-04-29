import React from "react";
import { useReactFlow } from "reactflow";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export const Controls: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => zoomIn()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => zoomOut()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={() => fitView()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          title="Fit View"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
