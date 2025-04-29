import React from "react";
import { Users } from "lucide-react";

interface CollaborationPanelProps {
  users: string[];
  isConnected: boolean;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  users,
  isConnected,
}) => {
  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <Users className="w-5 h-5" />
        <span className="text-sm">{users.length} online</span>
      </div>
    </div>
  );
};
