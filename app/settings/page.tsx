"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, Download, Trash2, FileText, Key } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"
import { useUserBoards } from "@/hooks/use-user-boards"
import { LoadingScreen } from "@/components/loading-screen"
import { ProtectedRoute } from "@/components/protected-route"

export default function SettingsPage() {
  const [isClient, setIsClient] = useState(false)
  const { currentUser, updateProfile, changePassword, deleteAccount, isLoaded: authLoaded } = useAuthStore()
  const { clearUserData, exportUserData, importUserData, isLoaded: boardLoaded } = useUserBoards()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name)
      setEmail(currentUser.email)
      setAvatar(currentUser.avatar || "")
    }
  }, [currentUser])

  if (!isClient || !authLoaded || !boardLoaded) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return <LoadingScreen />
  }

  const handleSaveProfile = () => {
    updateProfile({ name, email, avatar: avatar || undefined })
    setMessage("Profile updated successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChangePassword = () => {
    setError("")
    setMessage("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long")
      return
    }

    const success = changePassword(currentPassword, newPassword)
    if (success) {
      setMessage("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setError("Current password is incorrect")
    }

    setTimeout(() => {
      setMessage("")
      setError("")
    }, 3000)
  }

  const handleExportData = () => {
    const data = exportUserData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `boardstack-backup-${currentUser.name}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string
        const success = importUserData(data)
        if (success) {
          setMessage("Data imported successfully!")
          setTimeout(() => window.location.reload(), 1000)
        } else {
          setError("Failed to import data. Please check the file format.")
        }
        setTimeout(() => {
          setMessage("")
          setError("")
        }, 3000)
      }
      reader.readAsText(file)
    }
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all your board data? This action cannot be undone.")) {
      clearUserData()
      setMessage("All board data has been cleared!")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.",
      )
    ) {
      deleteAccount()
      window.location.href = "/"
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex items-center mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="mr-4">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>

          {message && (
            <Alert className="mb-6">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </span>
                      </Button>
                    </Label>
                    <Input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button onClick={handleSaveProfile} className="w-full">
                  Save Profile Changes
                </Button>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button onClick={handleChangePassword} className="w-full">
                  Change Password
                </Button>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Your data is automatically saved to your browser's local storage. Use these options to backup,
                  restore, or reset your data.
                </div>

                <div className="space-y-3">
                  <Button onClick={handleExportData} variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data (Backup)
                  </Button>

                  <div>
                    <Label htmlFor="import" className="cursor-pointer">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Import Data (Restore)
                        </span>
                      </Button>
                    </Label>
                    <Input id="import" type="file" accept=".json" className="hidden" onChange={handleImportData} />
                  </div>

                  <Button
                    onClick={handleClearData}
                    variant="outline"
                    className="w-full justify-start text-orange-600 hover:text-orange-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Board Data
                  </Button>
                </div>

                <Separator />

                <Button onClick={handleDeleteAccount} variant="destructive" className="w-full justify-start">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FileText className="w-4 h-4 inline mr-1" />
                  <strong>Note:</strong> Data is stored locally in your browser. Each user account has separate, secure
                  data storage.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
