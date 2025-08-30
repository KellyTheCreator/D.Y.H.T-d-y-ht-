import React, { useState, useRef, useCallback, useEffect } from 'react';

interface DraggableDwightPanelProps {
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  width?: number;
  height?: number;
  backgroundImage?: string;
}

export default function DraggableDwightPanel({
  children,
  initialPosition = { x: 38, y: 38 },
  width = 360, // Reduced from 450px (20% smaller)
  height = 415, // Reduced from 520px (20% smaller)
  backgroundImage
}: DraggableDwightPanelProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!panelRef.current) return;
    
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Constrain to viewport
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragOffset, width, height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width,
        height,
        zIndex: 100,
        background: backgroundImage 
          ? `url('${backgroundImage}') center/cover no-repeat, rgba(30,34,36,0.98)`
          : 'rgba(30,34,36,0.98)',
        border: '2.3px solid #38B6FF',
        borderRadius: '26px',
        boxShadow: isDragging 
          ? '0 8px 32px rgba(56, 182, 255, 0.4), 0 2px 8px rgba(0,0,0,0.8)'
          : '0 4px 22px #000b',
        padding: '22px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '11px',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
        userSelect: 'none',
        backgroundBlendMode: backgroundImage ? 'overlay' : 'normal'
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
}