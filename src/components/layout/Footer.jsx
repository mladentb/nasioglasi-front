import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">NašiOglasi</h3>
            <p className="text-sm text-muted-foreground">
              Besplatni oglasi za Srbiju.
              Postavi oglas besplatno, obnovi besplatno.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Linkovi</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Početna</Link>
              <Link to="/pretraga" className="hover:text-foreground">Pretraga</Link>
              <Link to="/novi-oglas" className="hover:text-foreground">Postavi oglas</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Kontakt</h4>
            <div className="text-sm text-muted-foreground">
              <p>info@nasioglasi.net</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NašiOglasi.net — Sva prava zadržana
        </div>
      </div>
    </footer>
  )
}
