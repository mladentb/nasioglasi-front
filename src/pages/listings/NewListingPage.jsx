import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, ImagePlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { categoriesApi, listingsApi } from '@/api/endpoints'

export default function NewListingPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [metaFields, setMetaFields] = useState([])
  const [images, setImages] = useState([]) // File objects
  const [previews, setPreviews] = useState([]) // Preview URLs
  const [loading, setLoading] = useState(false)
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

  // When category changes, load meta fields
  useEffect(() => {
    if (!form.category_id) {
      setMetaFields([])
      setSelectedCategory(null)
      return
    }
    for (const cat of categories) {
      for (const child of (cat.children || [])) {
        if (String(child.id) === String(form.category_id)) {
          setSelectedCategory(child)
          setMetaFields(child.meta_fields || [])
          return
        }
      }
    }
  }, [form.category_id, categories])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const setMeta = (name, value) => {
    setForm({ ...form, meta: { ...form.meta, [name]: value } })
  }

  // Image handling
  const handleImageDrop = useCallback((e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer?.files || e.target.files || [])
    addImages(files)
  }, [images])

  const addImages = (files) => {
    const newFiles = files.filter((f) => f.type.startsWith('image/')).slice(0, 10 - images.length)
    setImages((prev) => [...prev, ...newFiles])

    newFiles.forEach((file) => {
      const url = URL.createObjectURL(file)
      setPreviews((prev) => [...prev, url])
    })
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Create listing
      const data = { ...form }
      if (!data.price) delete data.price
      if (!data.condition) delete data.condition
      if (!data.contact_phone) delete data.contact_phone
      if (Object.keys(data.meta).length === 0) delete data.meta

      const res = await listingsApi.create(data)
      const listingId = res.data.id

      // Upload images
      if (images.length > 0) {
        const formData = new FormData()
        images.forEach((file) => formData.append('images[]', file))
        await listingsApi.uploadImages(listingId, formData)
      }

      navigate(`/kategorija/${res.data.category?.slug || 'oglas'}/${res.data.slug}`)
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setErrors({ general: [err.response?.data?.message || 'Greška pri kreiranju oglasa.'] })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Postavi oglas</h1>

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
          {errors.category_id && <p className="text-destructive text-xs mt-1">{errors.category_id[0]}</p>}
        </div>

        {/* Title */}
        <div>
          <Label>Naslov *</Label>
          <Input value={form.title} onChange={set('title')} placeholder="Npr. iPhone 15 Pro, 256GB" required maxLength={255} />
          {errors.title && <p className="text-destructive text-xs mt-1">{errors.title[0]}</p>}
        </div>

        {/* Description */}
        <div>
          <Label>Opis *</Label>
          <Textarea value={form.description} onChange={set('description')} rows={6} placeholder="Detaljno opišite artikal..." required maxLength={5000} />
          {errors.description && <p className="text-destructive text-xs mt-1">{errors.description[0]}</p>}
        </div>

        {/* Images */}
        <div>
          <Label>Slike (max 10)</Label>
          <div
            onDrop={handleImageDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => document.getElementById('imageInput').click()}
          >
            <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Prevuci slike ovdje ili klikni za upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP - max 5MB po slici
            </p>
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageDrop}
            />
          </div>

          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {previews.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded border overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
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
              placeholder="0.00"
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
          <Input value={form.city} onChange={set('city')} placeholder="Npr. Beograd" required />
        </div>

        {/* Contact phone */}
        <div>
          <Label>Kontakt telefon (opcionalno, ako se razlikuje od profila)</Label>
          <Input value={form.contact_phone} onChange={set('contact_phone')} placeholder="+381..." />
        </div>

        {/* Dynamic meta fields */}
        {metaFields.length > 0 && (
          <div className="space-y-4 p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold text-sm">Detalji za {selectedCategory?.name}</h3>
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
                      placeholder={field.label}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? 'Postavljanje...' : 'Postavi oglas — Besplatno!'}
        </Button>
      </form>
    </div>
  )
}
