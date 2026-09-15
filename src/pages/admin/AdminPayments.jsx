import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { adminApi } from '@/api/endpoints'
import useAuthStore from '@/store/auth'

const statusConfig = {
  pending: { label: 'Na čekanju', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  completed: { label: 'Završeno', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
  failed: { label: 'Neuspelo', cls: 'bg-red-100 text-red-700', icon: XCircle },
  refunded: { label: 'Refundirano', cls: 'bg-gray-100 text-gray-700', icon: RotateCcw },
}

const typeLabels = { premium_listing: 'Premium oglas', premium_user: 'Premium korisnik' }

const formatCurrency = (val) => val ? new Intl.NumberFormat('sr-RS').format(val) + ' RSD' : '0 RSD'

export default function AdminPayments() {
  const { user } = useAuthStore()
  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState({})
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', type: '', date_from: '', date_to: '' })

  const load = () => {
    setLoading(true)
    const params = { page }
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    adminApi.payments(params).then((res) => {
      setPayments(res.data.payments.data)
      setTotal(res.data.payments.total)
      setSummary(res.data.summary)
      setLoading(false)
    })
  }

  useEffect(load, [page])

  const applyFilters = () => { setPage(1); load() }

  const handleStatusChange = async (id, status) => {
    await adminApi.updatePayment(id, { status })
    load()
  }

  if (!user?.role || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-destructive">Nemate pristup.</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Uplate</h1>
        <Link to="/admin" className="text-sm text-primary hover:underline">&larr; Dashboard</Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-green-600" /><span className="text-xs text-muted-foreground">Ukupna zarada</span></div>
          <p className="text-xl font-bold text-green-700">{formatCurrency(summary.total_amount)}</p>
          <p className="text-xs text-muted-foreground">{summary.total_count} uplata</p>
        </div>
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-amber-600" /><span className="text-xs text-muted-foreground">Na čekanju</span></div>
          <p className="text-xl font-bold text-amber-700">{formatCurrency(summary.pending_amount)}</p>
          <p className="text-xs text-muted-foreground">{summary.pending_count} uplata</p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-primary" /><span className="text-xs text-muted-foreground">Ovaj mesec</span></div>
          <p className="text-xl font-bold">{formatCurrency(summary.this_month)}</p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Prošli mesec</span></div>
          <p className="text-xl font-bold">{formatCurrency(summary.last_month)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 p-4 bg-muted rounded-lg">
        <div>
          <Label className="text-xs">Pretraga</Label>
          <Input placeholder="Ime, email, firma..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Svi</option>
            <option value="pending">Na čekanju</option>
            <option value="completed">Završeno</option>
            <option value="failed">Neuspelo</option>
            <option value="refunded">Refundirano</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Datum od</Label>
          <Input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Datum do</Label>
          <Input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} />
        </div>
        <div className="flex items-end">
          <Button onClick={applyFilters} className="w-full">Filtriraj</Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nema uplata.</div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Korisnik</th>
                <th className="text-left p-3">Oglas</th>
                <th className="text-left p-3">Tip</th>
                <th className="text-right p-3">Iznos</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Datum</th>
                <th className="text-right p-3">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const sc = statusConfig[p.status] || statusConfig.pending
                const StatusIcon = sc.icon
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/50">
                    <td className="p-3 text-muted-foreground">{p.id}</td>
                    <td className="p-3">
                      <p className="font-medium">{p.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                      {p.user?.company_name && <p className="text-xs text-blue-600">{p.user.company_name}</p>}
                    </td>
                    <td className="p-3">
                      {p.listing ? (
                        <Link to={`/kategorija/oglas/${p.listing.slug}`} className="text-primary hover:underline text-sm">{p.listing.title}</Link>
                      ) : '—'}
                    </td>
                    <td className="p-3 text-sm">{typeLabels[p.type] || p.type}</td>
                    <td className="p-3 text-right font-bold">{formatCurrency(p.amount)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${sc.cls}`}>
                        <StatusIcon className="h-3 w-3" /> {sc.label}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString('sr-RS')}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        {p.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleStatusChange(p.id, 'completed')} title="Potvrdi">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleStatusChange(p.id, 'failed')} title="Odbij">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {p.status === 'completed' && (
                          <Button variant="ghost" size="sm" onClick={() => handleStatusChange(p.id, 'refunded')} title="Refund">
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
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
    </div>
  )
}
