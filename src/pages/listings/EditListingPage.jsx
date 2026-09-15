import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, ImagePlus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { categoriesApi, listingsApi, profileApi } from '@/api/endpoints'

export default function EditListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [metaFields, setMetaFields] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    category_id: '',
    title: '',
    description: '',
    price: '',
    price_type: 'fixed',
    currency: 'RSD',
    condition: '',
    city: '',
    country: 'RS',
    contact_phone: '',
    meta: {},
  })

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data))
  }, [])

  // Load listing data
  useEffect(() => {
    profileApi.myListings({ per_page: 100 }).then((res) => {
        const listing = res.data.data.find((l) => String(l.id) === String(id))
        if (listing) {
          setForm({
            category_id: String(listing.category_id),
            title: listing.title,
            description: listing.description,
            price: listing.price || '',
            price_type: listing.price_type || 'fixed',
            currency: listing.currency || 'RSD',
            condition: listing.condition || '',
            city: listing.city,
            country: listing.country,
            contact_phone: listing.contact_phone || '',
            meta: listing.meta || {},
          })
          setExistingImages(listing.images || [])
          setLoading(false)
        }
      })
  }, [id])

  // Load meta fields when category changes
  useEffect(() => {
    if (!form.category_id || categories.length === 0) return
    for (const cat of categories) {
      for (const child of (cat.children || [])) {
        if (String(child.id) === String(form.category_id)) {
          setMetaFields(child.meta_fields || [])
          return
        }
      }
    }
  }, [form.category_id, categories])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const setMeta = (name, value) => setForm({ ...form, meta: { ...form.meta, [name]: value } })

  const addImages = (files) => {
    const totalImages = existingImages.length + newImages.length
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 10 - totalImages)
    setNewImages((prev) => [...prev, ...newFiles])
    newFiles.forEach((file) => {
      setNewPreviews((prev) => [...prev, URL.createObjectURL(file)])
    })
  }

  const removeExisting = async (imageId) => {
    await listingsApi.deleteImage(id, imageId)
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const removeNew = (index) => {
    URL.revokeObjectURL(newPreviews[index])
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)

    try {
      const data = { ...form }
      if (!data.price) delete data.price
      if (!data.condition) delete data.condition
      if (!data.contact_phone) delete data.contact_phone
      if (Object.keys(data.meta).length === 0) delete data.meta

      await listingsApi.update(id, data)

      if (newImages.length > 0) {
        const formData = new FormData()
        newImages.forEach((file) => formData.append('images[]', file))
        await listingsApi.uploadImages(id, formData)
      }

      navigate('/moji-oglasi')
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setErrors({ general: [err.response?.data?.message || 'Greška.'] })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-muted-foreground">Učitavanje...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Uredi oglas</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded text-sm">{errors.general[0]}</div>
        )}

        {/* Category */}
        <div>
          <Label>Kategorija *</Label>
          <select
            className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
            value={form.category_id}
            onChange={set('category_id')}
            required
          >
            <option value="">Izaberi kategoriju</option>
            {categories.map((c) => (
              <optgroup key={c.id} label={c.name}>
                {c.children?.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <Label>Naslov *</Label>
          <Input value={form.title} onChange={set('title')} required maxLength={255} />
        </div>

        {/* Description */}
        <div>
          <Label>Opis *</Label>
          <Textarea value={form.description} onChange={set('description')} rows={6} required maxLength={5000} />
        </div>

        {/* Images */}
        <div>
          <Label>Slike (max 10)</Label>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {existingImages.map((img) => (
                <div key={img.id} className="relative w-24 h-24 rounded border overflow-hidden">
                  <img src={img.thumbnail_url || img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New images */}
          {newPreviews.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {newPreviews.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded border border-green-300 overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {existingImages.length + newImages.length < 10 && (
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center mt-2 hover:border-primary transition-colors cursor-pointer"
              onClick={() => document.getElementById('editImageInput').click()}
            >
              <ImagePlus className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm text-muted-foreground">Dodaj slike</p>
              <input
                id="editImageInput"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addImages(e.target.files)}
              />
            </div>
          )}
        </div>

        {/* Price */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label>Cena</Label>
            <Input
              type="number"
              value={form.price}
              onChange={set('price')}
              disabled={['free', 'contact', 'exchange'].includes(form.price_type)}
            />
          </div>
          <div>
            <Label>Valuta</Label>
            <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.currency} onChange={set('currency')}>
              <option value="RSD">RSD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Tip cene</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {[
              { value: 'fixed', label: 'Fiksna' },
              { value: 'negotiable', label: 'Po dogovoru' },
              { value: 'contact', label: 'Na upit' },
              { value: 'free', label: 'Besplatno' },
              { value: 'exchange', label: 'Zamjena' },
            ].map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={form.price_type === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setForm({ ...form, price_type: opt.value })}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div>
          <Label>Stanje</Label>
          <div className="flex gap-2 mt-1">
            {[
              { value: '', label: 'Nije primenljivo' },
              { value: 'new', label: 'Novo' },
              { value: 'used', label: 'Korišćeno' },
              { value: 'refurbished', label: 'Obnovljeno' },
            ].map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={form.condition === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setForm({ ...form, condition: opt.value })}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <Label>Grad *</Label>
          <Input value={form.city} onChange={set('city')} required />
        </div>

        <div>
          <Label>Kontakt telefon</Label>
          <Input value={form.contact_phone} onChange={set('contact_phone')} />
        </div>

        {/* Dynamic meta fields */}
        {metaFields.length > 0 && (
          <div className="space-y-4 p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold text-sm">Detalji</h3>
            <div className="grid grid-cols-2 gap-4">
              {metaFields.map((field) => (
                <div key={field.name}>
                  <Label>{field.label}</Label>
                  {field.type === 'select' ? (
                    <select
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                      value={form.meta[field.name] || ''}
                      onChange={(e) => setMeta(field.name, e.target.value)}
                    >
                      <option value="">Izaberi...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={form.meta[field.name] || ''}
                      onChange={(e) => setMeta(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base" disabled={saving}>
          {saving ? 'Čuvanje...' : 'Sačuvaj izmjene'}
        </Button>
      </form>
    </div>
  )
}
