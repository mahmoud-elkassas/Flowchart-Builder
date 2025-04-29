import React, { useRef, useState, useEffect } from "react";
import { useReactFlow } from "reactflow";

interface DrawingLayerProps {
  isActive: boolean;
  isDarkMode: boolean;
  zIndex: number;
}

interface Path {
  points: Point[];
  pressure: number[];
  color: string;
  width: number;
  opacity: number;
}

interface Point {
  x: number;
  y: number;
}

export const DrawingLayer: React.FC<DrawingLayerProps> = ({
  isActive,
  isDarkMode,
  zIndex,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const { project } = useReactFlow();
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!isActive) {
      setCurrentPath(null);
    }
  }, [isActive]);

  const startDrawing = (event: React.PointerEvent) => {
    if (!isActive) return;

    const point = project({
      x: event.clientX,
      y: event.clientY,
    });

    const pressure = event.pressure !== 0 ? event.pressure : 1;
    const newPath: Path = {
      points: [point],
      pressure: [pressure],
      color,
      width,
      opacity,
    };

    setCurrentPath(newPath);
  };

  const draw = (event: React.PointerEvent) => {
    if (!isActive || !currentPath) return;

    const point = project({
      x: event.clientX,
      y: event.clientY,
    });

    const pressure = event.pressure !== 0 ? event.pressure : 1;
    setCurrentPath((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point],
        pressure: [...prev.pressure, pressure],
      };
    });
  };

  const endDrawing = () => {
    if (currentPath) {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath(null);
    }
  };

  const getPathD = (path: Path): string => {
    if (path.points.length < 2) return "";

    let d = `M ${path.points[0].x} ${path.points[0].y}`;
    for (let i = 1; i < path.points.length; i++) {
      const prevPoint = path.points[i - 1];
      const currentPoint = path.points[i];
      const prevPressure = path.pressure[i - 1];
      const currentPressure = path.pressure[i];

      // Calculate control points for smooth curve
      const cp1x =
        prevPoint.x +
        (currentPoint.x - path.points[i - 2]?.x || prevPoint.x) / 3;
      const cp1y = prevPoint.y;
      const cp2x =
        prevPoint.x +
        ((currentPoint.x - path.points[i - 2]?.x || prevPoint.x) * 2) / 3;
      const cp2y = currentPoint.y;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentPoint.x} ${currentPoint.y}`;
    }
    return d;
  };

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex }}
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={endDrawing}
      onPointerLeave={endDrawing}
    >
      <defs>
        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <stop offset="100%" stopColor={color} stopOpacity={opacity} />
        </linearGradient>
      </defs>
      {paths.map((path, index) => (
        <path
          key={index}
          d={getPathD(path)}
          fill="none"
          stroke={path.color}
          strokeWidth={path.width}
          strokeOpacity={path.opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {currentPath && (
        <path
          d={getPathD(currentPath)}
          fill="none"
          stroke={currentPath.color}
          strokeWidth={currentPath.width}
          strokeOpacity={currentPath.opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};
