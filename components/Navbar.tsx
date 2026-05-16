"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import ThemeToggle from "@/components/ThemeToggle"

type Props = {
  userName?: string | null
  userImage?: string | null
  isAdmin?: boolean
  favoritesCount?: number
}

export default function Navbar({ userName, userImage, isAdmin, favoritesCount }: Props) {
  const pathname = usePathname()

  return (
    <header className="bg-blue-800 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/logo.png"
            alt="ANSUT"
            width={36}
            height={36}
            className="rounded-xl bg-white p-0.5"
          />
          <span className="font-bold hidden sm:block tracking-wide">ANSUT</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 flex-1 justify-center sm:justify-start sm:ml-4">
          <NavLink href="/" active={pathname === "/"}>
            Annuaire
          </NavLink>
          <NavLink href="/organigramme" active={pathname === "/organigramme"}>
            Organigramme
          </NavLink>
          <NavLink href="/sites" active={pathname === "/sites"}>
            Sites
          </NavLink>
          {isAdmin && (
            <NavLink href="/admin" active={pathname === "/admin"} admin>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {favoritesCount !== undefined && favoritesCount > 0 && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-blue-200">
              ⭐ {favoritesCount}
            </span>
          )}
          <ThemeToggle />
          <Link href="/compte" title="Mon compte" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {userImage ? (
              <img src={userImage} alt="" className="w-7 h-7 rounded-full object-cover border border-blue-600" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold border border-blue-500">
                {userName?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <span className="text-xs text-blue-100 hidden md:block max-w-[120px] truncate">{userName}</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-blue-300 hover:text-white transition-colors px-2 py-1 rounded hover:bg-blue-700 whitespace-nowrap"
          >
            Déco
          </button>
        </div>
      </div>
    </header>
  )
}

function NavLink({
  href,
  active,
  admin,
  children,
}: {
  href: string
  active: boolean
  admin?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? "bg-white text-blue-800"
          : admin
          ? "text-yellow-300 hover:bg-blue-700"
          : "text-blue-100 hover:bg-blue-700"
      }`}
    >
      {children}
    </Link>
  )
}
