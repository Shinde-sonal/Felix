"use client"

import type React from "react"
import { Alert, AlertDescription } from "./alert"
import { Button } from "./button"
import { AlertCircle, X } from "lucide-react"

interface ErrorAlertProps {
  error: string | null
  onClose: () => void
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClose }) => {
  if (!error) return null

  return (
    <Alert className="border-red-200 bg-red-50 mb-6">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800 flex justify-between items-center">
        <span>{error}</span>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-red-600 hover:text-red-800">
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
