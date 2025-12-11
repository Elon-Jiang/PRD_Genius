
import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

interface MermaidRendererProps {
  chart: string;
}

// Initialize with a high-contrast, professional theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
  themeVariables: {
    primaryColor: '#e0f2fe', // Very light blue background for nodes
    primaryTextColor: '#0f172a', // Dark slate text for readability
    primaryBorderColor: '#0ea5e9', // Sky blue border
    lineColor: '#64748b', // Slate 500 for lines
    secondaryColor: '#fef3c7', // Light amber
    tertiaryColor: '#d1fae5', // Light emerald
    mainBkg: '#ffffff',
    nodeBorder: '#cbd5e1',
    clusterBkg: '#f8fafc',
    clusterBorder: '#94a3b8',
    defaultLinkColor: '#64748b',
    // Mindmap specific
    mindmapTextColor: '#0f172a',
  },
  mindmap: {
    useMaxWidth: false,
    padding: 20,
  },
  flowchart: {
    curve: 'linear', // CHANGED: 'basis' causes "Could not find a suitable point" error. 'linear' is robust.
    useMaxWidth: false,
    htmlLabels: true,
    padding: 20,
  }
});

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [svgId] = useState(`mermaid-${Math.random().toString(36).substr(2, 9)}`);
  const [error, setError] = useState<string | null>(null);
  
  // Transform State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (chartRef.current && chart && chart.trim()) {
      const renderChart = async () => {
        try {
          setError(null);
          chartRef.current!.innerHTML = ''; 
          
          // Mermaid needs unique IDs for SVGs to avoid conflicts
          const { svg } = await mermaid.render(svgId, chart);
          
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
            // CRITICAL Fix for visibility: 
            // 1. Remove max-width so it doesn't shrink
            // 2. Set height to auto to allow full expansion
            // 3. Remove fixed width/height attributes from the generated SVG
            const svgElement = chartRef.current.querySelector('svg');
            if (svgElement) {
              svgElement.style.maxWidth = 'none';
              svgElement.style.height = 'auto';
              svgElement.removeAttribute('height'); // Allow it to grow
              svgElement.setAttribute('width', '100%'); 
            }
          }
        } catch (err) {
          console.error('Mermaid rendering failed:', err);
          setError('无法渲染图表，代码可能存在语法错误。');
        }
      };
      
      // Small debounce to prevent rapid re-renders crashing mermaid
      const timer = setTimeout(renderChart, 200);
      return () => clearTimeout(timer);
    }
  }, [chart, svgId]);

  const autoFit = useCallback(() => {
    const container = containerRef.current;
    const svgElement = chartRef.current?.querySelector('svg') as SVGSVGElement | null;
    if (!container || !svgElement) return;
    const containerWidth = container.clientWidth - 24;
    let svgWidth = 0;
    if ((svgElement as any).viewBox && (svgElement as any).viewBox.baseVal) {
      svgWidth = (svgElement as any).viewBox.baseVal.width || 0;
    }
    if (!svgWidth) {
      svgWidth = svgElement.getBoundingClientRect().width || 0;
    }
    if (!svgWidth) {
      const attr = svgElement.getAttribute('width');
      svgWidth = attr ? parseFloat(attr) : 0;
    }
    if (containerWidth > 0 && svgWidth > 0) {
      const newScale = Math.min(5, Math.max(1, containerWidth / svgWidth));
      setScale(newScale);
      setPosition({ x: 0, y: 0 });
    }
  }, []);

  useEffect(() => {
    const before = () => autoFit();
    const after = () => resetView();
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, [autoFit]);

  // Handle Zoom
  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom if control is pressed or if it's a pinch gesture (trackpad)
    // Otherwise standard scrolling might be expected. 
    // Here we force zoom behavior for the canvas feel.
    if (e.ctrlKey || Math.abs(e.deltaY) < 50) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.1, scale + delta), 5);
      setScale(newScale);
    }
  };

  // Handle Pan - Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  // Handle Pan - Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    setPosition({
      x: position.x + deltaX,
      y: position.y + deltaY
    });
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  // Handle Pan - Mouse Up/Leave
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-slate-50 rounded-lg border border-slate-200 shadow-sm relative group print:bg-white">
      {error && (
         <div className="absolute top-0 left-0 right-0 bg-red-50 text-red-600 text-xs p-2 text-center border-b border-red-100 z-10">
           {error}
         </div>
      )}
      
      {/* Zoom Controls - Moved to Bottom Left to avoid Chat Button */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-1 shadow-sm print:hidden">
        <button onClick={() => setScale(s => Math.min(s + 0.2, 5))} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="放大">
          <ZoomIn size={16} />
        </button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.1))} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="缩小">
          <ZoomOut size={16} />
        </button>
        <button onClick={resetView} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="重置视角">
          <RotateCcw size={16} />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative cursor-move bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            minWidth: '100%',
            minHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className=""
        >
           <div ref={chartRef} className="pointer-events-none p-10 w-full" />
        </div>
      </div>
    </div>
  );
};

export default MermaidRenderer;
