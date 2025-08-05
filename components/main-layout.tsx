"use client"

import { motion } from "framer-motion"
import { useSidebarStore } from "@/store/sidebar-store"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { width, isOpen } = useSidebarStore()
  
  return (
    <motion.div
      animate={{ 
        paddingRight: isOpen ? width : 0
      }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
    >
      {children}
    </motion.div>
  )
}
