"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Header() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/tcbb.jpg" alt="TCBB Logo" width={40} height={40} className="rounded-md" />
            <span className="text-xl font-bold text-gray-900 hidden sm:inline">TCBB Fantasy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/tournament" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Chaveamento
            </Link>

            <Link href="/predictions" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Palpites
            </Link>
            <Link href="/ranking" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Ranking
            </Link>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(session?.user as any)?.role === "ADMIN" && (
              <Link href="/admin" className="text-gray-700 hover:text-emerald-600 transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : session ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-sm text-gray-600">
                  Olá, {session.user?.name || session.user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Cadastrar</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/dashboard" 
                className="text-gray-700 hover:text-emerald-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/tournament" 
                className="text-gray-700 hover:text-emerald-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Chaveamento
              </Link>

              <Link 
                href="/predictions" 
                className="text-gray-700 hover:text-emerald-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Palpites
              </Link>
              <Link 
                href="/ranking" 
                className="text-gray-700 hover:text-emerald-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Ranking
              </Link>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(session?.user as any)?.role === "ADMIN" && (
                <Link 
                  href="/admin" 
                  className="text-gray-700 hover:text-emerald-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}