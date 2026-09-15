import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trash2, Ban, CheckCircle, Crown, Eye, DollarSign, Image } from 'lucide-react'
import { listingUrl } from '@/lib/listing-url'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { adminApi, categoriesApi } from '@/api/endpoints'
import useAuthStore from '@/store/auth'

const statusColors = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-gray-100 text-gray-600',
  sold: 'bg-blue-100 text-blue-700',
  draft: 'bg-amber-100 text-amber-700',
  deleted: 'bg-red-100 text-red-700',
}

const formatCurrency = (val) => val ? new Intl.NumberFormat('sr-RS').format(val) + ' RSD' : '—'

export default function AdminListings() {
  const { user } = useAuthStore()
  const [listings, setListings] = useState([])
  const [categories, setCategories] = useState([])
  const [summary, setSummary] = useState({})
  const [categoryStats, setCategoryStats] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    search: '', status: '', category_id: '', city: '',
    price_min: '', price_max: '', is_premium: '', condition: '',
    user_type: '', has_images: '', date_from: '', date_to: '', sort: '',
  })

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data))
  }, [])

  const load = () => {
    setLoading(true)
    const params = { page }
    Object.entries(filters).forEach(([k, v]) => { if (v !== '') params[k] = v })
    adminApi.listings(params).then((res) => {
      setListings(res.data.listings.data)
      setTotal(res.data.listings.total)
      setSummary(res.data.summary)
      setCategoryStats(res.data.category_stats || [])
      setLoading(false)
    })
  }

  useEffect(load, [page])

  const applyFilters = () => { setPage(1); load() }
  const resetFilters = () => {
    setFilters({ search: '', status: '', category_id: '', city: '', price_min: '', price_max: '', is_premium: '', condition: '', user_type: '', has_images: '', date_from: '', date_to: '', sort: '' })
    setPage(1)
    setTimeout(load, 0)
  }

  if (!user?.role || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-destructive">Nemate pristup.</div>
  }

  const handleStatusChange = async (id, newStatus) => {
    await adminApi.updateListing(id, { status: newStatus })
    load()
  }

  const handleTogglePremium = async (listing) => {
    await adminApi.updateListing(listing.id, { is_premium: !listing.is_premium })
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Trajno obrisati oglas?')) return
    await adminApi.deleteListing(id)
    load()
  }

  const set = (field) => (e) => setFilters({ ...filters, [field]: e.target.value })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Oglasi</h1>
        <Link to="/admin" className="text-sm text-primary hover:underline">&larr; Dashboard</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-border">
          <span className="text-xs text-muted-foreground">Ukupno (filter)</span>
          <p className="text-2xl font-bold">{summary.total ?? 0}</p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <span className="text-xs text-muted-foreground">Ukupna vrednost</span>
          <p className="text-xl font-bold">{formatCurrency(summary.total_value)}</p>
        </div>
        <div className="p-4 rounded-lg border border-border">
          <span className="text-xs text-muted-foreground">Prosečna cena</span>
          <p className="text-xl font-bold">{formatCurrency(summary.avg_price)}</p>
        </div>
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
          <span className="text-xs text-muted-foreground">Premium</span>
          <p className="text-2xl font-bold text-amber-600">{summary.premium_count ?? 0}</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <div className="w-64 flex-shrink-0 space-y-3">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <h3 className="font-semibold text-sm">Filteri</h3>

            <div><Label className="text-xs">Pretraga</Label><Input placeholder="Naslov, opis..." value={filters.search} onChange={set('search')} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} /></div>

            <div>
              <Label className="text-xs">Status</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={filters.status} onChange={set('status')}>
                <option value="">Svi</option>
                <option value="active">Aktivan</option>
                <option value="expired">Istekao</option>
                <option value="sold">Prodat</option>
                <option value="draft">Nacrt</option>
              </select>
            </div>

            <div>
              <Label className="text-xs">Kategorija</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={filters.category_id} onChange={set('category_id')}>
                <option value="">Sve</option>
                {categories.map((c) => (
                  <optgroup key={c.id} label={c.name}>
                    <option value={c.id}>-- {c.name} (sve)</option>
                    {c.children?.map((ch) => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div><Label className="text-xs">Grad</Label><Input placeholder="Beograd..." value={filters.city} onChange={set('city')} /></div>

            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Cena od</Label><Input type="number" value={filters.price_min} onChange={set('price_min')} /></div>
              <div><Label className="text-xs">Cena do</Label><Input type="number" value={filters.price_max} onChange={set('price_max')} /></div>
            </div>

            <div>
              <Label className="text-xs">Premium</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={filters.is_premium} onChange={set('is_premium')}>
                <option value="">Svi</option>
                <option value="true">Samo premium</option>
                <option value="false">Bez premium</option>
              </select>
            </div>

            <div>
              <Label className="text-xs">Stanje</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={filters.condition} onChange={set('condition')}>
                <option value="">Sve</option>
                <option value="new">Novo</option>
                <option value="used">Korišćeno</option>
                <option value="refurbished">Obnovljeno</option>
              </select>
            </div>

            <div>
              <Label className="text-xs">Tip oglašivača</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={filters.user_type} onChange={set('user_type')}>
                <option value="">Svi</option>
                <option value="individual">Fizička lica</option>
                <option value="company">Pravna lica</option>
              </select>
            </div>

            <div>
              <Label className="text-xs">Slike</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={filters.has_images} onChange={set('has_images')}>
                <option value="">Svi</option>
                <option value="true">Sa slikama</option>
                <option value="false">Bez slika</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Od</Label><Input type="date" value={filters.date_from} onChange={set('date_from')} /></div>
              <div><Label className="text-xs">Do</Label><Input type="date" value={filters.date_to} onChange={set('date_to')} /></div>
            </div>

            <div>
              <Label className="text-xs">Sortiranje</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={filters.sort} onChange={set('sort')}>
                <option value="">Najnovije</option>
                <option value="oldest">Najstarije</option>
                <option value="price_asc">Cena: najniža</option>
                <option value="price_desc">Cena: najviša</option>
                <option value="views">Pregledi</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={applyFilters} className="flex-1" size="sm">Filtriraj</Button>
              <Button onClick={resetFilters} variant="outline" size="sm">Reset</Button>
            </div>
          </div>

          {/* Category stats sidebar */}
          {categoryStats.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Po kategorijama</h3>
              <div className="space-y-1">
                {categoryStats.sort((a, b) => b.count - a.count).slice(0, 15).map((cs) => (
                  <button
                    key={cs.id}
                    onClick={() => { setFilters({ ...filters, category_id: String(cs.id) }); setPage(1); setTimeout(load, 0) }}
                    className={`flex items-center justify-between w-full text-left px-2 py-1 rounded text-xs hover:bg-background ${String(filters.category_id) === String(cs.id) ? 'bg-background font-bold' : ''}`}
                  >
                    <span className="truncate">{cs.name}</span>
                    <span className="text-muted-foreground ml-2">{cs.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nema oglasa za zadate filtere.</div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div key={listing.id} className="flex gap-4 p-4 border border-border rounded-lg hover:bg-muted/30">
                  {/* Image */}
                  <div className="w-28 h-20 flex-shrink-0 bg-muted rounded overflow-hidden">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0].thumbnail_url || listing.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Image className="h-5 w-5 text-muted-foreground" /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={listingUrl(listing)} className="font-medium hover:text-primary line-clamp-1 text-sm">{listing.title}</Link>
                      {listing.is_premium && <Badge className="bg-amber-500 text-white text-xs">Premium</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${statusColors[listing.status] || ''}`}>{listing.status}</span>
                      <span>{listing.category?.parent?.name} &gt; {listing.category?.name}</span>
                      <span>{listing.city}</span>
                      <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{listing.views_count}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{listing.user?.name} ({listing.user?.user_type === 'company' ? listing.user.company_name : 'fizičko lice'})</span>
                      <span>{new Date(listing.created_at).toLocaleDateString('sr-RS')}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-primary">{listing.price ? formatCurrency(listing.price) : listing.price_type}</p>
                    <p className="text-xs text-muted-foreground">{listing.images?.length || 0} slika</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {listing.status !== 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(listing.id, 'active')} title="Aktiviraj">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleTogglePremium(listing)} title="Premium toggle">
                      <Crown className={`h-4 w-4 ${listing.is_premium ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    </Button>
                    {listing.status === 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(listing.id, 'expired')} title="Deaktiviraj">
                        <Ban className="h-4 w-4 text-amber-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(listing.id)} title="Obriši">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
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
      </div>
    </div>
  )
}
