import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X, Heart, MessageCircle, Plus, User, LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import useAuthStore from '@/store/auth'

export default function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/pretraga?q=${encodeURIComponent(search.trim())}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top row */}
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 text-xl font-bold text-primary">
            NašiOglasi
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži oglase..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Actions - desktop */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {user.role === 'user' && (
                  <>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to="/favoriti"><Heart className="h-5 w-5" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to="/poruke"><MessageCircle className="h-5 w-5" /></Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/moji-oglasi"><User className="h-4 w-4 mr-1" /> {user.name}</Link>
                    </Button>
                  </>
                )}
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin"><Shield className="h-5 w-5 text-purple-600 mr-1" /> Admin Panel</Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
                {user.role === 'user' && (
                  <Button asChild>
                    <Link to="/novi-oglas"><Plus className="h-4 w-4 mr-1" /> Postavi oglas</Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/prijava">Prijava</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/registracija">Registracija</Link>
                </Button>
                <Button asChild>
                  <Link to="/prijava"><Plus className="h-4 w-4 mr-1" /> Postavi oglas</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden ml-auto">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false) }}>
                    <Input
                      placeholder="Pretraži..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </form>
                  {user ? (
                    <>
                      {(user.role === 'admin' || user.role === 'super_admin') && (
                        <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-purple-600 font-medium">Admin Panel</Link>
                      )}
                      {user.role === 'user' && (
                        <>
                          <Link to="/novi-oglas" onClick={() => setMobileOpen(false)} className="font-medium text-primary">+ Postavi oglas</Link>
                          <Link to="/moji-oglasi" onClick={() => setMobileOpen(false)}>Moji oglasi</Link>
                          <Link to="/favoriti" onClick={() => setMobileOpen(false)}>Favoriti</Link>
                          <Link to="/poruke" onClick={() => setMobileOpen(false)}>Poruke</Link>
                        </>
                      )}
                      <Link to="/profil" onClick={() => setMobileOpen(false)}>Profil</Link>
                      <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="text-left text-destructive">
                        Odjava
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/prijava" onClick={() => setMobileOpen(false)} className="font-medium">Prijava</Link>
                      <Link to="/registracija" onClick={() => setMobileOpen(false)} className="font-medium">Registracija</Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
