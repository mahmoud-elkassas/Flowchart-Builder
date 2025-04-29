import React from "react";

interface Cursor {
  id: string;
  x: number;
  y: number;
  username: string;
}

interface CursorsProps {
  cursors: Record<string, Cursor>;
}

export const Cursors: React.FC<CursorsProps> = ({ cursors }) => {
  return (
    <>
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.id}
          className="absolute w-4 h-4 pointer-events-none"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full" />
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
            {cursor.username}
          </div>
        </div>
      ))}
    </>
  );
};
