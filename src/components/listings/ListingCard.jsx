import { Link } from 'react-router-dom'
import { MapPin, Clock, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { listingUrl } from '@/lib/listing-url'

function formatPrice(price, priceType, currency) {
  if (priceType === 'free') return 'Besplatno'
  if (priceType === 'contact') return 'Po dogovoru'
  if (priceType === 'exchange') return 'Zamjena'
  if (!price) return ''

  const formatted = new Intl.NumberFormat('sr-RS').format(price)
  const symbols = { RSD: 'RSD', EUR: '€' }
  return `${formatted} ${symbols[currency] || currency}`
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'upravo'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `pre ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `pre ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `pre ${days} dana`
  return new Date(date).toLocaleDateString('sr-RS')
}

export default function ListingCard({ listing }) {
  const image = listing.images?.[0]
  const thumbUrl = image?.thumbnail_url || image?.url

  return (
    <Link
      to={listingUrl(listing)}
      className="group block bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Nema slike
          </div>
        )}
        {listing.is_premium && (
          <Badge className="absolute top-2 left-2 bg-amber-500 text-white">Premium</Badge>
        )}
        {listing.condition && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            {listing.condition === 'new' ? 'Novo' : listing.condition === 'used' ? 'Korišćeno' : 'Obnovljeno'}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>

        <p className="text-lg font-bold text-primary mt-1">
          {formatPrice(listing.price, listing.price_type, listing.currency)}
          {listing.price_type === 'negotiable' && (
            <span className="text-xs font-normal text-muted-foreground ml-1">po dogovoru</span>
          )}
        </p>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {listing.city}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(listing.created_at)}
          </span>
          {listing.views_count > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.views_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
