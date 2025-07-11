"use client"

import type React from "react"
import { Button } from "../../components/ui/button"
import { useAuth } from "../contexts/AuthContext"

export const LandingHeader: React.FC = () => {
  const { login, isLoading } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Felix</h1>
            <span className="ml-2 text-sm text-gray-500">BLUD App</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contact
            </a>
          </nav>

          <Button onClick={login} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? "Connecting..." : "Get Started"}
          </Button>
        </div>
      </div>
    </header>
  )
}