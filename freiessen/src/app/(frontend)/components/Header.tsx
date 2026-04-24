'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type PayloadUser = {
  id?: string
  email?: string
  name?: string
  role?: string
  roles?: string[]
  isAdmin?: boolean
}

type PayloadMe = { user?: PayloadUser } | PayloadUser | null

function unwrapUser(me: PayloadMe): PayloadUser | null {
  return (me as any)?.user ?? (me as any) ?? null
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [me, setMe] = useState<PayloadMe>(null)
  const [loadingMe, setLoadingMe] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  async function loadMe() {
    setLoadingMe(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })

      if (!res.ok) {
        setMe(null)
        return
      }

      setMe((await res.json()) as PayloadMe)
    } catch {
      setMe(null)
    } finally {
      setLoadingMe(false)
    }
  }

  useEffect(() => {
    loadMe()
  }, [pathname])

  const user = unwrapUser(me)
  const label = user?.name || user?.email || user?.id

  const isAdmin = useMemo(() => {
    if (!user) return false
    if (user.isAdmin === true) return true
    if (typeof user.role === 'string' && user.role.toLowerCase() === 'admin') return true
    if (Array.isArray(user.roles) && user.roles.some((r) => (r || '').toLowerCase() === 'admin')) return true
    return false
  }, [user])

  async function handleSignOut() {
    try {
      setSigningOut(true)
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      setMe(null)
      router.replace('/login')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <header className="bg-viega-black text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <img src="/favicon.svg" alt="Viega Logo" className="h-8 w-8" />
        <span className="text-lg font-bold tracking-wide">Viega Dashboard</span>
      </div>

      <nav className="flex gap-6 text-sm font-medium items-center">
        <Link href="/" className="hover:text-viega-red transition-colors">
          Home
        </Link>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="hover:text-viega-red transition-colors"
        >
          Dashboard
         </button>

        <div className="ml-4 pl-4 border-l border-white/20 flex items-center gap-3">
          {loadingMe ? (
            <span className="text-xs opacity-75">Loading…</span>
          ) : user ? (
            <>
              <span className="text-xs opacity-90">Signed in as {label}</span>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs px-3 py-1 rounded bg-viega-red/90 hover:bg-viega-red transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </>
          ) : (
            <Link href="/login" className="text-xs hover:text-viega-red transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
