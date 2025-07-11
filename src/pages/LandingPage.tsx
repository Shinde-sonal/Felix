"use client"

import type React from "react"
import { Button } from "../../components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { LandingHeader } from "../components/LandingHeader"
import { useAuth } from "../contexts/AuthContext"
import { ArrowRight, Shield, Zap, Globe, CheckCircle } from "lucide-react"

export const LandingPage: React.FC = () => {
  const { login, isLoading } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">Felix</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your comprehensive platform for blockchain asset management, ticket handling, and seamless trading
              operations. Built for simplicity and powered by Stellar.
            </p>
            <Button
              onClick={login}
              size="lg"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              {isLoading ? "Connecting..." : "Get Started"}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
            <p className="text-sm text-gray-500 mt-4">Secure authentication powered by Keycloak</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need in one platform</h2>
            <p className="text-lg text-gray-600">Streamlined tools for modern blockchain operations</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>
                  Enterprise-grade security with Keycloak integration and role-based access control
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>BLUD Token Management</CardTitle>
                <CardDescription>
                  Issue and manage BLUD tokens on the Stellar blockchain with intuitive controls
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Trading Operations</CardTitle>
                <CardDescription>
                  Buy and sell services with integrated ticket management and user administration
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Felix?</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Role-Based Access</h3>
                    <p className="text-gray-600">Different interfaces for admins, desk managers, and regular users</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Stellar Integration</h3>
                    <p className="text-gray-600">Native blockchain operations with BLUD token support</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Comprehensive Support</h3>
                    <p className="text-gray-600">Built-in ticket system and user management tools</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Marketplace Ready</h3>
                    <p className="text-gray-600">Buy and sell services with integrated payment processing</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-blue-100 mb-6">
                Join thousands of users who trust Felix for their blockchain operations.
              </p>
              <Button
                onClick={login}
                size="lg"
                disabled={isLoading}
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                {isLoading ? "Connecting..." : "Start Your Journey"}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Felix</h3>
              <p className="text-gray-400">Empowering blockchain operations with simplicity and security.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Security</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Felix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
