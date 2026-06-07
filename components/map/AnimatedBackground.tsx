'use client';
import { useEffect, useRef } from 'react';
import { fieldNodes, fieldEdges } from '@/lib/fieldGraph';

const PRIMARY = '#818CF8';

export default function AnimatedGraphBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Random float offsets for each node
    const floatOffsets = fieldNodes.map(() => ({
      x: (Math.random() - 0.5) * 12,
      y: (Math.random() - 0.5) * 12,
      phase: Math.random() * Math.PI * 2,
    }));

    let frame: number;
    const startTime = performance.now();
    const duration = 6000; // 6 second cycle

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = (elapsed % duration) / duration;
      const wave = Math.sin(t * Math.PI * 2);

      fieldNodes.forEach((node, i) => {
        const offset = floatOffsets[i];
        const svgNode = container.querySelector(`[data-node="${node.id}"]`) as SVGGElement | null;
        if (svgNode) {
          const dx = offset.x * wave;
          const dy = offset.y * wave;
          svgNode.style.transform = `translate(${dx}px, ${dy}px)`;
        }
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg
        viewBox="0 0 820 560"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
      >
        {/* Edges - very subtle */}
        {fieldEdges.map((edge, i) => {
          const src = fieldNodes.find(n => n.id === edge.source);
          const tgt = fieldNodes.find(n => n.id === edge.target);
          if (!src || !tgt) return null;
          return (
            <line
              key={i}
              x1={src.x}
              y1={src.y}
              x2={tgt.x}
              y2={tgt.y}
              stroke={PRIMARY}
              strokeWidth={edge.strength * 0.5}
              strokeOpacity={0.1}
            />
          );
        })}

        {/* Nodes */}
        {fieldNodes.map(node => {
          return (
            <g
              key={node.id}
              data-node={node.id}
              style={{ transition: 'transform 0.1s ease-out' }}
            >
              {/* Outer glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius + 8}
                fill={PRIMARY}
                fillOpacity={0.04}
              />
              {/* Mid glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius + 4}
                fill={PRIMARY}
                fillOpacity={0.08}
              />
              {/* Main node */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius * 0.8}
                fill={PRIMARY}
                fillOpacity={0.2}
                stroke={PRIMARY}
                strokeWidth={1}
                strokeOpacity={0.25}
              />
              {/* Inner bright spot */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius * 0.3}
                fill={PRIMARY}
                fillOpacity={0.3}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
