"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, ChevronLeft, ChevronRight, GripVertical, Plus, Clock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from './ai-sidebar.module.css';
import { useSidebarStore } from "@/store/sidebar-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import { ethers } from "ethers";
import dynamic from "next/dynamic";

// Dynamically import RoadmapGraph to avoid SSR issues
const RoadmapGraph = dynamic(() => import("@/components/RoadmapGraph"), { ssr: false });

const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
const RECEIVER_ADDRESS = "0x29E5D2d96Ee66C35c16075558A2A66a529Ef284F";
const USDC_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)"
];
const PAYMENT_AMOUNT = "0.005";
const FREE_CHAT_LIMIT = 5;

const VERSIONS = [
  { id: "1", name: "Session 1", date: "2024-07-01" },
  { id: "2", name: "Session 2", date: "2024-07-10" },
  { id: "3", name: "Session 3", date: "2024-07-17" }
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AISidebar() {
  const { width, isOpen, setIsOpen, setWidth } = useSidebarStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. How can I help you learn about Web3 and blockchain development?",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Payment & paywall logic
  const [paidChats, setPaidChats] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  // Version dropdown
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const isResizing = useRef(false);

  // WALLET ADDRESS STATE
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Roadmap Modal state
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);

  // Detect wallet on load
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts[0]) setWalletAddress(accounts[0]);
      });
      // Listen for account change
      (window as any).ethereum.on && (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        setWalletAddress(accounts[0] || null);
      });
    }
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    setWidth(newWidth);
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResizing);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    const messageToSend = newMessage.trim();
    if (!messageToSend) return;

    const userMessages = messages.filter((m) => m.role === "user").length;
    const allowed = userMessages < FREE_CHAT_LIMIT || paidChats >= (userMessages - FREE_CHAT_LIMIT + 1);
    if (!allowed) {
      setPendingMessage(messageToSend);
      setNewMessage("");
      setShowPaywall(true);
      setPayError(null);
      return;
    }

    setNewMessage("");
    setPendingMessage(null);
    displayAndFetchAIResponse(messageToSend);
  };

  // STORE CHATLOG TO FASTAPI
  const storeChatLog = async (user: string, question: string, answer: string) => {
    if (!user) return;
    try {
      await fetch("http://localhost:8000/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, question, answer }),
      });
    } catch (err) {
      console.error("Failed to store chatlog", err);
    }
  };

  // AI RESPONSE HANDLER + STORE LOG
  const displayAndFetchAIResponse = async (userMessage: string, force = false) => {
    const userMessages = messages.filter((m) => m.role === "user").length;
    const allowed = userMessages < FREE_CHAT_LIMIT || paidChats >= (userMessages - FREE_CHAT_LIMIT + 1);
    if (!force && !allowed) {
      console.warn("Blocked due to paywall");
      return;
    }
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          question: userMessage
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        streamedContent += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: streamedContent
          };
          return newMessages;
        });
      }
      // After fully received, store the chatlog
      if (walletAddress && streamedContent.trim()) {
        storeChatLog(walletAddress, userMessage, streamedContent);
      }
    } catch (error) {
      let msg = "Unknown error";
      if (typeof error === "string") msg = error;
      else if (error && typeof error === "object") {
        if ("message" in error) msg = (error as any).message;
        else if ("reason" in error) msg = (error as any).reason;
        else msg = JSON.stringify(error);
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I apologize, but I encountered an error while processing your request. " + msg },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Payment handler
  const handlePay = async () => {
    setIsPaying(true);
    setPayError(null);
    try {
      if (!window.ethereum) throw new Error("No wallet found.");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const decimals = await usdc.decimals();
      const amount = ethers.utils.parseUnits(PAYMENT_AMOUNT, decimals);
      const tx = await usdc.transfer(RECEIVER_ADDRESS, amount);
      await tx.wait();
      setPaidChats((prev) => prev + 1);
      setShowPaywall(false);

      // Only after payment, show/send the message and fetch AI response
      if (pendingMessage) {
        displayAndFetchAIResponse(pendingMessage);
        setPendingMessage(null);
      }
      setPendingMessage(null);
      setPayError(null);
    } catch (err) {
      let msg = "Unknown error";
      if (typeof err === "string") msg = err;
      else if (err && typeof err === "object") {
        if ("message" in err) msg = (err as any).message;
        else if ("reason" in err) msg = (err as any).reason;
        else msg = JSON.stringify(err);
      }
      setPayError("Payment failed: " + msg);
    }
    setIsPaying(false);
  };

  const handleClosePaywall = () => {
    setShowPaywall(false);
    if (pendingMessage) {
      setNewMessage(pendingMessage);
    }
  };

  // VISUAL ROADMAP GENERATOR
  const handleVisualizeRoadmap = async () => {
    setRoadmapModalOpen(true);
    setGraphLoading(true);
    setGraphData(null);
    setGraphError(null);
    try {
      // Use last user message or default to "Web3 Developer"
      let topic = "";
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          topic = messages[i].content;
          break;
        }
      }
      if (!topic) topic = "Web3 Developer";

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generateGraphRoadmap",
          question: topic,
        }),
      });
      const text = await response.text();
      // Try to parse out JSON (in case AI adds extra newlines or junk)
      let jsonStr = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
      let graph = null;
      try {
        graph = JSON.parse(jsonStr);
      } catch {
        setGraphError("Could not parse roadmap from AI.");
        setGraphLoading(false);
        return;
      }
      if (graph?.nodes && graph?.edges) {
        setGraphData(graph);
      } else {
        setGraphError("AI response did not include a roadmap.");
      }
    } catch (err) {
      setGraphError("Failed to generate visual roadmap.");
    }
    setGraphLoading(false);
  };

  function VersionDropdown() {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowVersionDropdown((v) => !v)}
          className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-purple-400/30 hover:border-purple-400 text-purple-400 shadow-none rounded-xl px-4 py-2 flex items-center gap-2 font-medium transition-all min-w-[110px]"
          style={{ boxShadow: "0 2px 12px 0 rgba(150,80,255,0.07)" }}
          aria-label="View Version History"
        >
          <Clock className="w-5 h-5" />
          <span className="whitespace-nowrap">Version</span>
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
        {showVersionDropdown && (
          <div
            className="absolute left-0 mt-2 w-56 bg-white/90 text-gray-900 rounded-xl shadow-lg border border-purple-200 z-50 overflow-hidden"
            style={{ minWidth: "180px" }}
          >
            {VERSIONS.map((ver) => (
              <button
                key={ver.id}
                onClick={() => {
                  setShowVersionDropdown(false);
                  alert(`Switch to version: ${ver.name}`);
                }}
                className="flex flex-col w-full px-4 py-3 text-left hover:bg-purple-100/80 transition"
              >
                <span className="font-medium">{ver.name}</span>
                <span className="text-xs text-gray-500">{ver.date}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-5 min-w-[320px] max-w-[95vw]">
              <Bot className="h-8 w-8 text-purple-400 mb-2" />
              <h2 className="text-xl font-bold text-purple-600 mb-1">Continue the Conversation</h2>
              <p className="text-gray-700 text-center mb-3">
                You've used your free chat limit.<br />
                <span className="font-semibold">Pay $0.005 USDC</span> to send <b>1 more message</b>.<br />
                (Repeat payment for every extra message.)
              </p>
              {pendingMessage && (
                <div className="w-full bg-purple-50 rounded p-2 mb-2 text-gray-700 text-xs border border-purple-100">
                  <b>Your message:</b> <br />
                  {pendingMessage}
                </div>
              )}
              <Button
                onClick={handlePay}
                disabled={isPaying}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2"
              >
                {isPaying ? (
                  <>
                    <span className="animate-spin mr-2 border-2 border-t-2 border-t-white border-blue-200 rounded-full w-5 h-5 inline-block" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Pay with USDC</span>
                    <Send className="h-5 w-5" />
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                className="text-gray-400 text-xs mt-1"
                onClick={handleClosePaywall}
                disabled={isPaying}
              >
                Cancel
              </Button>
              <p className="text-gray-400 text-xs mt-2 text-center">
                Transaction on Arbitrum Sepolia. Your wallet will ask for confirmation.<br />
                <span className="text-purple-400">Receiver: {RECEIVER_ADDRESS.slice(0, 6)}...{RECEIVER_ADDRESS.slice(-4)}</span>
              </p>
              {payError && (
                <div className="text-red-500 text-xs mt-2 text-center">{payError}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roadmap Modal */}
      <AnimatePresence>
  {roadmapModalOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
    >
      <div className="
  relative
  bg-white/15
  rounded-2xl
  border border-purple-300/40
  shadow-2xl
  p-6 md:p-8
  max-w-4xl w-[94vw]
  flex flex-col items-center
  backdrop-blur-[16px]
  before:content-['']
  before:absolute before:inset-0
  before:rounded-2xl
  before:pointer-events-none
  before:bg-gradient-to-br before:from-white/35 before:via-white/10 before:to-purple-200/10
  before:opacity-70
  after:content-['']
  after:absolute after:inset-0
  after:rounded-2xl
  after:pointer-events-none
  after:ring-1 after:ring-white/40
">
        <button
          className="absolute top-3 right-3 text-purple-300 hover:text-pink-400 transition"
          onClick={() => setRoadmapModalOpen(false)}
        >
          <span className="text-2xl">&times;</span>
        </button>
        <h2 className="text-xl font-bold mb-5 text-purple-200 flex items-center gap-2">
          <span role="img" aria-label="roadmap">🗺️</span> Visual Learning Roadmap
        </h2>
        {graphLoading ? (
          <div className="text-center text-purple-400 font-medium">Generating roadmap...</div>
        ) : graphError ? (
          <div className="text-center text-pink-400 font-medium">{graphError}</div>
        ) : graphData ? (
          <RoadmapGraph nodes={graphData.nodes} edges={graphData.edges} />
        ) : null}
      </div>
    </motion.div>
  )}
</AnimatePresence>


      {/* Sidebar Toggle */}
      <motion.button
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white p-2 rounded-l-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        animate={{ x: isOpen ? -useSidebarStore(state => state.width) : 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </motion.button>

      {/* Main Sidebar */}
      <motion.div
        className={`fixed right-0 top-0 h-full z-40 ${styles.aiSidebarBackground} ${styles.aiSidebarShadow}`}
        style={{ width: useSidebarStore(state => state.width) }}
        initial={{ x: useSidebarStore(state => state.width) }}
        animate={{ x: isOpen ? 0 : useSidebarStore(state => state.width) }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <div
          onMouseDown={startResizing}
          className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-50 bg-transparent"
        />
        <div className={styles.aiSidebarDivider} />

        {/* Rectangle Version/New Chat buttons, floating top right */}
        <div className="absolute top-4 right-4 flex flex-row gap-2 z-50">
          <VersionDropdown />
          <Button
            onClick={() => {
              setMessages([
                {
                  role: "assistant",
                  content: "Hi! I'm your AI assistant. How can I help you learn about Web3 and blockchain development?",
                },
              ]);
              setPaidChats(0);
              setNewMessage("");
              setShowPaywall(false);
              setPendingMessage(null);
              setPayError(null);
            }}
            className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-pink-400/30 hover:border-pink-400 text-pink-400 shadow-none rounded-xl px-4 py-2 flex items-center gap-2 font-medium transition-all min-w-[110px]"
            style={{ boxShadow: "0 2px 12px 0 rgba(255,80,180,0.07)" }}
            aria-label="Start New Chat"
          >
            <Plus className="w-5 h-5" />
            <span className="whitespace-nowrap">New Chat</span>
          </Button>
        </div>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center space-x-3 p-4 border-b border-white/10">
            <Bot className="h-6 w-6 text-purple-400" />
            <div>
              <h3 className="text-white font-light text-lg">AI Assistant</h3>
              <p className="text-gray-400 text-sm font-light">Your Web3 Learning Guide</p>
              {/* Show wallet address (for demo/debug) */}
              <p className="text-purple-300 text-xs mt-1">
                {walletAddress ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "No wallet detected"}
              </p>
            </div>
          </div>
          {/* Messages */}
          <div className={`${styles.messageContainer} ${styles.hideScrollbar}`}>
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-xl text-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white"
                        : "bg-white/10 text-gray-200"
                    }`}
                  >
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          h2: ({ children }) => (
                            <h2 className="text-xl font-semibold mt-6 mb-3 text-purple-300 border-b border-purple-500/20 pb-2">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-medium mt-4 mb-2 text-pink-300">{children}</h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-3 leading-relaxed">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-none space-y-2 mb-4">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 mb-4 space-y-2">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="flex items-start space-x-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>{children}</span>
                            </li>
                          ),
                          code: ({ children }) => (
                            <code className="bg-purple-500/10 text-purple-300 rounded px-1.5 py-0.5 font-mono text-sm">{children}</code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-purple-500/50 pl-4 my-4 text-purple-200 italic">{children}</blockquote>
                          ),
                          hr: () => (
                            <hr className="border-t border-purple-500/20 my-4" />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-gray-200 p-3 rounded-xl">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 0.8,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
          {/* Input + Visualize Roadmap Button */}
          <div className="p-4 border-t border-white/10">
            <div className="flex space-x-2">
              <Input
                placeholder={showPaywall
                  ? "Please pay to continue..."
                  : "Ask anything..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/5 border-white/10 text-white placeholder-gray-400 font-light"
                disabled={isTyping || showPaywall}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim() || isTyping || showPaywall}
                  className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
              {/* Visualize Roadmap Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleVisualizeRoadmap}
                  className="bg-purple-600 text-white font-semibold px-3"
                  disabled={graphLoading}
                  title="Generate Visual Roadmap"
                >
                  🗺️
                </Button>
              </motion.div>
            </div>
            <div className="text-xs text-purple-300 mt-1 text-center">
              {messages.filter(m => m.role === "user").length < FREE_CHAT_LIMIT
                ? `Free messages left: ${Math.max(0, FREE_CHAT_LIMIT - messages.filter(m => m.role === "user").length)}`
                : `Pay $0.005 USDC for every extra chat`}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
