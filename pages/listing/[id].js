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

function Stars({ rating, size = 'md' }) {
  const r = Math.round(rating)
  const cls = size === 'lg' ? 'text-2xl' : 'text-sm'
  return <span className={`text-brand ${cls}`}>{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="w-16 text-right">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-brand h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-4">{count}</span>
    </div>
  )
}

export default function ListingDetail({ toggleDark, dark }) {
  const router = useRouter()
  const { id } = router.query
  const [listing, setListing] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [{ data: l }, { data: r }] = await Promise.all([
        supabase.from('listings').select('*').eq('id', id).single(),
        supabase.from('reviews').select('*').eq('listing_id', id).order('created_at', { ascending: false }),
      ])
      setListing(l)
      setReviews(r || [])
      setLoading(false)
    }
    load()
  }, [id])

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

  async function handleSuccess() {
    // Refetch data without full page reload
    const [{ data: l }, { data: r }] = await Promise.all([
      supabase.from('listings').select('*').eq('id', id).single(),
      supabase.from('reviews').select('*').eq('listing_id', id).order('created_at', { ascending: false }),
    ])
    setListing(l)
    setReviews(r || [])
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

  // Rating breakdown
  const breakdown = [5,4,3,2,1].map(n => ({
    label: '★'.repeat(n),
    count: reviews.filter(r => Math.round(r.rating) === n).length
  }))

  const ratingColor = listing.rating <= 2 ? 'text-red-600' : listing.rating <= 3 ? 'text-amber-600' : 'text-green-600'

  return (
    <>
      <Head>
        <title>{name} — RateMySlumlord</title>
        <meta name="description" content={`Read ${listing.reviews} review${listing.reviews !== 1 ? 's' : ''} for ${name} at ${address}. Rated ${listing.rating}/5 on RateMySlumlord.`} />
        <meta property="og:title" content={`${name} — RateMySlumlord`} />
        <meta property="og:description" content={`Rated ${listing.rating}/5 · ${listing.reviews} reviews · ${address}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
              ← <span className="font-bold text-gray-900">RateMy</span><span className="font-bold text-brand">Slumlord</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={toggleDark} className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg border border-gray-200 text-sm">
                {dark ? '☀️' : '🌙'}
              </button>
              <button onClick={handleShare} className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                {copied ? 'Copied!' : 'Share ↗'}
              </button>
              <button onClick={() => setShowModal(true)}
                className="bg-brand text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors font-medium">
                + Add review
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {/* Main card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{typeLabel}</p>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{name}</h1>
                {address && <p className="text-gray-500 text-sm mt-1">{address}</p>}
                {location && <p className="text-gray-400 text-sm">{location}</p>}
              </div>
              <div className="text-center shrink-0">
                <p className={`text-4xl font-bold ${ratingColor}`}>{listing.rating?.toFixed(1)}</p>
                <Stars rating={listing.rating} size="lg" />
                <p className="text-xs text-gray-400 mt-1">{listing.reviews} review{listing.reviews !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="mt-5 space-y-1.5">
              {breakdown.map(b => (
                <RatingBar key={b.label} label={b.label} count={b.count} total={reviews.length} />
              ))}
            </div>

            {/* Stats */}
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
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
            </h2>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                <p className="text-gray-400 text-sm">No individual reviews yet.</p>
                <button onClick={() => setShowModal(true)} className="mt-2 text-brand text-sm hover:underline">Add the first review →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex justify-between items-start">
                      <Stars rating={r.rating} />
                      <span className="text-xs text-gray-400">
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
          </div>
        </div>

        <footer className="border-t border-gray-100 mt-12 py-8">
          <div className="max-w-3xl mx-auto px-4 text-center text-xs text-gray-400">
            <p>Reviews reflect personal tenant experiences. RateMySlumlord does not verify individual claims.</p>
          </div>
        </footer>
      </div>

      {showModal && <ReportModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
    </>
  )
}
