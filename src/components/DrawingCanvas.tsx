import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { useFlowStore } from '../store/flowStore';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  size: number;
  isEraser: boolean;
}

interface DrawingCanvasProps {
  isDrawing: boolean;
  brushColor: string;
  brushSize: number;
  isEraser: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = React.memo(({ 
  isDrawing, 
  brushColor, 
  brushSize,
  isEraser 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const { isDarkMode, addDrawing } = useFlowStore();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Memoize canvas options
  const canvasOptions = useMemo(() => ({
    willReadFrequently: false,
    alpha: true,
  }), []);

  // Initialize canvas context with high DPI support
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // Get the device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    
    // Only resize if dimensions have changed
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      // Set the canvas size in CSS pixels
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // Set the canvas buffer size accounting for DPI
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Get and configure the context
      const ctx = canvas.getContext('2d', canvasOptions);
      if (!ctx) return;
      
      // Scale the context to account for DPI
      ctx.scale(dpr, dpr);
      
      // Configure context settings
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctxRef.current = ctx;
      
      // Redraw all strokes when canvas is resized
      requestAnimationFrame(() => redrawCanvas());
    }
  }, [canvasOptions]);

  // Setup resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeObserverRef.current = new ResizeObserver((entries) => {
      requestAnimationFrame(() => initializeCanvas());
    });

    resizeObserverRef.current.observe(canvas.parentElement as Element);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [initializeCanvas]);

  // Initialize canvas on mount and when isDrawing changes
  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas, isDrawing]);

  // Save canvas state after each stroke
  useEffect(() => {
    if (canvasRef.current && strokes.length > 0) {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL();
      addDrawing(imageData);
    }
  }, [strokes, addDrawing]);

  // Redraw the entire canvas
  const redrawCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

    // Redraw all strokes with null check
    strokes.forEach(stroke => {
      if (!stroke || !Array.isArray(stroke.points) || stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.isEraser 
        ? (isDarkMode ? '#1a202c' : '#ffffff')
        : stroke.color;
      ctx.lineWidth = stroke.size;

      const [firstPoint, ...points] = stroke.points;
      if (!firstPoint || typeof firstPoint.x !== 'number' || typeof firstPoint.y !== 'number') return;
      
      ctx.moveTo(firstPoint.x, firstPoint.y);
      
      // Use quadratic curves for smoother lines
      for (let i = 0; i < points.length - 1; i++) {
        const currentPoint = points[i];
        const nextPoint = points[i + 1];
        
        if (!currentPoint || !nextPoint) continue;
        
        const xc = (currentPoint.x + nextPoint.x) / 2;
        const yc = (currentPoint.y + nextPoint.y) / 2;
        ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, xc, yc);
      }
      
      // Draw the last segment
      if (points.length > 0) {
        const lastPoint = points[points.length - 1];
        if (lastPoint && typeof lastPoint.x === 'number' && typeof lastPoint.y === 'number') {
          ctx.lineTo(lastPoint.x, lastPoint.y);
        }
      }
      
      ctx.stroke();
    });
  }, [strokes, isDarkMode]);

  const getCanvasPoint = useCallback((e: React.MouseEvent | React.Touch): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.pageX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.pageY) - rect.top;
    return { x, y };
  }, []);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    e.stopPropagation();
    isDrawingRef.current = true;
    
    const point = getCanvasPoint('touches' in e ? e.touches[0] : e);
    lastPointRef.current = point;
    
    // Start a new stroke
    currentStrokeRef.current = {
      points: [point],
      color: brushColor,
      size: brushSize,
      isEraser: isEraser,
    };
    
    // Clear redo stack when starting a new stroke
    setRedoStack([]);
  }, [isDrawing, brushColor, brushSize, isEraser, getCanvasPoint]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !lastPointRef.current || !currentStrokeRef.current) return;

    e.preventDefault();
    e.stopPropagation();
    const newPoint = getCanvasPoint('touches' in e ? e.touches[0] : e);
    
    // Update current stroke
    currentStrokeRef.current.points.push(newPoint);
    
    // Draw the new segment
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.strokeStyle = isEraser 
        ? (isDarkMode ? '#1a202c' : '#ffffff')
        : brushColor;
      ctx.lineWidth = brushSize;
      
      const lastPoint = lastPointRef.current;
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(newPoint.x, newPoint.y);
      ctx.stroke();
    }
    
    lastPointRef.current = newPoint;
  }, [getCanvasPoint, brushColor, brushSize, isEraser, isDarkMode]);

  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStrokeRef.current) {
      setStrokes(prev => [...prev, currentStrokeRef.current!]);
    }
    isDrawingRef.current = false;
    lastPointRef.current = null;
    currentStrokeRef.current = null;
  }, []);

  const handleUndo = useCallback(() => {
    setStrokes(prev => {
      if (prev.length === 0) return prev;
      const newStrokes = prev.slice(0, -1);
      setRedoStack(redoStack => [...redoStack, prev[prev.length - 1]]);
      requestAnimationFrame(() => redrawCanvas());
      return newStrokes;
    });
  }, [redrawCanvas]);

  const handleRedo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const strokeToRedo = prev[prev.length - 1];
      setStrokes(strokes => [...strokes, strokeToRedo]);
      requestAnimationFrame(() => redrawCanvas());
      return prev.slice(0, -1);
    });
  }, [redrawCanvas]);

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${isDrawing ? 'z-50' : 'z-0'} touch-none ${
        isDrawing ? (isEraser ? 'cursor-eraser' : 'cursor-pencil') : ''
      }`}
      style={{
        willChange: 'transform',
        pointerEvents: isDrawing ? 'auto' : 'none',
      }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    />
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';