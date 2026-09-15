import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Ban, CheckCircle, Shield, Building2, User, Pencil, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { adminApi } from '@/api/endpoints'
import useAuthStore from '@/store/auth'

const roleLabels = {
  super_admin: { text: 'Super Admin', cls: 'bg-purple-100 text-purple-700' },
  admin: { text: 'Admin', cls: 'bg-blue-100 text-blue-700' },
  user: { text: 'Korisnik', cls: '' },
}

export default function AdminUsers() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ search: '', role: '', user_type: '', is_active: '', verified: '', date_from: '', date_to: '' })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)

  const isSuperAdmin = user?.role === 'super_admin'

  const load = () => {
    setLoading(true)
    const params = { page }
    Object.entries(filters).forEach(([k, v]) => { if (v !== '') params[k] = v })
    adminApi.users(params).then((res) => {
      setUsers(res.data.data)
      setTotal(res.data.total)
      setLoading(false)
    })
  }

  useEffect(load, [page])

  const applyFilters = () => { setPage(1); load() }

  if (!user?.role || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-destructive">Nemate pristup.</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Korisnici ({total})</h1>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" /> Novi korisnik</Button>
          )}
          <Link to="/admin" className="text-sm text-primary hover:underline self-center">&larr; Dashboard</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6 p-4 bg-muted rounded-lg">
        <div>
          <Label className="text-xs">Pretraga</Label>
          <Input placeholder="Ime, email, telefon, firma..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
        </div>
        <div>
          <Label className="text-xs">Rola</Label>
          <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">Sve</option>
            <option value="user">Korisnik</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Tip</Label>
          <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={filters.user_type} onChange={(e) => setFilters({ ...filters, user_type: e.target.value })}>
            <option value="">Svi</option>
            <option value="individual">Fizičko lice</option>
            <option value="company">Pravno lice</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={filters.is_active} onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}>
            <option value="">Svi</option>
            <option value="true">Aktivan</option>
            <option value="false">Blokiran</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Verifikovan</Label>
          <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={filters.verified} onChange={(e) => setFilters({ ...filters, verified: e.target.value })}>
            <option value="">Svi</option>
            <option value="yes">Da</option>
            <option value="no">Ne</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button onClick={applyFilters} className="w-full">Filtriraj</Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Korisnik</th>
                <th className="text-left p-3">Tip</th>
                <th className="text-left p-3">Kontakt</th>
                <th className="text-left p-3">Grad</th>
                <th className="text-left p-3">Oglasi</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Registracija</th>
                <th className="text-right p-3">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const rl = roleLabels[u.role] || roleLabels.user
                return (
                  <tr key={u.id} className="border-t border-border hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {u.user_type === 'company' ? <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" /> : <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                        <div>
                          <p className="font-medium">{u.name}</p>
                          {u.company_name && <p className="text-xs text-blue-600">{u.company_name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">
                        {u.user_type === 'company' ? 'Pravno' : 'Fizičko'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.phone}</p>
                    </td>
                    <td className="p-3 text-sm">{u.city || '—'}</td>
                    <td className="p-3">{u.listings_count}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <Badge className={`text-xs ${u.is_active ? '' : 'bg-destructive text-white'}`}>
                          {u.is_active ? 'Aktivan' : 'Blokiran'}
                        </Badge>
                        {u.role !== 'user' && <span className={`text-xs px-2 py-0.5 rounded-full ${rl.cls}`}>{rl.text}</span>}
                        {u.is_premium && <Badge className="bg-amber-500 text-white text-xs">Premium</Badge>}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString('sr-RS')}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        {isSuperAdmin && (
                          <Button variant="ghost" size="sm" onClick={() => setEditUser(u)} title="Izmeni">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={async () => { await adminApi.updateUser(u.id, { is_active: !u.is_active }); load() }} title={u.is_active ? 'Blokiraj' : 'Aktiviraj'}>
                          {u.is_active ? <Ban className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > 25 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prethodna</Button>
          <span className="px-3 py-2 text-sm">Strana {page} od {Math.ceil(total / 25)}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * 25 >= total}>Sledeća</Button>
        </div>
      )}

      {/* Edit User Dialog */}
      {editUser && (
        <UserEditDialog user={editUser} onClose={() => setEditUser(null)} onSaved={() => { setEditUser(null); load() }} />
      )}

      {/* Create User Dialog */}
      {createOpen && (
        <UserCreateDialog onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); load() }} />
      )}
    </div>
  )
}

