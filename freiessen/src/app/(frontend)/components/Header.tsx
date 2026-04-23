export default function Header() {
  return (
    <header className="bg-viega-black text-white px-6 py-4 flex items-center justify-between shadow-md">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3">
        <img src="favicon.svg" alt="Viega Logo" className="h-8 w-8" />
        <span className="text-lg font-bold tracking-wide">Viega Dashboard</span>
      </div>

      {/* Nav links */}
      <nav className="flex gap-6 text-sm font-medium">
        <a href="/" className="hover:text-viega-red transition-colors">
          Home
        </a>
        <a href="/dashboard" className="hover:text-viega-red transition-colors">
          Dashboard
        </a>
      </nav>
    </header>
  )
}
