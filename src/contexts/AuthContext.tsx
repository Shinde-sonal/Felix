"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import Cookies from "js-cookie"
import type { User, UserRole } from "../types/auth"
import keycloakService from "../keycloak/keycloakService"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Changed to false initially

  // Remove the useEffect that auto-initializes Keycloak

  const login = async () => {
    setIsLoading(true)
    try {
      const keycloak = await keycloakService.initKeycloak("FLEXIS-DEV")

      if (keycloak && keycloak.token) {
        const userData: User = {
          name: Cookies.get("username") || "",
          email: Cookies.get("email") || "",
          username: Cookies.get("username") || "",
          role: Cookies.get("role") || "",
          groups: keycloak.tokenParsed?.groups || [],
        }

        setUser(userData)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Auth initialization failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    keycloakService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
