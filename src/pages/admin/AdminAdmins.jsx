import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, ShieldAlert, UserMinus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adminApi } from '@/api/endpoints'
import useAuthStore from '@/store/auth'

export default function AdminAdmins() {
  const { user } = useAuthStore()
  const [admins, setAdmins] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  const loadAdmins = () => {
    adminApi.admins().then((res) => {
      setAdmins(res.data)
      setLoading(false)
    })
  }

  useEffect(loadAdmins, [])

  if (user?.role !== 'super_admin') {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-destructive">Samo super admin ima pristup.</div>
  }

  const handleSetRole = async (userId, role) => {
    if (!confirm(role === 'user' ? 'Ukloniti admin prava?' : `Postaviti kao ${role}?`)) return
    await adminApi.setRole(userId, { role })
    loadAdmins()
  }

  const searchUsers = () => {
    if (!search.trim()) return
    adminApi.users({ search }).then((res) => setAllUsers(res.data.data))
  }

  const promoteToAdmin = async (userId) => {
    await adminApi.setRole(userId, { role: 'admin' })
    loadAdmins()
    setAddOpen(false)
    setSearch('')
    setAllUsers([])
  }

  const roleLabel = (role) => {
    switch (role) {
      case 'super_admin': return { text: 'Super Admin', cls: 'bg-purple-100 text-purple-700' }
      case 'admin': return { text: 'Admin', cls: 'bg-blue-100 text-blue-700' }
      default: return { text: 'Korisnik', cls: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Administratori</h1>
        <div className="flex gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Shield className="h-4 w-4 mr-1" /> Dodaj admina</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj administratora</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Pretraži po imenu ili emailu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                  />
                  <Button onClick={searchUsers}>Traži</Button>
                </div>
                {allUsers.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allUsers.filter((u) => u.role === 'user').map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 border border-border rounded">
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <Button size="sm" onClick={() => promoteToAdmin(u.id)}>
                          Postavi kao admin
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Link to="/admin" className="text-sm text-primary hover:underline self-center">&larr; Dashboard</Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
      ) : (
        <div className="space-y-3">
          {admins.map((admin) => {
            const role = roleLabel(admin.role)
            return (
              <div key={admin.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {admin.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{admin.name}</p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    <p className="text-xs text-muted-foreground">{admin.listings_count} oglasa</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${role.cls}`}>
                    {role.text}
                  </span>
                  {admin.role === 'admin' && admin.id !== user.id && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetRole(admin.id, 'super_admin')}
                        title="Unapredi u Super Admin"
                      >
                        <ShieldAlert className="h-4 w-4 text-purple-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetRole(admin.id, 'user')}
                        title="Ukloni admin prava"
                      >
                        <UserMinus className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                  {admin.role === 'super_admin' && admin.id !== user.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetRole(admin.id, 'admin')}
                      title="Spusti na Admin"
                    >
                      <UserMinus className="h-4 w-4 text-amber-600" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
