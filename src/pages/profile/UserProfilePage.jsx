import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Star, MapPin, Calendar } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import { profileApi, ratingsApi } from '@/api/endpoints'

const countryNames = { RS: 'Srbija' }

export default function UserProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [ratings, setRatings] = useState([])

  useEffect(() => {
    profileApi.get(id).then((res) => setProfile(res.data))
    profileApi.listings(id).then((res) => setListings(res.data.data))
    ratingsApi.list(id).then((res) => setRatings(res.data.data || []))
  }, [id])

  if (!profile) return <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
          {profile.name?.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            {profile.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {profile.city}, {countryNames[profile.country]}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {profile.rating > 0 ? `${profile.rating} (${profile.rating_count})` : 'Novi korisnik'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Član od {new Date(profile.created_at).toLocaleDateString('sr-RS')}
            </span>
          </div>
        </div>
      </div>

      {/* Listings */}
      <h2 className="text-xl font-bold mb-4">Oglasi ({profile.listings_count})</h2>
      {listings.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      ) : (
        <p className="text-muted-foreground">Nema aktivnih oglasa.</p>
      )}

      {/* Ratings */}
      {ratings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Ocjene</h2>
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{r.rater?.name}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
