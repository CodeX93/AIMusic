"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface AnimatedTabsProps {
  tabs: {
    value: string
    label: string
    content: React.ReactNode
  }[]
  defaultValue?: string
  className?: string
}

export function AnimatedTabs({ tabs, defaultValue, className = "" }: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value)

  return (
    <Tabs defaultValue={defaultValue || tabs[0]?.value} className={className} onValueChange={setActiveTab}>
      <TabsList className="relative">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="relative z-10">
            {tab.label}
          </TabsTrigger>
        ))}

        {/* Animated background for active tab */}
        {tabs.map(
          (tab) =>
            tab.value === activeTab && (
              <motion.div
                key={`bg-${tab.value}`}
                layoutId="activeTabBackground"
                className="absolute inset-0 z-0 bg-cyan-900/20 rounded-md"
                initial={false}
                transition={{ type: "spring", duration: 0.5 }}
              />
            ),
        )}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {tab.content}
          </motion.div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
