export function listingUrl(listing) {
  const catSlug = listing.category?.slug || listing.category_slug || 'oglas'
  return `/kategorija/${catSlug}/${listing.slug}`
}
