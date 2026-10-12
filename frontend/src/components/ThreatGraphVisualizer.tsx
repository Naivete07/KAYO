import React, { useState, useMemo } from 'react';
import { Network, RefreshCw } from 'lucide-react';
import type { GraphData, GraphNode } from '../types';

interface ThreatGraphVisualizerProps {
  graphData: GraphData | null;
  selectedIncidentTitle?: string;
  onRefresh?: () => void;
}

export const ThreatGraphVisualizer: React.FC<ThreatGraphVisualizerProps> = ({
  graphData,
  selectedIncidentTitle,
  onRefresh
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Compute node layout coordinates for clean visualization
  const computedNodes = useMemo(() => {
    if (!graphData || !graphData.nodes) return [];

    const nodes = [...graphData.nodes];
    const height = 480;

    // Type-based tier placement (X coordinate tiers from Cyber to Financial)
    const typeTiers: Record<string, number> = {
      'User': 100,
      'Device': 220,
      'Process': 360,
      'IP': 480,
      'Bank_Account': 600,
      'UPI_Account': 620,
      'Transaction': 740
    };

    const typeCounters: Record<string, number> = {};

    return nodes.map((node, idx) => {
      const tierX = typeTiers[node.type] || (150 + (idx % 4) * 160);
      const count = typeCounters[node.type] || 0;
      typeCounters[node.type] = count + 1;

      // Distribute Y along vertical space
      const tierY = 80 + count * 110 + (idx % 2 === 0 ? 0 : 30);

      return {
        ...node,
        x: tierX,
        y: Math.min(Math.max(tierY, 70), height - 70)
      };
    });
  }, [graphData]);

  const getNodeColor = (node: GraphNode) => {
    if (node.status === 'contained') return '#10b981'; // Green
    if (node.risk_score >= 0.8) return '#f43f5e'; // Red
    if (node.risk_score >= 0.5) return '#f59e0b'; // Amber
    return '#06b6d4'; // Cyan
  };

  const filteredNodes = computedNodes.filter(n => filterType === 'ALL' || n.type === filterType);
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-400" />
            Cross-Domain Threat Graph (Cyber + Financial Correlation)
          </h2>
          <p className="text-xs text-slate-400">
            {selectedIncidentTitle ? `Focus Subgraph: ${selectedIncidentTitle}` : 'Unified Entity Relationship & Attack Propagation Topology'}
          </p>
        </div>

        {/* Filter Badges & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800 text-xs">
            {['ALL', 'Process', 'IP', 'UPI_Account', 'Transaction'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  filterType === type
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Graph"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Visualizer Canvas */}
        <div className="lg:col-span-3 bg-[#050811]/90 rounded-xl border border-slate-800/80 relative overflow-hidden min-h-[460px] flex items-center justify-center">
          {/* Subtle Background Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          <svg className="w-full h-[460px] select-none" viewBox="0 0 850 480">
            <defs>
              <linearGradient id="edgeGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="edgeGradNormal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Edges */}
            {graphData && graphData.edges && graphData.edges.map((edge, idx) => {
              const srcNode = computedNodes.find(n => n.id === edge.source);
              const tgtNode = computedNodes.find(n => n.id === edge.target);

              if (!srcNode || !tgtNode) return null;
              if (!filteredNodeIds.has(srcNode.id) && !filteredNodeIds.has(tgtNode.id)) return null;

              const isAnomalous = edge.is_anomalous;
              const midX = (srcNode.x! + tgtNode.x!) / 2;
              const midY = (srcNode.y! + tgtNode.y!) / 2 - 10;

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={isAnomalous ? "url(#edgeGradRed)" : "url(#edgeGradNormal)"}
                    strokeWidth={isAnomalous ? "2.5" : "1.5"}
                    strokeDasharray={isAnomalous ? "6,4" : "none"}
                    className={isAnomalous ? "animate-pulse" : ""}
                  />
                  {/* Edge Relation Label */}
                  <rect
                    x={midX - 35}
                    y={midY - 8}
                    width="70"
                    height="16"
                    rx="4"
                    fill="#0f172a"
                    stroke={isAnomalous ? "#f43f5e" : "#334155"}
                    strokeWidth="0.8"
                    opacity="0.9"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={isAnomalous ? "#fca5a5" : "#94a3b8"}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {edge.relation}
                  </text>
                </g>
              );
            })}

            {/* Render Nodes */}
            {filteredNodes.map((node) => {
              const color = getNodeColor(node);
              const isSelected = selectedNode?.id === node.id;
              const isCritical = node.risk_score >= 0.8 && node.status !== 'contained';

              return (
                <g
                  key={`node-${node.id}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Glowing halo for critical nodes */}
                  {isCritical && (
                    <circle
                      r="26"
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}

                  {/* Main Circle */}
                  <circle
                    r={isSelected ? "22" : "18"}
                    fill="#090d1a"
                    stroke={isSelected ? "#ffffff" : color}
                    strokeWidth={isSelected ? "3" : "2"}
                    filter={isCritical ? "url(#glow)" : undefined}
                    className="transition-all duration-200"
                  />

                  {/* Icon or Type Marker */}
                  <circle
                    r="8"
                    fill={color}
                    opacity="0.8"
                  />

                  {/* Node Label text */}
                  <text
                    y="32"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="10"
                    fontWeight="600"
                    className="select-none pointer-events-none group-hover:fill-cyan-300 font-sans"
                  >
                    {node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label}
                  </text>

                  {/* Type Badge */}
                  <text
                    y="43"
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="8"
                    fontFamily="monospace"
                    className="select-none pointer-events-none"
                  >
                    [{node.type}]
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Domain Legend */}
          <div className="absolute bottom-3 left-3 bg-[#070b14]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-[10px] text-slate-300 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
              <span>Identity / Endpoint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Injected Process / C2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
              <span>UPI / Bank Mule</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <span>Contained</span>
            </div>
          </div>
        </div>

        {/* Node Forensic Inspector Panel */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Entity Inspector</span>
              {selectedNode && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  selectedNode.status === 'contained'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : selectedNode.risk_score >= 0.8
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {selectedNode.status.toUpperCase()}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block font-mono">ENTITY LABEL</label>
                  <div className="font-bold text-white text-sm mt-0.5">{selectedNode.label}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">TYPE</span>
                    <span className="font-semibold text-cyan-300">{selectedNode.type}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">RISK SCORE</span>
                    <span className={`font-bold font-mono ${
                      selectedNode.risk_score >= 0.8 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {(selectedNode.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Metadata key-value listing */}
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold mb-1 font-sans">CROSS-DOMAIN ATTRIBUTES</div>
                  {Object.entries(selectedNode.metadata).length > 0 ? (
                    Object.entries(selectedNode.metadata).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-slate-200 font-medium">{String(v)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">No additional telemetry flags.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                <Network className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-50" />
                Click on any node in the graph to inspect cross-domain telemetry and threat relations.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="text-cyan-400 font-semibold">Graph Engine:</span> Neo4j + NetworkX cross-layer correlation.
          </div>
        </div>
      </div>
    </div>
  );
};
