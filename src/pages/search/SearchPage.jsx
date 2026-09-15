import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import ListingCard from '@/components/listings/ListingCard'
import { searchApi, categoriesApi } from '@/api/endpoints'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    country: searchParams.get('country') || '',
    city: searchParams.get('city') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    condition: searchParams.get('condition') || '',
    sort: searchParams.get('sort') || 'newest',
  })

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    loadListings()
  }, [page])

  useEffect(() => {
    setPage(1)
    loadListings()
  }, [searchParams.toString()])

  const loadListings = async () => {
    setLoading(true)
    const params = { ...filters, page, per_page: 24 }
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k] })
    const res = await searchApi.search(params)
    setListings(res.data.data)
    setTotal(res.data.total)
    setLoading(false)
  }

  const applyFilters = () => {
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {filters.q ? `Rezultati za "${filters.q}"` : 'Svi oglasi'}
          <span className="text-base font-normal text-muted-foreground ml-2">({total})</span>
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4 mr-1" /> Filteri
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <div className={`w-64 flex-shrink-0 space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div>
            <Label>Pretraga</Label>
            <Input
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              placeholder="Ključna reč..."
            />
          </div>

          <div>
            <Label>Kategorija</Label>
            <select
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">Sve kategorije</option>
              {categories.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  {c.children?.map((ch) => (
                    <option key={ch.id} value={ch.slug}>{ch.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <Label>Grad</Label>
            <Input
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="Npr. Beograd"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Cena od</Label>
              <Input
                type="number"
                value={filters.price_min}
                onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
              />
            </div>
            <div>
              <Label>Cena do</Label>
              <Input
                type="number"
                value={filters.price_max}
                onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Stanje</Label>
            <select
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
              value={filters.condition}
              onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
            >
              <option value="">Sve</option>
              <option value="new">Novo</option>
              <option value="used">Korišteno</option>
              <option value="refurbished">Obnovljeno</option>
            </select>
          </div>

          <div>
            <Label>Sortiranje</Label>
            <select
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="newest">Najnovije</option>
              <option value="price_asc">Cena: najniža</option>
              <option value="price_desc">Cena: najviša</option>
              <option value="views">Najpopularnije</option>
            </select>
          </div>

          <Button onClick={applyFilters} className="w-full">Primeni filtere</Button>
        </div>

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nema rezultata. Probajte sa drugačijim filterima.
            </div>
          )}

          {total > 24 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prethodna
              </Button>
              <span className="px-4 py-2 text-sm">
                Strana {page} od {Math.ceil(total / 24)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 24 >= total}
              >
                Sljedeća
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
