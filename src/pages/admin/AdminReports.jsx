import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { adminApi } from '@/api/endpoints'
import useAuthStore from '@/store/auth'

const reasonLabels = {
  spam: 'Spam',
  fraud: 'Prevara',
  inappropriate: 'Neprimjeren sadržaj',
  wrong_category: 'Pogrešna kategorija',
  other: 'Ostalo',
}

export default function AdminReports() {
  const { user } = useAuthStore()
  const [reports, setReports] = useState([])
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminApi.reports({ status: status || undefined }).then((res) => {
      setReports(res.data.data)
      setLoading(false)
    })
  }

  useEffect(load, [status])

  if (!user?.is_admin) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-destructive">Nemate pristup.</div>
  }

  const handleResolve = async (id, newStatus) => {
    await adminApi.updateReport(id, { status: newStatus })
    load()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Prijave</h1>
        <Link to="/admin" className="text-sm text-primary hover:underline">&larr; Dashboard</Link>
      </div>

      <div className="flex gap-2 mb-6">
        {['pending', 'reviewed', 'resolved', ''].map((s) => (
          <Button key={s} variant={status === s ? 'default' : 'outline'} size="sm" onClick={() => setStatus(s)}>
            {s === '' ? 'Sve' : s === 'pending' ? 'Na čekanju' : s === 'reviewed' ? 'Pregledano' : 'Rešeno'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nema prijava.</div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{reasonLabels[report.reason] || report.reason}</Badge>
                    <Badge variant={report.status === 'pending' ? 'destructive' : 'outline'}>{report.status}</Badge>
                  </div>
                  <p className="text-sm">
                    Oglas: <Link to={`/kategorija/oglas/${report.listing?.slug}`} className="text-primary hover:underline">
                      {report.listing?.title}
                    </Link>
                  </p>
                  {report.user && (
                    <p className="text-xs text-muted-foreground mt-1">Prijavio: {report.user.name}</p>
                  )}
                  {report.description && (
                    <p className="text-sm text-muted-foreground mt-2 italic">"{report.description}"</p>
                  )}
                </div>
                <div className="flex gap-1">
                  {report.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleResolve(report.id, 'reviewed')}>
                        <Eye className="h-4 w-4 mr-1" /> Pregledano
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleResolve(report.id, 'resolved')}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Rešeno
                      </Button>
                    </>
                  )}
                  {report.status === 'reviewed' && (
                    <Button variant="outline" size="sm" onClick={() => handleResolve(report.id, 'resolved')}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Rešeno
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
