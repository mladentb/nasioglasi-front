import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Clock, Eye, Phone, Heart, Flag, ChevronLeft, ChevronRight, Star, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { listingsApi, favoritesApi, reportsApi, messagesApi, ratingsApi } from '@/api/endpoints'
import useAuthStore from '@/store/auth'

function formatPrice(price, priceType, currency) {
  if (priceType === 'free') return 'Besplatno'
  if (priceType === 'contact') return 'Po dogovoru'
  if (priceType === 'exchange') return 'Zamjena'
  if (!price) return ''
  const formatted = new Intl.NumberFormat('sr-RS').format(price)
  const symbols = { RSD: 'RSD', EUR: '€' }
  return `${formatted} ${symbols[currency] || currency}`
}

const countryNames = { RS: 'Srbija' }
const conditionLabels = { new: 'Novo', used: 'Korišćeno', refurbished: 'Obnovljeno' }

export default function ListingDetailPage({ listingSlug }) {
  const params = useParams()
  const slug = listingSlug || params.slug || params.child
  const { user } = useAuthStore()
  const [listing, setListing] = useState(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [showPhone, setShowPhone] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [message, setMessage] = useState('')
  const [messageSent, setMessageSent] = useState(false)

  useEffect(() => {
    listingsApi.get(slug).then((res) => setListing(res.data))
  }, [slug])

  if (!listing) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground">Učitavanje...</div>
  }

  const images = listing.images || []
  const phone = listing.contact_phone || listing.user?.phone

  const handleFavorite = async () => {
    if (!user) return
    const res = await favoritesApi.toggle(listing.id)
    setFavorited(res.data.favorited)
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return
    await messagesApi.send({
      listing_id: listing.id,
      receiver_id: listing.user_id,
      body: message,
    })
    setMessageSent(true)
    setMessage('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">Početna</Link>
        <ChevronRight className="h-4 w-4" />
        {listing.category?.parent && (
          <>
            <Link to={`/kategorija/${listing.category.parent.slug}`} className="hover:text-foreground">
              {listing.category.parent.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <Link to={`/kategorija/${listing.category?.slug}`} className="hover:text-foreground">
          {listing.category?.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Images + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          {images.length > 0 ? (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <img
                src={images[currentImage]?.url}
                alt={listing.title}
                className="w-full aspect-[4/3] object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`w-2 h-2 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-muted rounded-lg aspect-[4/3] flex items-center justify-center text-muted-foreground">
              Nema slika
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                    i === currentImage ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img src={img.thumbnail_url || img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title + Price */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              {user && (
                <Button variant="ghost" size="icon" onClick={handleFavorite}>
                  <Heart className={`h-5 w-5 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              )}
            </div>
            <p className="text-3xl font-bold text-primary mt-2">
              {formatPrice(listing.price, listing.price_type, listing.currency)}
              {listing.price_type === 'negotiable' && (
                <span className="text-sm font-normal text-muted-foreground ml-2">po dogovoru</span>
              )}
            </p>
          </div>

          {/* Meta fields */}
          {listing.meta && Object.keys(listing.meta).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-secondary rounded-lg">
              {Object.entries(listing.meta).map(([key, value]) => {
                if (!value) return null
                const metaField = listing.category?.meta_fields?.find((f) => f.name === key)
                return (
                  <div key={key}>
                    <span className="text-xs text-muted-foreground">{metaField?.label || key}</span>
                    <p className="font-medium text-sm">{value}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="font-semibold mb-2">Opis</h2>
            <p className="text-sm whitespace-pre-line text-muted-foreground">{listing.description}</p>
          </div>

          {/* Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {listing.city}, {countryNames[listing.country]}
            </span>
            {listing.condition && (
              <Badge variant="secondary">{conditionLabels[listing.condition]}</Badge>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {listing.views_count} pregleda
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {new Date(listing.created_at).toLocaleDateString('sr-RS')}
            </span>
          </div>
        </div>

        {/* Right sidebar - Seller info */}
        <div className="space-y-4">
          {/* Seller card */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <Link to={`/korisnik/${listing.user?.id}`} className="flex items-center gap-3 hover:underline">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                {listing.user?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{listing.user?.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {listing.user?.rating > 0 ? listing.user.rating : 'Novi korisnik'}
                </div>
              </div>
            </Link>

            {/* Phone */}
            {phone && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPhone(true)}
              >
                <Phone className="h-4 w-4 mr-2" />
                {showPhone ? phone : `${phone.slice(0, 4)}... Prikaži broj`}
              </Button>
            )}

            {/* Message */}
            {user && user.id !== listing.user_id && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Pošalji poruku prodavcu..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
                {messageSent ? (
                  <p className="text-sm text-green-600">Poruka poslata!</p>
                ) : (
                  <Button className="w-full" onClick={handleSendMessage} disabled={!message.trim()}>
                    <MessageCircle className="h-4 w-4 mr-2" /> Pošalji poruku
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Rate seller */}
          {user && user.id !== listing.user_id && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Star className="h-4 w-4 mr-1" /> Oceni prodavca
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Oceni prodavca</DialogTitle>
                </DialogHeader>
                <RatingForm userId={listing.user_id} listingId={listing.id} />
              </DialogContent>
            </Dialog>
          )}

          {/* Report */}
          {user && user.id !== listing.user_id && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                  <Flag className="h-4 w-4 mr-1" /> Prijavi oglas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Prijavi oglas</DialogTitle>
                </DialogHeader>
                <ReportForm listingId={listing.id} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}

function ReportForm({ listingId }) {
  const [reason, setReason] = useState('spam')
  const [description, setDescription] = useState('')
  const [sent, setSent] = useState(false)

  const reasons = [
    { value: 'spam', label: 'Spam' },
    { value: 'fraud', label: 'Prevara' },
    { value: 'inappropriate', label: 'Neprimeren sadržaj' },
    { value: 'wrong_category', label: 'Pogrešna kategorija' },
    { value: 'other', label: 'Ostalo' },
  ]

  const handleSubmit = async () => {
    await reportsApi.create(listingId, { reason, description })
    setSent(true)
  }

  if (sent) return <p className="text-green-600 py-4">Prijava poslata. Hvala!</p>

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {reasons.map((r) => (
          <label key={r.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reason"
              value={r.value}
              checked={reason === r.value}
              onChange={() => setReason(r.value)}
            />
            {r.label}
          </label>
        ))}
      </div>
      <Textarea
        placeholder="Dodatni opis (opcionalno)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <Button onClick={handleSubmit}>Pošalji prijavu</Button>
    </div>
  )
}

function RatingForm({ userId, listingId }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) return
    setError('')
    try {
      await ratingsApi.create(userId, { listing_id: listingId, rating, comment })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Greška.')
    }
  }

  if (sent) return <p className="text-green-600 py-4">Ocjena poslata. Hvala!</p>

  return (
    <div className="space-y-4">
      {error && <p className="text-destructive text-sm">{error}</p>}
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="p-1"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                s <= (hover || rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {rating === 0 ? 'Klikni na zvjezdicu' : `${rating}/5`}
      </p>
      <Textarea
        placeholder="Komentar (opcionalno)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />
      <Button onClick={handleSubmit} disabled={rating === 0} className="w-full">
        Pošalji ocenu
      </Button>
    </div>
  )
}
