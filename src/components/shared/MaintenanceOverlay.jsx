import { Construction, Wrench } from 'lucide-react'

export default function MaintenanceOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
      <div className="max-w-md text-center px-6">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Construction className="h-10 w-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Sajt u izradi</h1>
        <p className="text-muted-foreground text-lg mb-6">
          {message || 'Sajt je trenutno u izradi. Uskoro smo tu!'}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Wrench className="h-4 w-4" />
          <span>NašiOglasi.net</span>
        </div>
      </div>
    </div>
  )
}
