import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { profileApi } from '@/api/endpoints'
import useAuthStore from '@/store/auth'

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore()
  const [form, setForm] = useState({
    name: user?.name || '',
    city: user?.city || '',
    country: user?.country || 'RS',
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    try {
      await profileApi.update(form)
      await fetchUser()
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Greška.')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Moj profil</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded text-sm">Profil ažuriran!</div>}
        {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded text-sm">{error}</div>}

        <div>
          <Label>Email</Label>
          <Input value={user?.email || ''} disabled className="bg-muted" />
        </div>

        <div>
          <Label>Telefon</Label>
          <Input value={user?.phone || ''} disabled className="bg-muted" />
          {user?.phone_verified_at ? (
            <p className="text-green-600 text-xs mt-1">Verifikovan</p>
          ) : (
            <p className="text-amber-600 text-xs mt-1">Nije verifikovan</p>
          )}
        </div>

        <div>
          <Label>Ime i prezime</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <Label>Grad</Label>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>


        <Button type="submit" className="w-full">Sačuvaj izmjene</Button>
      </form>
    </div>
  )
}
