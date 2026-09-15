import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ListingDetailPage from './ListingDetailPage'
import CategoryPage from './CategoryPage'
import { categoriesApi } from '@/api/endpoints'

export default function ListingOrCategoryPage() {
  const { slug, child } = useParams()
  const [isCategory, setIsCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if 'child' matches a category slug
    categoriesApi.list().then((res) => {
      const allSlugs = new Set()
      for (const cat of res.data) {
        allSlugs.add(cat.slug)
        for (const ch of (cat.children || [])) {
          allSlugs.add(ch.slug)
        }
      }
      setIsCategory(allSlugs.has(child))
      setLoading(false)
    })
  }, [child])

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground">Učitavanje...</div>
  }

  if (isCategory) {
    return <CategoryPage />
  }

  // It's a listing - pass child as the slug
  return <ListingDetailPage listingSlug={child} />
}
