import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Car, Home, Smartphone, Shirt, Sofa, Briefcase, Wrench, Dumbbell, Dog, Tractor, BookOpen, Baby, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ListingCard from '@/components/listings/ListingCard'
import { categoriesApi, listingsApi } from '@/api/endpoints'

const iconMap = {
  car: Car, home: Home, smartphone: Smartphone, shirt: Shirt, sofa: Sofa,
  briefcase: Briefcase, wrench: Wrench, dumbbell: Dumbbell, dog: Dog,
  tractor: Tractor, 'book-open': BookOpen, baby: Baby, package: Package,
}

export default function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState([])
  const [premiumListings, setPremiumListings] = useState([])
  const [latestListings, setLatestListings] = useState([])

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data))
    listingsApi.list({ per_page: 8 }).then((res) => {
      const premium = res.data.data.filter((l) => l.is_premium)
      const latest = res.data.data.filter((l) => !l.is_premium)
      setPremiumListings(premium)
      setLatestListings(res.data.data)
    })
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/pretraga?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Besplatni oglasi za <span className="text-primary">Srbiju</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Postavi oglas besplatno. Obnovi besplatno. Zauvijek.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Šta tražiš?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">
              Traži
            </Button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-4">Kategorije</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] || Package
            return (
              <Link
                key={cat.id}
                to={`/kategorija/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-center"
              >
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium line-clamp-2">{cat.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Latest Listings */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Najnoviji oglasi</h2>
          <Link to="/pretraga" className="text-primary text-sm hover:underline">
            Vidi sve &rarr;
          </Link>
        </div>
        {latestListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {latestListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Još nema oglasa. Budi prvi koji će postaviti!</p>
            <Button asChild className="mt-4">
              <Link to="/novi-oglas">Postavi oglas</Link>
            </Button>
          </div>
        )}
      </section>

      {/* USP Banner */}
      <section className="bg-primary/5 py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">0 RSD</div>
            <p className="text-sm text-muted-foreground">Postavljanje oglasa je potpuno besplatno</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">0 RSD</div>
            <p className="text-sm text-muted-foreground">Obnova oglasa je besplatna, koliko god puta želiš</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">Srbija</div>
            <p className="text-sm text-muted-foreground">Svi gradovi, od Subotice do Vranja</p>
          </div>
        </div>
      </section>
    </div>
  )
}
