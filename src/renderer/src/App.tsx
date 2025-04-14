"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"
import { motion } from "framer-motion"
import AuraLogo from "./components/aura-logo"

export default function AuraApp () {
  const [lastNotification, setLastNotification] = useState<string | null>(null)

  useEffect(() => {
    // Escuchar actualizaciones de frases desde el backend
    window.electron.ipcRenderer.on('phrase-update', (_, phrase) => {
      setLastNotification(phrase);
    });
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <h1 className="text-[15vw] text-center font-bold text-gray-700 select-none">WHY NOT YOU?</h1>
      </div>

      {/* Main app container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Content */}
        <div className="p-6 text-gray-300">
          <div className="flex items-center gap-3 mb-4">
            <AuraLogo className="w-10 h-10" />
            <h2 className="text-white font-semibold text-2xl">Aura</h2>
          </div>

          <h3 className="text-2xl font-bold text-white mb-4">Reminder Notifications</h3>
          <p className="mb-6">Aura helps you stay motivated and mindful throughout your day with timely reminders.</p>

          {/* Enhanced tutorial animation - Only centered notification */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex items-start gap-3 mb-4">
              <Info size={20} className="text-red-500 mt-1 flex-shrink-0" />
              <p className="text-sm">
                <span className="font-semibold text-white">How to use:</span> Minimize Aura and it will run in the
                background, sending you motivational notifications periodically.
              </p>
            </div>

            <div className="relative h-28 bg-gray-900 rounded-md overflow-hidden flex items-center justify-center">
              {/* Centered notification popup animation */}
              <motion.div
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.8, 1, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1,
                  times: [0, 0.2, 0.8, 1],
                }}
                className="bg-gray-800 p-3 rounded-md border border-gray-700 max-w-[220px]"
              >
                <div className="flex items-start gap-2">
                  <AuraLogo className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-white block mb-0.5">Aura</span>
                    <span className="text-[10px] text-gray-300">Your future depends on what you do today, not tomorrow.</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Last reminder */}
          <div>
            <h4 className="font-medium text-white mb-3">Last Reminder</h4>
            {lastNotification ? (
              <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
                <p className="text-sm">{lastNotification}</p>
              </div>
            ) : (
              <div className="bg-gray-800 p-4 rounded-md border border-gray-700 text-center text-sm text-gray-500">
                No reminders yet. Minimize Aura to start receiving notifications.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 text-center text-sm text-gray-500">
          Aura - Mindful reminders for your daily journey
        </div>
      </motion.div>
    </div>
  )
}
