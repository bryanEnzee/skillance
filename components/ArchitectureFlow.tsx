"use client"

import React, { useState, useCallback, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Handle,
  Position,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

// Custom Node Components
const CustomNode = ({ data }: { data: any }) => {
  return (
    <>
      {/* Invisible handles required for edge rendering */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      
      <motion.div
        className={`px-3 py-2 shadow-lg rounded-lg border backdrop-blur-sm ${data.className} min-w-[120px] relative`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          {/* Logo/Image space on the left */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
            {data.logo ? (
              <img 
                src={data.logo} 
                alt="" 
                className="w-6 h-6 object-cover rounded-full" 
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-white/40"></div>
            )}
          </div>
          
          {/* Text content on the right */}
          <div className="flex-1 text-left">
            <div className={`font-medium text-xs ${data.titleColor}`}>{data.title}</div>
            {data.subtitle && (
              <div className={`text-xs ${data.titleColor} opacity-90`}>{data.subtitle}</div>
            )}
            {data.description && (
              <div className={`text-xs ${data.titleColor} opacity-75 mt-1`}>{data.description}</div>
            )}
            {data.badge && (
              <div className="mt-1">
                <span className={`text-xs px-2 py-0.5 rounded ${data.badgeClass}`}>
                  {data.badge}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

const initialNodes: Node[] = [
  // Thirdweb Wallet (Left)
  {
    id: '1',
    type: 'custom',
    position: { x: 50, y: 200 },
    data: {
      title: 'Thirdweb as',
      subtitle: 'Wallet Connection',
      logo: '/thridweb.png',
      titleColor: 'text-white',
      className: 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 border-purple-400',
    },
  },

  // Sapphire (Top Left)
  {
    id: '2',
    type: 'custom',
    position: { x: 300, y: 90 },
    data: {
      title: 'Sapphire Mentorship',
      logo: '/oasis.png',
      description: 'Conversation data storage',
      titleColor: 'text-white',
      className: 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 border-purple-400',
    },
  },

  // On-chain (Top Center)
  {
    id: '3',
    type: 'custom',
    position: { x: 580, y: 10 },
    data: {
      title: 'On-chain',
      titleColor: 'text-white',
      className: 'bg-cyan-400/80 border-cyan-300',
    },
  },

  // Microsoft MAI DS R1 (Center)
  {
    id: '4',
    type: 'custom',
    position: { x: 600, y: 92 },
    data: {
      title: 'Microsoft MAI DS R1',
      logo: '/MAI.png',
      titleColor: 'text-white',
      className: 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 border-blue-400',
    },
  },

  // USDC Micro Payments (Top Right)
  {
    id: '5',
    type: 'custom',
    position: { x: 850, y: 40 },
    data: {
      title: 'USDC as',
      subtitle: 'micro payments',
      description: 'Arbitrum as L2',
      logo: '/usdc.png',
      titleColor: 'text-white',
      className: 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 border-purple-400',
    },
  },

  // Central USDC (Center)
  {
    id: '6',
    type: 'custom',
    position: { x: 400, y: 210 },
    data: {
      title: 'USDC as',
      subtitle: 'micro payments',
      description: 'Arbitrum as L2',
      logo: '/usdc.png',
      titleColor: 'text-white',
      className: 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 border-purple-400',
    },
  },

  // ROFL (Right)
  {
    id: '7',
    type: 'custom',
    position: { x: 850, y: 140 },
    data: {
      title: 'ROFL',
      subtitle: 'AI Conversation',
      description: 'data storage',
      logo: '/oasis.png',
      titleColor: 'text-white',
      className: 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 border-purple-400',
    },
  },

  // Off-chain (Far Right)
  {
    id: '8',
    type: 'custom',
    position: { x: 1080, y: 140 },
    data: {
      title: 'Off-chain',
      titleColor: 'text-white',
      className: 'bg-cyan-400/80 border-cyan-300',
    },
  },

  // ETH Job Posting (Bottom Left)
  {
    id: '9',
    type: 'custom',
    position: { x: 180, y: 320 },
    data: {
      title: 'ETH to',
      subtitle: 'Stake to post job',
      description: 'and posting fee Arbitrum as L2',
      logo: '/eth.png',
      titleColor: 'text-white',
      className: 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 border-blue-400',
    },
  },

  // Subgraph (Bottom Center)
  {
    id: '10',
    type: 'custom',
    position: { x: 500, y: 330 },
    data: {
      title: 'Subgraph',
      subtitle: 'Store Employer asset',
      logo: '/thegraph.png',
      titleColor: 'text-white',
      className: 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 border-purple-400',
    },
  },

  // ETH Job Application (Bottom Right)
  {
    id: '11',
    type: 'custom',
    position: { x: 750, y: 320 },
    data: {
      title: 'ETH to stake,',
      subtitle: 'apply job and',
      description: 'claim paycheck',
      logo: '/eth.png',
      titleColor: 'text-white',
      className: 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 border-blue-400',
    },
  },
]

const initialEdges: Edge[] = [
  // Thirdweb to Sapphire
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // Sapphire to On-chain
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // Sapphire to Microsoft MAI DS R1
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4', 
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // Microsoft MAI DS R1 to USDC (top)
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5', 
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // Microsoft MAI DS R1 to ROFL
  { 
    id: 'e4-7', 
    source: '4', 
    target: '7', 
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // ROFL to Off-chain
  { 
    id: 'e7-8', 
    source: '7', 
    target: '8', 
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // Sapphire to Central USDC
  { 
    id: 'e2-6', 
    source: '2', 
    target: '6', 
    sourceHandle: 'bottom',
    targetHandle: 'top',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // Thirdweb to ETH Job Posting
  { 
    id: 'e1-9', 
    source: '1', 
    target: '9', 
    sourceHandle: 'bottom',
    targetHandle: 'left',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // ETH Job Posting to Subgraph
  { 
    id: 'e9-10', 
    source: '9', 
    target: '10', 
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // Subgraph to ETH Job Application
  { 
    id: 'e10-11', 
    source: '10', 
    target: '11', 
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // ETH to stake back to Subgraph (additional connection)
  { 
    id: 'e11-10', 
    source: '11', 
    target: '10', 
    sourceHandle: 'left',
    targetHandle: 'right',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },

  // Central USDC to Subgraph
  { 
    id: 'e6-10', 
    source: '6', 
    target: '10', 
    sourceHandle: 'bottom',
    targetHandle: 'top',
    animated: true, 
    style: { stroke: '#ffffff', strokeWidth: 2, strokeDasharray: '5,5', filter: 'drop-shadow(0 0 6px #ffffff)' },
    type: 'step'
  },
]

// Zoom Control Component
const ZoomControls = () => {
  const { zoomIn, zoomOut } = useReactFlow()
  
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
      <motion.button
        onClick={() => zoomIn()}
        className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center backdrop-blur-xl transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-5 h-5 text-white" />
      </motion.button>
      <motion.button
        onClick={() => zoomOut()}
        className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center backdrop-blur-xl transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Minus className="w-5 h-5 text-white" />
      </motion.button>
    </div>
  )
}

export default function ArchitectureFlow() {
  return (
    <div className="w-full h-[500px] bg-black/20 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden relative">
      <style jsx global>{`
        .react-flow__attribution {
          display: none;
        }
        .react-flow__handle {
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .react-flow__edge-path {
          stroke: #ffffff !important;
          stroke-width: 2px !important;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) !important;
        }
        .react-flow__edge.animated .react-flow__edge-path {
          stroke-dasharray: 5 !important;
          animation: dashdraw 2s linear infinite !important;
        }
        .react-flow__connectionline {
          stroke: #ffffff !important;
          stroke-width: 2px !important;
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8)) !important;
        }
        @keyframes dashdraw {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
        minZoom={0.3}
        maxZoom={3}
        preventScrolling={false}
        style={{ 
          background: 'transparent',
        }}
      >
        <Background 
          color="#ffffff"
          gap={20}
          size={1}
          style={{ opacity: 0.05 }}
        />
        <ZoomControls />
      </ReactFlow>
    </div>
  )
}
