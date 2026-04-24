'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Unable to sign in. Please try again.')
      }

      await router.replace('/')
      return
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-viega-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="rounded-3xl border border-gray-200 bg-white/95 p-10 shadow-xl shadow-black/5">
          <div className="flex flex-col items-center gap-3 text-center">
            <img src="/favicon.svg" alt="Viega Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-semibold text-viega-black">Sign in to Viega</h1>
              <p className="mt-2 text-sm text-viega-gray">Access your dashboard and admin tools.</p>
            </div>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-viega-black">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-viega-black outline-none transition focus:border-viega-red focus:ring-2 focus:ring-viega-red/20"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block text-sm font-medium text-viega-black">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-viega-black outline-none transition focus:border-viega-red focus:ring-2 focus:ring-viega-red/20"
                  placeholder="Enter your password"
                />
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-viega-red px-4 py-3 text-sm font-semibold text-white transition hover:bg-viega-red-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
