import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Node, Edge, Connection, addEdge, MarkerType, applyNodeChanges, applyEdgesChanges, XYPosition } from 'reactflow';
import { debounce } from './utils';

type Tool = 'select' | 'hand' | 'frame' | 'draw' | 'eraser';

interface DrawingState {
  isDrawing: boolean;
  brushColor: string;
  brushSize: number;
  isEraser: boolean;
  drawings: string[];
}

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  history: { nodes: Node[]; edges: Edge[]; drawings: string[] }[];
  currentStep: number;
  drawing: DrawingState;
  isDarkMode: boolean;
  currentTool: Tool;
}

const FLOW_KEY = 'flowState';
const DEBOUNCE_DELAY = 1000; // 1 second

// Memoize the initial state
const INITIAL_STATE: FlowState = Object.freeze({
  nodes: [],
  edges: [],
  history: [],
  currentStep: -1,
  drawing: Object.freeze({
    isDrawing: false,
    brushColor: '#000000',
    brushSize: 2,
    isEraser: false,
    drawings: [],
  }),
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  currentTool: 'select',
});

// Create a worker for JSON operations
const worker = new Worker(
  URL.createObjectURL(
    new Blob([
      `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          if (type === 'stringify') {
            const result = JSON.stringify(data);
            self.postMessage({ type: 'stringifyResult', result });
          } else if (type === 'parse') {
            const result = JSON.parse(data);
            self.postMessage({ type: 'parseResult', result });
          }
        }
      `],
      { type: 'application/javascript' }
    )
  )
);

export function useFlowStore() {
  const queryClient = useQueryClient();

  // Debounced state update
  const debouncedUpdateState = debounce((newState: Partial<FlowState>) => {
    worker.postMessage({ type: 'stringify', data: newState });
  }, DEBOUNCE_DELAY);

  worker.onmessage = (e) => {
    const { type, result } = e.data;
    if (type === 'stringifyResult') {
      localStorage.setItem(FLOW_KEY, result);
    }
  };

  const { data: state = INITIAL_STATE } = useQuery({
    queryKey: [FLOW_KEY],
    queryFn: async () => {
      const savedState = localStorage.getItem(FLOW_KEY);
      if (!savedState) return INITIAL_STATE;
      
      return new Promise((resolve) => {
        worker.onmessage = (e) => {
          const { type, result } = e.data;
          if (type === 'parseResult') {
            resolve(result);
          }
        };
        worker.postMessage({ type: 'parse', data: savedState });
      });
    },
    staleTime: Infinity,
  });

  const updateState = useMutation({
    mutationFn: async (newState: Partial<FlowState>) => {
      const updatedState = { ...state, ...newState };
      debouncedUpdateState(updatedState);
      return updatedState;
    },
    onSuccess: (newState) => {
      queryClient.setQueryData([FLOW_KEY], newState);
    },
  });

  // Batch node changes
  const onNodesChange = (changes: any[]) => {
    requestAnimationFrame(() => {
      const validChanges = changes.map(change => ({
        ...change,
        type: change.type || 'position',
        id: change.id || '',
        data: change.data || (state.nodes.find(node => node.id === change.id)?.data || {})
      }));

      const newNodes = applyNodeChanges(validChanges, state.nodes);
      updateState.mutate({ nodes: newNodes });
      saveToHistory();
    });
  };

  const onEdgesChange = (changes: any[]) => {
    const newEdges = applyEdgesChanges(changes, state.edges);
    updateState.mutate({ edges: newEdges });
    saveToHistory();
  };

  const onConnect = (connection: Connection) => {
    const newEdges = addEdge({
      ...connection,
      type: 'default',
      markerEnd: { type: MarkerType.ArrowClosed },
      animated: false,
      style: { 
        strokeWidth: 2,
        stroke: state.isDarkMode ? '#e2e8f0' : '#64748b',
      },
    }, state.edges);
    updateState.mutate({ edges: newEdges });
    saveToHistory();
  };

  const addNode = (type: string, position: XYPosition, data: any = null) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: data || createDefaultNodeData(type, state.isDarkMode),
      dragHandle: '.drag-handle',
      selected: false,
    };

    updateState.mutate({ nodes: [...state.nodes, newNode] });
    saveToHistory();
  };

  const updateNodeColor = (nodeId: string, color: string) => {
    const newNodes = state.nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, color } } : node
    );
    updateState.mutate({ nodes: newNodes });
    saveToHistory();
  };

  const saveToHistory = () => {
    const newHistory = state.history.slice(0, state.currentStep + 1);
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
      drawings: [...state.drawing.drawings],
    });
    updateState.mutate({
      history: newHistory,
      currentStep: state.currentStep + 1,
    });
  };

  return {
    ...state,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeColor,
  };
}

function createDefaultNodeData(type: string, isDarkMode: boolean) {
  switch (type) {
    case 'sticky':
      return {
        text: 'Double click to edit',
        color: isDarkMode ? '#2d3748' : '#fff7b3',
        width: 200,
        height: 150,
        textStyle: {
          fontSize: 14,
          color: isDarkMode ? '#e2e8f0' : '#374151',
          bold: false,
          italic: false,
        }
      };
    case 'text':
      return {
        text: 'Double click to edit',
        textStyle: {
          fontSize: 14,
          color: isDarkMode ? '#e2e8f0' : '#374151',
          bold: false,
          italic: false,
        }
      };
    default:
      return {
        label: `New ${type}`,
        color: isDarkMode ? '#2d3748' : '#ffffff',
        width: 150,
        height: type === 'circle' ? 150 : 100,
        textStyle: {
          fontSize: 14,
          color: isDarkMode ? '#e2e8f0' : '#374151',
          bold: false,
          italic: false,
        }
      };
  }
}