function UserEditDialog({ user: u, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: u.name || '',
    email: u.email || '',
    phone: u.phone || '',
    password: '',
    role: u.role || 'user',
    user_type: u.user_type || 'individual',
    city: u.city || '',
    is_active: u.is_active,
    is_premium: u.is_premium || false,
    premium_until: u.premium_until ? u.premium_until.slice(0, 10) : '',
    company_name: u.company_name || '',
    pib: u.pib || '',
    maticni_broj: u.maticni_broj || '',
    company_address: u.company_address || '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [field]: val })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const data = { ...form }
      if (!data.password) delete data.password
      if (!data.premium_until) data.premium_until = null
      await adminApi.updateUser(u.id, data)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || 'Greška.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Izmeni korisnika: {u.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Ime *</Label><Input value={form.name} onChange={set('name')} required /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={set('email')} required /></div>
            <div><Label>Telefon *</Label><Input value={form.phone} onChange={set('phone')} required /></div>
            <div><Label>Nova lozinka (ostavite prazno)</Label><Input type="password" value={form.password} onChange={set('password')} /></div>
            <div><Label>Grad</Label><Input value={form.city} onChange={set('city')} /></div>
            <div>
              <Label>Rola</Label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.role} onChange={set('role')}>
                <option value="user">Korisnik</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <Label>Tip naloga</Label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.user_type} onChange={set('user_type')}>
                <option value="individual">Fizičko lice</option>
                <option value="company">Pravno lice</option>
              </select>
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={set('is_active')} className="rounded" />
                <span className="text-sm">Aktivan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_premium} onChange={set('is_premium')} className="rounded" />
                <span className="text-sm">Premium</span>
              </label>
            </div>
          </div>

          {form.is_premium && (
            <div><Label>Premium do</Label><Input type="date" value={form.premium_until} onChange={set('premium_until')} /></div>
          )}

          {form.user_type === 'company' && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <h3 className="font-semibold text-sm text-blue-800">Podaci o firmi</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Naziv firme</Label><Input value={form.company_name} onChange={set('company_name')} /></div>
                <div><Label>PIB</Label><Input value={form.pib} onChange={set('pib')} /></div>
                <div><Label>Matični broj</Label><Input value={form.maticni_broj} onChange={set('maticni_broj')} /></div>
                <div><Label>Adresa firme</Label><Input value={form.company_address} onChange={set('company_address')} /></div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Otkaži</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Čuvanje...' : 'Sačuvaj'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UserCreateDialog({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'admin',
    user_type: 'individual', city: '', company_name: '', pib: '', maticni_broj: '', company_address: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await adminApi.createUser(form)
      onCreated()
    } catch (err) {
      setError(err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || 'Greška.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novi korisnik / admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Ime *</Label><Input value={form.name} onChange={set('name')} required /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={set('email')} required /></div>
            <div><Label>Telefon *</Label><Input value={form.phone} onChange={set('phone')} required /></div>
            <div><Label>Lozinka *</Label><Input type="password" value={form.password} onChange={set('password')} required /></div>
            <div><Label>Grad</Label><Input value={form.city} onChange={set('city')} /></div>
            <div>
              <Label>Rola</Label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.role} onChange={set('role')}>
                <option value="user">Korisnik</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <Label>Tip naloga</Label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.user_type} onChange={set('user_type')}>
                <option value="individual">Fizičko lice</option>
                <option value="company">Pravno lice</option>
              </select>
            </div>
          </div>

          {form.user_type === 'company' && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <h3 className="font-semibold text-sm text-blue-800">Podaci o firmi</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Naziv firme</Label><Input value={form.company_name} onChange={set('company_name')} /></div>
                <div><Label>PIB</Label><Input value={form.pib} onChange={set('pib')} /></div>
                <div><Label>Matični broj</Label><Input value={form.maticni_broj} onChange={set('maticni_broj')} /></div>
                <div><Label>Adresa firme</Label><Input value={form.company_address} onChange={set('company_address')} /></div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Otkaži</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Kreiranje...' : 'Kreiraj'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
