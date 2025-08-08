"use client";
import React, { useRef, useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  NodeProps,
  Position
} from "reactflow";
import "reactflow/dist/style.css";

// --- Node Data Type ---
type RoadmapNodeData = {
  label: string;
  icon: string;
  description: string;
  level?: string;
  editable?: boolean;
  onUpdate?: (newData: { label: string; icon: string; description: string; level?: string }) => void;
};

// --- Node Component ---
const RoadmapNode: React.FC<NodeProps<RoadmapNodeData>> = ({ data, selected }) => {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    label: data.label,
    icon: data.icon,
    description: data.description,
    level: data.level || "",
  });

  // Start/Stop Edit Mode
  const startEdit = () => { if (data.editable) setEditMode(true); };
  const stopEdit = () => {
    setEditMode(false);
    data.onUpdate && data.onUpdate(form);
  };

  // If editing, show form
  if (editMode) {
    return (
      <div className="flex flex-col items-center py-2 px-4 rounded-xl shadow-md border-2 border-pink-400 bg-[rgba(30,9,60,0.97)] min-w-[165px] relative">
        <input
          value={form.icon}
          onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
          className="w-8 text-xl text-center bg-transparent border-b border-purple-400 mb-1"
          maxLength={2}
          autoFocus
        />
        <input
          value={form.label}
          onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          className="text-center bg-transparent border-b border-purple-400 text-purple-200 font-semibold mb-1"
          maxLength={30}
        />
        <input
          value={form.level}
          onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
          className="text-xs text-center bg-transparent border-b border-purple-400 mb-1"
          placeholder="Level (beginner/intermediate/advanced)"
          maxLength={18}
        />
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="text-xs bg-transparent border-b border-purple-400 text-white font-medium text-center"
          rows={2}
          maxLength={80}
        />
        <button
          onClick={stopEdit}
          className="mt-2 px-3 py-0.5 text-xs bg-purple-600/60 text-white rounded-lg"
        >
          Save
        </button>
      </div>
    );
  }

  // Normal Display Mode
  return (
    <div
      onDoubleClick={startEdit}
      title={data.editable ? "Double-click to edit" : undefined}
      className={`flex flex-col items-center py-2 px-4 rounded-xl shadow-md transition border-2
        ${selected ? "border-pink-400" : "border-purple-400/40"}
        ${data.editable ? "cursor-pointer" : "cursor-grab"}
        relative
      `}
      style={{
        background: "rgba(30,9,60,0.91)",
        minWidth: 165,
        color: "#fff",
        boxShadow: "0 2px 20px 0 #a21caf44, 0 0px 0px 2px #d946ef30",
      }}
    >
      <span className="text-2xl mb-1">{data.icon}</span>
      <div className="font-semibold text-purple-200 mb-1 text-center">{data.label}</div>
      {data.level && (
        <div className={`text-xs px-2 py-0.5 rounded-full mb-1 ${
          data.level === "beginner"
            ? "bg-purple-500/10 text-purple-200"
            : data.level === "advanced"
            ? "bg-pink-500/10 text-pink-200"
            : "bg-yellow-500/10 text-yellow-200"
        }`}>
          {data.level}
        </div>
      )}
      <div className="text-xs text-white font-medium text-center">{data.description}</div>
      {data.editable && (
        <button
          onClick={e => { e.stopPropagation(); startEdit(); }}
          className="absolute top-1 right-1 bg-transparent hover:bg-pink-600/10 p-1 rounded"
          title="Edit"
        >✏️</button>
      )}
      <Handle type="target" position={Position.Left} style={{ background: "#a78bfa", width: 10, height: 10 }} />
      <Handle type="source" position={Position.Right} style={{ background: "#f472b6", width: 10, height: 10 }} />
    </div>
  );
};

const nodeTypes = { roadmapNode: RoadmapNode };

// ---- Main Roadmap Graph ----
type RoadmapGraphProps = {
  nodes: Array<{
    id: string;
    label: string;
    icon: string;
    description: string;
    level?: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
  }>;
};

