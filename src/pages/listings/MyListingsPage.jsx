import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw, CheckCircle, Trash2, Crown, Pencil } from 'lucide-react'
import { listingUrl } from '@/lib/listing-url'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { profileApi, listingsApi } from '@/api/endpoints'

const statusLabels = {
  active: { label: 'Aktivan', variant: 'default' },
  expired: { label: 'Istekao', variant: 'secondary' },
  sold: { label: 'Prodano', variant: 'outline' },
  draft: { label: 'Nacrt', variant: 'secondary' },
}

export default function MyListingsPage() {
  const [listings, setListings] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    profileApi.myListings({ status: filter || undefined }).then((res) => {
      setListings(res.data.data)
      setLoading(false)
    })
  }

  useEffect(load, [filter])

  const handleRenew = async (id) => {
    await listingsApi.renew(id)
    load()
  }

  const handleMarkSold = async (id) => {
    await listingsApi.markSold(id)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Obrisati oglas?')) return
    await listingsApi.delete(id)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Moji oglasi</h1>
        <Button asChild>
          <Link to="/novi-oglas"><Plus className="h-4 w-4 mr-1" /> Novi oglas</Link>
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['', 'active', 'expired', 'sold'].map((s) => (
          <Button
            key={s}
            variant={filter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === '' ? 'Svi' : statusLabels[s]?.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nemate oglase.
          <br />
          <Button asChild className="mt-4"><Link to="/novi-oglas">Postavi prvi oglas</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="flex gap-4 p-4 border border-border rounded-lg">
              {/* Thumb */}
              <div className="w-24 h-24 flex-shrink-0 bg-muted rounded overflow-hidden">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0].thumbnail_url || listing.images[0].url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    Nema slike
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={listingUrl(listing)} className="font-medium hover:text-primary line-clamp-1">
                  {listing.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={statusLabels[listing.status]?.variant}>
                    {statusLabels[listing.status]?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{listing.views_count} pregleda</span>
                </div>
                <p className="text-sm font-bold text-primary mt-1">
                  {listing.price ? `${new Intl.NumberFormat('sr-RS').format(listing.price)} ${listing.currency}` : listing.price_type}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1">
                {(listing.status === 'active' || listing.status === 'expired') && (
                  <Button variant="outline" size="sm" onClick={() => handleRenew(listing.id)}>
                    <RefreshCw className="h-3 w-3 mr-1" /> Obnovi
                  </Button>
                )}
                {listing.status === 'active' && !listing.is_premium && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-amber-600 border-amber-300">
                        <Crown className="h-3 w-3 mr-1" /> Premium
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Istakni oglas</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Premium oglas se prikazuje na vrhu liste i istaknut je zlatnom bojom.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-amber-600">999 RSD</p>
                          <p className="text-sm text-muted-foreground">mesečno</p>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Plaćanje dolazi uskoro. Kontaktirajte nas na info@nasioglasi.net za premium.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {listing.is_premium && (
                  <Badge className="bg-amber-500 text-white text-xs justify-center">Premium aktivan</Badge>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/uredi-oglas/${listing.id}`}><Pencil className="h-3 w-3 mr-1" /> Uredi</Link>
                </Button>
                {listing.status === 'active' && (
                  <Button variant="outline" size="sm" onClick={() => handleMarkSold(listing.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Prodano
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(listing.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Obriši
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
