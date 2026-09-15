import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authApi } from '@/api/endpoints'
import useAuthStore from '@/store/auth'

export default function VerifyPhonePage() {
  const navigate = useNavigate()
  const { user, fetchUser } = useAuthStore()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [verified, setVerified] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (user?.phone_verified_at) {
      setVerified(true)
    }
  }, [user])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    if (newCode.every((d) => d !== '')) {
      submitCode(newCode.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setCode(newCode)
      submitCode(pasted)
    }
  }

  const submitCode = async (codeStr) => {
    setError('')
    setLoading(true)
    try {
      await authApi.verifyPhone(codeStr)
      await fetchUser()
      setVerified(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Nevažeći kod.')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await authApi.resendCode()
      setResendCooldown(120)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Greška.')
    }
  }

  if (verified) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Telefon verifikovan!</h1>
        <p className="text-muted-foreground mb-6">Vaš broj je uspešno potvrđen.</p>
        <Button onClick={() => navigate('/')}>Nazad na početnu</Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Verifikacija telefona</h1>
      <p className="text-muted-foreground mb-8">
        Poslali smo 6-cifreni kod na <strong>{user?.phone}</strong>
      </p>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded text-sm mb-6">{error}</div>
      )}

      {/* Code inputs */}
      <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-2xl font-bold border-2 border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
            disabled={loading}
          />
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">Provjera koda...</p>}

      <div className="space-y-3">
        <Button
          variant="ghost"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-sm"
        >
          {resendCooldown > 0
            ? `Pošalji ponovo za ${resendCooldown}s`
            : 'Pošalji kod ponovo'}
        </Button>
      </div>
    </div>
  )
}
