import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import useAuthStore from '@/store/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    city: '',
    country: 'RS',
    user_type: 'individual',
    company_name: '',
    pib: '',
    maticni_broj: '',
    company_address: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setErrors({ general: [err.response?.data?.message || 'Greška pri registraciji.'] })
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const isCompany = form.user_type === 'company'

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-6">Registracija</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded text-sm">{errors.general[0]}</div>
        )}

        {/* User type toggle */}
        <div>
          <Label>Tip naloga *</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => setForm({ ...form, user_type: 'individual' })}
              className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition-colors ${
                !isCompany ? 'border-primary bg-primary/5 text-primary' : 'border-border'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="font-medium text-sm">Fizičko lice</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, user_type: 'company' })}
              className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition-colors ${
                isCompany ? 'border-primary bg-primary/5 text-primary' : 'border-border'
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span className="font-medium text-sm">Pravno lice</span>
            </button>
          </div>
        </div>

        <div>
          <Label>{isCompany ? 'Kontakt osoba *' : 'Ime i prezime *'}</Label>
          <Input value={form.name} onChange={set('name')} required />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name[0]}</p>}
        </div>

        {/* Company fields */}
        {isCompany && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-sm text-blue-800">Podaci o firmi</h3>
            <div>
              <Label>Naziv firme *</Label>
              <Input value={form.company_name} onChange={set('company_name')} required={isCompany} />
              {errors.company_name && <p className="text-destructive text-xs mt-1">{errors.company_name[0]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>PIB</Label>
                <Input value={form.pib} onChange={set('pib')} placeholder="123456789" />
              </div>
              <div>
                <Label>Matični broj</Label>
                <Input value={form.maticni_broj} onChange={set('maticni_broj')} placeholder="12345678" />
              </div>
            </div>
            <div>
              <Label>Adresa firme</Label>
              <Input value={form.company_address} onChange={set('company_address')} />
            </div>
          </div>
        )}

        <div>
          <Label>Email *</Label>
          <Input type="email" value={form.email} onChange={set('email')} required />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email[0]}</p>}
        </div>

        <div>
          <Label>Telefon *</Label>
          <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="+381..." required />
          {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone[0]}</p>}
        </div>

        {/* Srbija only */}

        <div>
          <Label>Grad</Label>
          <Input value={form.city} onChange={set('city')} placeholder="Npr. Beograd" />
        </div>

        <div>
          <Label>Lozinka *</Label>
          <Input type="password" value={form.password} onChange={set('password')} required />
          {errors.password && <p className="text-destructive text-xs mt-1">{errors.password[0]}</p>}
        </div>

        <div>
          <Label>Potvrdi lozinku *</Label>
          <Input type="password" value={form.password_confirmation} onChange={set('password_confirmation')} required />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Registracija...' : 'Registruj se'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Već imaš nalog?{' '}
        <Link to="/prijava" className="text-primary hover:underline">Prijavi se</Link>
      </p>
    </div>
  )
}