export default function RoadmapGraph({ nodes, edges }: RoadmapGraphProps) {
  // Build initial nodes/edges for ReactFlow
  const aiNodes: Node<RoadmapNodeData>[] = nodes.map((n, i) => ({
    id: n.id,
    type: "roadmapNode",
    data: {
      label: n.label,
      icon: n.icon,
      description: n.description,
      level: n.level,
      editable: false,
    },
    position: { x: 90 + 170 * i, y: 90 + ((i % 3) * 80) },
    draggable: true,
  }));

  const aiEdges: Edge[] = edges.map((e, idx) => ({
    id: `${e.source}-${e.target}-${idx}`,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: "#a78bfa", strokeWidth: 2.5 }
  }));

  const initialNodesRef = useRef(aiNodes);
  const initialEdgesRef = useRef(aiEdges);

  // Editable state
  const [rfNodes, setNodes, onNodesChange] = useNodesState(initialNodesRef.current);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(initialEdgesRef.current);
  const [selected, setSelected] = useState<{ nodeId?: string; edgeId?: string }>({});

  // Add custom editable node
  const handleAddNode = () => {
    const id = (Math.random() * 1e8).toFixed(0);
    setNodes(nds => [
      ...nds,
      {
        id,
        type: "roadmapNode",
        data: {
          label: "Custom Step",
          icon: "✨",
          description: "Describe your step",
          level: "custom",
          editable: true,
          onUpdate: (newData) => {
            setNodes(current =>
              current.map(n =>
                n.id === id
                  ? { ...n, data: { ...n.data, ...newData, editable: true, onUpdate: n.data.onUpdate } }
                  : n
              )
            );
          }
        },
        position: { x: 120, y: 120 + nds.length * 60 },
        draggable: true,
      }
    ]);
  };

  // Delete selected node or edge
  const handleDelete = () => {
    if (selected.nodeId) {
      setNodes(nds => nds.filter(n => n.id !== selected.nodeId));
      setEdges(eds => eds.filter(e => e.source !== selected.nodeId && e.target !== selected.nodeId));
      setSelected({});
    } else if (selected.edgeId) {
      setEdges(eds => eds.filter(e => e.id !== selected.edgeId));
      setSelected({});
    }
  };

  // Reset roadmap to original AI version
  const handleReset = () => {
    setNodes(initialNodesRef.current);
    setEdges(initialEdgesRef.current);
    setSelected({});
  };

  // Select node/edge on click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => setSelected({ nodeId: node.id }), []);
  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => setSelected({ edgeId: edge.id }), []);

  // Add edges by dragging
  const onConnect = useCallback(
    (connection: Edge | Connection) =>
      setEdges(eds =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#a78bfa", strokeWidth: 2.5 },
          },
          eds
        )
      ),
    [setEdges]
  );

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: 430, position: "relative" }}>
        {/* Toolbar */}
        <div className="absolute left-2 top-2 z-10 flex gap-2">
          <button
            onClick={handleAddNode}
            className="backdrop-blur-md bg-white/10 border border-purple-400/30 hover:bg-purple-500/10 text-purple-200 font-semibold px-4 py-1.5 rounded-xl transition-all shadow-sm"
          >
            + Step
          </button>
          <button
            onClick={handleDelete}
            disabled={!selected.nodeId && !selected.edgeId}
            className={`font-semibold px-4 py-1.5 rounded-xl shadow-sm transition-all border
              ${selected.nodeId || selected.edgeId
                ? "backdrop-blur-md bg-white/10 border-pink-400/30 text-pink-200 hover:bg-pink-500/10"
                : "backdrop-blur-md bg-white/10 border-gray-400/20 text-gray-500 cursor-not-allowed"}
            `}
          >
            Delete
          </button>
          <button
            onClick={handleReset}
            className="backdrop-blur-md bg-white/10 border border-pink-400/30 hover:bg-pink-500/10 text-pink-200 font-semibold px-4 py-1.5 rounded-xl transition-all shadow-sm"
          >
            Reset
          </button>
        </div>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          panOnScroll
          attributionPosition="bottom-right"
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          selectionOnDrag
          style={{
            background: "linear-gradient(135deg, #181026 60%, #312e81 100%)"
          }}
        >
          {/* No MiniMap */}
          <Controls showInteractive={true} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
