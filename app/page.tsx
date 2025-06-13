"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Zap, Users, Shield, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"

export default function LandingPage() {
  const { isAuthenticated, isLoaded } = useAuth()

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "Lightning Fast",
      description:
        "Create boards, columns, and cards in seconds. Drag and drop to organize your workflow effortlessly.",
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Team Collaboration",
      description: "Assign tasks, set due dates, and track progress with your team in real-time.",
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Secure & Reliable",
      description: "Your data is safe with enterprise-grade security and reliable cloud infrastructure.",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-orange-600" />,
      title: "Beautiful Interface",
      description: "Enjoy a modern, intuitive design that makes project management a pleasure.",
    },
  ]

  const benefits = [
    "Unlimited boards and cards",
    "Drag & drop functionality",
    "Custom tags with colors",
    "Due date tracking",
    "User assignments",
    "Dark mode support",
    "Secure local authentication",
    "Data export & import",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image src="/logo.png" alt="BoardStack" width={64} height={64} className="rounded-xl shadow-lg" />
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BoardStack
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isLoaded && isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="hidden sm:inline-flex">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <Image src="/logo.png" alt="BoardStack" width={120} height={120} className="rounded-2xl shadow-2xl" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Organize Your Projects with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BoardStack
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            The modern kanban board that makes project management simple, beautiful, and efficient. Create boards,
            organize tasks, and collaborate with your team like never before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {isLoaded && isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
                >
                  Go to Your Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
                  >
                    Start Building Boards
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Feature Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
            <Card className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">To Do</h3>
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-slate-600 rounded p-3 shadow-sm">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">Design new feature</div>
                        <div className="flex gap-1 mt-2">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                            Design
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">In Progress</h3>
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-slate-600 rounded p-3 shadow-sm">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">Build landing page</div>
                        <div className="flex gap-1 mt-2">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">
                            Development
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Done</h3>
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-slate-600 rounded p-3 shadow-sm">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">Setup project</div>
                        <div className="flex gap-1 mt-2">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                            Setup
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Why Choose BoardStack?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Built for modern teams who demand efficiency, beauty, and simplicity in their project management tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 dark:bg-slate-800/80 backdrop-blur"
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Everything you need to stay organized
            </h3>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
            <Card className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Image src="/logo.png" alt="BoardStack" width={200} height={200} className="rounded-3xl shadow-xl" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to transform your workflow?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of teams who have revolutionized their project management with BoardStack.
            </p>
            {isLoaded && isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Image src="/logo.png" alt="BoardStack" width={48} height={48} className="rounded-lg" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BoardStack
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">© 2025 BoardStack. Built with ❤️ for productive teams.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
