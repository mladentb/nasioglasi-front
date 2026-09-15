import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, AlertTriangle, Crown, TrendingUp, Eye, MessageCircle, DollarSign, Building2, UserCheck, Globe, Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/api/endpoints'
import useAuthStore from '@/store/auth'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMsg, setMaintenanceMsg] = useState('')
  const [savingMaintenance, setSavingMaintenance] = useState(false)

  useEffect(() => {
    adminApi.stats().then((res) => {
      setStats(res.data)
      setLoading(false)
    })
    adminApi.settings().then((res) => {
      setMaintenanceMode(res.data.maintenance_mode)
      setMaintenanceMsg(res.data.maintenance_message)
    })
  }, [])

  const toggleMaintenance = async () => {
    setSavingMaintenance(true)
    const newMode = !maintenanceMode
    await adminApi.updateSettings({ maintenance_mode: newMode, maintenance_message: maintenanceMsg })
    setMaintenanceMode(newMode)
    setSavingMaintenance(false)
  }

  const saveMaintenanceMsg = async () => {
    setSavingMaintenance(true)
    await adminApi.updateSettings({ maintenance_message: maintenanceMsg })
    setSavingMaintenance(false)
  }

  if (!user?.role || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-destructive">Nemate pristup.</div>
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground">Učitavanje...</div>

  const s = stats || {}
  const isSuperAdmin = user.role === 'super_admin'

  const formatCurrency = (val) => {
    if (!val) return '0 RSD'
    return new Intl.NumberFormat('sr-RS').format(val) + ' RSD'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {isSuperAdmin ? 'Super Admin' : 'Admin'} Panel
          </h1>
          <p className="text-sm text-muted-foreground">NašiOglasi.net — Upravljanje platformom</p>
        </div>
      </div>

      {/* Maintenance mode */}
      {isSuperAdmin && (
        <div className={`p-4 rounded-lg border-2 mb-6 ${maintenanceMode ? 'border-amber-400 bg-amber-50' : 'border-border'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Construction className={`h-6 w-6 ${maintenanceMode ? 'text-amber-600' : 'text-muted-foreground'}`} />
              <div>
                <h3 className="font-semibold">Under Construction mod</h3>
                <p className="text-sm text-muted-foreground">
                  {maintenanceMode ? 'Sajt je u modu izgradnje — obični korisnici vide maintenance stranicu' : 'Sajt je aktivan za sve korisnike'}
                </p>
              </div>
            </div>
            <Button
              onClick={toggleMaintenance}
              variant={maintenanceMode ? 'destructive' : 'outline'}
              disabled={savingMaintenance}
            >
              {savingMaintenance ? '...' : maintenanceMode ? 'Isključi' : 'Uključi'}
            </Button>
          </div>
          {maintenanceMode && (
            <div className="mt-3 flex gap-2">
              <Input
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                placeholder="Poruka za korisnike..."
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={saveMaintenanceMsg} disabled={savingMaintenance}>
                Sačuvaj poruku
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Quick links - na vrhu */}
      <h2 className="text-lg font-bold mb-3">Upravljanje</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <QuickLink to="/admin/oglasi" icon={FileText} label="Oglasi" desc="Pregled i moderacija" color="text-primary" />
        <QuickLink to="/admin/uplate" icon={DollarSign} label="Uplate" desc="Pregled uplata" color="text-green-600" />
        <QuickLink to="/admin/prijave" icon={AlertTriangle} label="Prijave" desc={`${s.reports_pending} na čekanju`} color="text-amber-500" />
        <QuickLink to="/admin/korisnici" icon={Users} label="Korisnici" desc="Upravljanje" color="text-blue-600" />
        {isSuperAdmin && (
          <QuickLink to="/admin/administratori" icon={Crown} label="Administratori" desc="Upravljanje rolama" color="text-purple-600" />
        )}
      </div>

      {/* Main stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Ukupno korisnika" value={s.users_total} sub={`+${s.users_today} danas / +${s.users_this_month} ovaj mesec`} />
        <StatCard icon={FileText} label="Aktivni oglasi" value={s.listings_active} sub={`+${s.listings_today} danas / ${s.listings_total} ukupno`} />
        <StatCard icon={Crown} label="Premium oglasi" value={s.listings_premium} color="text-amber-500" />
        <StatCard icon={AlertTriangle} label="Prijave" value={s.reports_pending} sub={`${s.reports_total} ukupno`} color={s.reports_pending > 0 ? 'text-destructive' : ''} />
      </div>

      {/* Financial stats */}
      <h2 className="text-lg font-bold mb-3">Finansije</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} label="Vrednost oglasa" value={formatCurrency(s.listings_total_value)} small />
        <StatCard icon={DollarSign} label="Prosečna cena" value={formatCurrency(s.listings_avg_price)} small />
        <StatCard icon={TrendingUp} label="Premium zarada (ukupno)" value={formatCurrency(s.premium_revenue_total)} color="text-green-600" small />
        <StatCard icon={TrendingUp} label="Premium zarada (mesec)" value={formatCurrency(s.premium_revenue_this_month)} color="text-green-600" small />
      </div>

      {/* User breakdown */}
      <h2 className="text-lg font-bold mb-3">Korisnici</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Fizička lica" value={s.users_individuals} small />
        <StatCard icon={Building2} label="Pravna lica" value={s.users_companies} small />
        <StatCard icon={UserCheck} label="Verifikovani" value={s.users_verified} small />
        <StatCard icon={Users} label="Novi ovaj mesec" value={s.users_this_month} small />
      </div>

      {/* Activity stats */}
      <h2 className="text-lg font-bold mb-3">Aktivnost</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Eye} label="Ukupno pregleda" value={new Intl.NumberFormat('sr-RS').format(s.total_views || 0)} small />
        <StatCard icon={MessageCircle} label="Poruke danas" value={s.messages_today} sub={`${s.messages_total} ukupno`} small />
        <StatCard icon={FileText} label="Prodano" value={s.listings_sold} small />
        <StatCard icon={FileText} label="Isteklo" value={s.listings_expired} small />
      </div>

      {/* Top categories */}
      {s.top_categories?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Top kategorije</h3>
            {s.top_categories.map((cat, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{cat.name}</span>
                <span className="text-sm font-bold">{cat.count} oglasa</span>
              </div>
            ))}
          </div>

          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Top gradovi</h3>
            {s.top_cities?.map((city, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{city.city} ({city.country})</span>
                <span className="text-sm font-bold">{city.count} oglasa</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Super admin: admins list */}
      {isSuperAdmin && s.admins_list && (
        <div className="border border-border rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Administratori ({s.admins_count})</h3>
          {s.admins_list.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <span className="font-medium text-sm">{admin.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{admin.email}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${admin.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color, small }) {
  return (
    <div className="p-4 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`font-bold ${small ? 'text-lg' : 'text-2xl'}`}>{value ?? 0}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function CountryCard({ country, flag, users, listings }) {
  return (
    <div className="p-4 rounded-lg border border-border text-center">
      <p className="text-2xl mb-1">{flag}</p>
      <p className="font-semibold text-sm">{country}</p>
      <p className="text-xs text-muted-foreground mt-1">{users || 0} korisnika</p>
      <p className="text-xs text-muted-foreground">{listings || 0} oglasa</p>
    </div>
  )
}

function QuickLink({ to, icon: Icon, label, desc, color }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary transition-colors">
      <Icon className={`h-8 w-8 ${color}`} />
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </Link>
  )
}
