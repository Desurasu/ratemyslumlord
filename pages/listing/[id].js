import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import ReportModal from '../../components/ReportModal'

const FLAG_COLORS = {
  'Deposit withheld': 'bg-red-50 text-red-700',
  'Pet rent + deposit double-dip': 'bg-orange-50 text-orange-700',
  'Retaliation': 'bg-red-50 text-red-700',
  'Harassment': 'bg-red-50 text-red-700',
  'Mold / habitability': 'bg-red-50 text-red-700',
  'No notice entry': 'bg-amber-50 text-amber-700',
  'Illegal fees': 'bg-amber-50 text-amber-700',
  'Ignored maintenance': 'bg-amber-50 text-amber-700',
}

const REVIEWS_PER_PAGE = 10

function Stars({ rating, size = 'md' }) {
  const num = Number(rating) || 0
  const r = Math.min(5, Math.max(0, Math.round(num)))
  const cls = size === 'lg' ? 'text-2xl' : 'text-sm'
  return <span className={`text-brand ${cls}`}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="w-16 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-brand h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-4 shrink-0">{count}</span>
    </div>
  )
}

export default function ListingDetail({ toggleDark, dark }) {
  const router = useRouter()
  const { id } = router.query
  const [listing, setListing] = useState(null)
  const [reviews, setReviews] = useState([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [reviewPage, setReviewPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  async function loadListing() {
    const { data } = await supabase.from('listings').select('*').eq('id', id).single()
    setListing(data)
  }

  async function loadReviews(p = 0) {
    setReviewsLoading(true)
    const from = p * REVIEWS_PER_PAGE
    const to = from + REVIEWS_PER_PAGE - 1
    const { data, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('listing_id', id)
      .order('created_at', { ascending: false })
      .range(from, to)
    setReviews(data || [])
    setTotalReviews(count || 0)
    setReviewPage(p)
    setReviewsLoading(false)
  }

  useEffect(() => {
    if (!id) return
    async function init() {
      setLoading(true)
      await Promise.all([loadListing(), loadReviews(0)])
      setLoading(false)
    }
    init()
  }, [id])

  async function handleSuccess() {
    await Promise.all([loadListing(), loadReviews(0)])
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: listing?.landlord_name, url })
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Listing not found.</p>
    </div>
  )

  const name = listing.landlord_name || listing.name
  const address = listing.property_address || listing.address || ''
  const location = [listing.city, listing.state].filter(Boolean).join(', ')
  const typeLabel = listing.type === 'pm' ? 'Management company' : listing.type === 'property' ? 'Apartment / complex' : 'Individual landlord'
  const ratingColor = listing.rating <= 2 ? 'text-red-600' : listing.rating <= 3 ? 'text-amber-600' : 'text-green-600'
  const breakdown = [5,4,3,2,1].map(n => ({
    label: '★'.repeat(n),
    count: reviews.filter(r => Math.round(r.rating) === n).length
  }))
  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE)

  return (
    <>
      <Head>
        <title>{name} — RateMySlumlord</title>
        <meta name="description" content={`Read ${listing.reviews} review${listing.reviews !== 1 ? 's' : ''} for ${name} at ${address}. Rated ${listing.rating}/5 on RateMySlumlord.`} />
        <meta property="og:title" content={`${name} — RateMySlumlord`} />
        <meta property="og:description" content={`Rated ${listing.rating}/5 · ${listing.reviews} reviews · ${address}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
            <button onClick={() => router.push('/')} className="flex items-baseline gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              ← <span className="font-bold text-gray-900">RateMy</span><span className="font-bold text-brand">Slumlord</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={toggleDark} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors text-base">
                {dark ? '☀️' : '🌙'}
              </button>
              <button onClick={handleShare} className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                {copied ? '✓ Copied' : 'Share ↗'}
              </button>
              <button onClick={() => setShowModal(true)}
                className="bg-brand text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors font-medium">
                + Review
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">
          {/* Main card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{typeLabel}</p>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{name}</h1>
                {address && <p className="text-gray-500 text-sm mt-1">{address}</p>}
                {location && <p className="text-gray-400 text-sm">{location}</p>}
              </div>
              <div className="text-center shrink-0">
                <p className={`text-4xl font-bold ${ratingColor}`}>{Number(listing.rating).toFixed(1)}</p>
                <Stars rating={listing.rating} size="lg" />
                <p className="text-xs text-gray-400 mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="mt-5 space-y-1.5">
              {breakdown.map(b => (
                <RatingBar key={b.label} label={b.label} count={b.count} total={reviews.length} />
              ))}
            </div>

            {/* Deposit stat */}
            {listing.deposit_lost > 0 && (
              <div className="mt-5 bg-red-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-700">${listing.deposit_lost.toLocaleString()}</p>
                <p className="text-xs text-red-500 mt-0.5">total deposits reported lost</p>
              </div>
            )}

            {/* Flags */}
            {listing.flags?.length > 0 && (
              <div className="mt-5">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Reported issues</p>
                <div className="flex flex-wrap gap-2">
                  {listing.flags.map(f => (
                    <span key={f} className={`text-xs px-3 py-1.5 rounded-full font-medium ${FLAG_COLORS[f] || 'bg-gray-100 text-gray-600'}`}>{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {totalReviews} Review{totalReviews !== 1 ? 's' : ''}
              </h2>
              {totalReviews > 0 && (
                <p className="text-xs text-gray-400">
                  Page {reviewPage + 1} of {totalPages}
                </p>
              )}
            </div>

            {reviewsLoading ? (
              <div className="text-center py-8 text-gray-300 text-sm">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                <p className="text-gray-400 text-sm">No reviews yet.</p>
                <button onClick={() => setShowModal(true)} className="mt-2 text-brand text-sm hover:underline font-medium">Add the first review →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Stars rating={r.rating} />
                        {r.unit_number && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Unit {r.unit_number}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {r.review_text && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{r.review_text}</p>}
                    {r.deposit_lost > 0 && (
                      <p className="text-xs text-red-600 mt-2 font-medium">💸 ${r.deposit_lost.toLocaleString()} deposit lost</p>
                    )}
                    {r.flags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.flags.map(f => (
                          <span key={f} className={`text-xs px-2 py-0.5 rounded-full ${FLAG_COLORS[f] || 'bg-gray-100 text-gray-600'}`}>{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Review pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => loadReviews(reviewPage - 1)} disabled={reviewPage === 0}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-600 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">{reviewPage + 1} / {totalPages}</span>
                <button onClick={() => loadReviews(reviewPage + 1)} disabled={reviewPage >= totalPages - 1}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-600 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>

        <footer className="border-t border-gray-100 mt-12 py-8">
          <div className="max-w-3xl mx-auto px-5 text-center text-xs text-gray-400">
            Reviews reflect personal tenant experiences. RateMySlumlord does not verify individual claims.
          </div>
        </footer>
      </div>

      {showModal && <ReportModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
    </>
  )
}
