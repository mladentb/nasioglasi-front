import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import { categoriesApi, searchApi } from '@/api/endpoints'

export default function CategoryPage() {
  const { slug, child } = useParams()
  const [category, setCategory] = useState(null)
  const [listings, setListings] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const activeSlug = child || slug

  useEffect(() => {
    setLoading(true)
    categoriesApi.list().then((res) => {
      const cats = res.data
      let found = null
      for (const c of cats) {
        if (c.slug === activeSlug) { found = c; break }
        for (const ch of (c.children || [])) {
          if (ch.slug === activeSlug) { found = { ...ch, parent: c }; break }
        }
        if (found) break
      }
      setCategory(found)
    })
  }, [activeSlug])

  useEffect(() => {
    setLoading(true)
    searchApi.search({ category: activeSlug, page, per_page: 24 }).then((res) => {
      setListings(res.data.data)
      setTotal(res.data.total)
      setLoading(false)
    })
  }, [activeSlug, page])

  if (!category && !loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground">Kategorija nije pronađena.</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">Početna</Link>
        <ChevronRight className="h-4 w-4" />
        {category?.parent && (
          <>
            <Link to={`/kategorija/${category.parent.slug}`} className="hover:text-foreground">
              {category.parent.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground font-medium">{category?.name}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-2">{category?.name}</h1>
      <p className="text-sm text-muted-foreground mb-6">{total} oglasa</p>

      {/* Subcategories */}
      {category?.children?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category.children.map((sub) => (
            <Link
              key={sub.id}
              to={`/kategorija/${slug}/${sub.slug}`}
              className="px-3 py-1.5 text-sm border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Listings grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Nema oglasa u ovoj kategoriji.
        </div>
      )}

      {/* Pagination */}
      {total > 24 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Prethodna
          </button>
          <span className="px-4 py-2 text-sm">
            Strana {page} od {Math.ceil(total / 24)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 24 >= total}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Sljedeća
          </button>
        </div>
      )}
    </div>
  )
}
