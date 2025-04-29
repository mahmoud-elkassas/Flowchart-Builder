import { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Node, Edge } from "reactflow";

interface Cursor {
  id: string;
  x: number;
  y: number;
  username: string;
}

export const useCollaboration = (roomId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});

  useEffect(() => {
    const doc = new Y.Doc();
    const provider = new WebsocketProvider("ws://localhost:1234", roomId, doc);
    const awareness = provider.awareness;

    provider.on("status", ({ status }: { status: string }) => {
      setIsConnected(status === "connected");
    });

    awareness.on("change", () => {
      const states = Array.from(awareness.getStates().values());
      const usernames = states
        .map((state: any) => state.user?.name)
        .filter(Boolean);
      const cursorStates = states.reduce(
        (acc: Record<string, Cursor>, state: any) => {
          if (state.cursor) {
            acc[state.user.id] = {
              id: state.user.id,
              x: state.cursor.x,
              y: state.cursor.y,
              username: state.user.name,
            };
          }
          return acc;
        },
        {}
      );

      setUsers(usernames);
      setCursors(cursorStates);
    });

    const cleanup = () => {
      provider.destroy();
    };

    return cleanup;
  }, [roomId]);

  const updateCursor = (x: number, y: number) => {
    // This function would be implemented to update the local user's cursor position
    // through the awareness protocol
  };

  const syncNodes = (nodes: Node[]) => {
    // This function would be implemented to sync node changes with other users
  };

  const syncEdges = (edges: Edge[]) => {
    // This function would be implemented to sync edge changes with other users
  };

  return {
    isConnected,
    users,
    cursors,
    updateCursor,
    syncNodes,
    syncEdges,
  };
};
