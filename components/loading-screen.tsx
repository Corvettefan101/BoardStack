"use client"

import Image from "next/image"

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="BoardStack"
            width={120}
            height={120}
            className="rounded-2xl shadow-2xl mx-auto animate-pulse"
          />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          BoardStack
        </h1>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading your boards...</p>
      </div>
    </div>
  )
}
