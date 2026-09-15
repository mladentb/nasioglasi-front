import { useState, useEffect } from 'react'
import ListingCard from '@/components/listings/ListingCard'
import { favoritesApi } from '@/api/endpoints'

export default function FavoritesPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    favoritesApi.list().then((res) => {
      setListings(res.data.data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Favoriti</h1>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Nemate sačuvanih favorita.
        </div>
      )}
    </div>
  )
}
