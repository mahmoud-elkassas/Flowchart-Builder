import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, MarkerType, applyNodeChanges, applyEdgeChanges, XYPosition } from 'reactflow';

interface DrawingState {
  isDrawing: boolean;
  brushColor: string;
  brushSize: number;
  isEraser: boolean;
  drawings: string[];
}

type Tool = 'select' | 'hand' | 'frame' | 'draw' | 'eraser';

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  history: { nodes: Node[]; edges: Edge[]; drawings: string[] }[];
  currentStep: number;
  drawing: DrawingState;
  isDarkMode: boolean;
  currentTool: Tool;
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: XYPosition, data?: any) => void;
  updateNodeColor: (nodeId: string, color: string) => void;
  updateNodeDimensions: (nodeId: string, dimensions: { width?: number; height?: number }) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeText: (nodeId: string, text: string) => void;
  updateNodeTextStyle: (nodeId: string, style: { fontSize?: number; color?: string; bold?: boolean; italic?: boolean }) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  setTool: (tool: Tool) => void;
  toggleDrawing: () => void;
  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  toggleEraser: () => void;
  addDrawing: (drawing: string) => void;
  clearDrawings: () => void;
  toggleDarkMode: () => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  history: [],
  currentStep: -1,
  currentTool: 'select',
  drawing: {
    isDrawing: false,
    brushColor: '#000000',
    brushSize: 2,
    isEraser: false,
    drawings: [],
  },
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,

  onNodesChange: (changes) => {
    try {
      set((state) => {
        const validChanges = changes.map(change => ({
          ...change,
          type: change.type || 'position',
          id: change.id || '',
          data: change.data || (
            state.nodes.find(node => node.id === change.id)?.data || {}
          )
        }));
        
        return {
          nodes: applyNodeChanges(validChanges, state.nodes)
        };
      });
      get().saveToHistory();
    } catch (error) {
      console.error('Error applying node changes:', error);
    }
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
    get().saveToHistory();
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge({
        ...connection,
        type: 'default',
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: false,
        style: { 
          strokeWidth: 2,
          stroke: state.isDarkMode ? '#e2e8f0' : '#64748b',
        },
      }, state.edges),
    }));
    get().saveToHistory();
  },

  addNode: (type, position, data = null) => {
    const isDark = get().isDarkMode;
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: data || (type === 'sticky' ? {
        text: 'Double click to edit',
        color: isDark ? '#2d3748' : '#fff7b3',
        width: 200,
        height: 150,
        textStyle: {
          fontSize: 14,
          color: isDark ? '#e2e8f0' : '#374151',
          bold: false,
          italic: false,
        }
      } : type === 'text' ? {
        text: 'Double click to edit',
        textStyle: {
          fontSize: 14,
          color: isDark ? '#e2e8f0' : '#374151',
          bold: false,
          italic: false,
        }
      } : { 
        label: `New ${type}`, 
        color: isDark ? '#2d3748' : '#ffffff',
        width: 150,
        height: type === 'circle' ? 150 : 100,
        textStyle: {
          fontSize: 14,
          color: isDark ? '#e2e8f0' : '#374151',
          bold: false,
          italic: false,
        }
      }),
      dragHandle: '.drag-handle',
      selected: false,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    get().saveToHistory();
  },

  updateNodeColor: (nodeId, color) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, color } } : node
      ),
    }));
    get().saveToHistory();
  },

  updateNodeDimensions: (nodeId, dimensions) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? {
          ...node,
          data: {
            ...node.data,
            ...(dimensions.width && { width: dimensions.width }),
            ...(dimensions.height && { height: dimensions.height }),
          },
        } : node
      ),
    }));
    get().saveToHistory();
  },

  updateNodeLabel: (nodeId, label) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label } } : node
      ),
    }));
    get().saveToHistory();
  },

  updateNodeText: (nodeId, text) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, text } } : node
      ),
    }));
    get().saveToHistory();
  },

  updateNodeTextStyle: (nodeId, style) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? {
          ...node,
          data: {
            ...node.data,
            textStyle: {
              ...node.data.textStyle,
              ...style
            }
          }
        } : node
      ),
    }));
    get().saveToHistory();
  },

  duplicateNode: (nodeId) => {
    set((state) => {
      const nodeToDuplicate = state.nodes.find(node => node.id === nodeId);
      if (!nodeToDuplicate) return state;

      const newNode: Node = {
        ...nodeToDuplicate,
        id: `${nodeToDuplicate.type}-${Date.now()}`,
        position: {
          x: nodeToDuplicate.position.x + 20,
          y: nodeToDuplicate.position.y + 20,
        },
        selected: false,
      };

      return {
        nodes: [...state.nodes, newNode],
      };
    });
    get().saveToHistory();
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter(node => node.id !== nodeId),
      edges: state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
    }));
    get().saveToHistory();
  },

  setTool: (tool) => {
    set((state) => ({
      currentTool: tool,
      drawing: {
        ...state.drawing,
        isDrawing: tool === 'draw',
        isEraser: tool === 'eraser',
      },
    }));
  },

  toggleDrawing: () => {
    set((state) => {
      const newIsDrawing = !state.drawing.isDrawing;
      return {
        currentTool: newIsDrawing ? 'draw' : 'select',
        drawing: {
          ...state.drawing,
          isDrawing: newIsDrawing,
          isEraser: false,
        },
      };
    });
  },

  setBrushColor: (color) => {
    set((state) => ({
      drawing: {
        ...state.drawing,
        brushColor: color,
        isEraser: false,
      },
    }));
  },

  setBrushSize: (size) => {
    set((state) => ({
      drawing: {
        ...state.drawing,
        brushSize: size,
      },
    }));
  },

  toggleEraser: () => {
    set((state) => {
      const newIsEraser = !state.drawing.isEraser;
      return {
        currentTool: newIsEraser ? 'eraser' : 'draw',
        drawing: {
          ...state.drawing,
          isEraser: newIsEraser,
          isDrawing: true,
        },
      };
    });
  },

  addDrawing: (drawing) => {
    set((state) => ({
      drawing: {
        ...state.drawing,
        drawings: [...state.drawing.drawings, drawing],
      },
    }));
    get().saveToHistory();
  },

  clearDrawings: () => {
    set((state) => ({
      drawing: {
        ...state.drawing,
        drawings: [],
      },
    }));
    get().saveToHistory();
  },

  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.isDarkMode;
      document.documentElement.classList.toggle('dark', newDarkMode);
      return { isDarkMode: newDarkMode };
    });
  },

  saveToHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.currentStep + 1);
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
      drawings: [...state.drawing.drawings],
    });
    set({
      history: newHistory,
      currentStep: state.currentStep + 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.currentStep > 0) {
      const previousState = state.history[state.currentStep - 1];
      set({
        nodes: previousState.nodes,
        edges: previousState.edges,
        drawing: {
          ...state.drawing,
          drawings: previousState.drawings,
        },
        currentStep: state.currentStep - 1,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.currentStep < state.history.length - 1) {
      const nextState = state.history[state.currentStep + 1];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        drawing: {
          ...state.drawing,
          drawings: nextState.drawings,
        },
        currentStep: state.currentStep + 1,
      });
    }
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}));