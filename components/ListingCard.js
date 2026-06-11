import { useRouter } from 'next/router'

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

function Stars({ rating }) {
  const r = Math.round(parseFloat(rating) || 0)
  return <span className="text-brand text-sm">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
}

function RatingBar({ rating }) {
  const r = parseFloat(rating) || 0
  const color = r <= 2 ? 'bg-red-500' : r <= 3 ? 'bg-amber-500' : 'bg-green-500'
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${(r / 5) * 100}%` }} />
    </div>
  )
}

export default function ListingCard({ listing }) {
  const router = useRouter()
  const typeLabel = listing.type === 'pm' ? 'Mgmt company' : listing.type === 'property' ? 'Apartment/complex' : 'Individual landlord'
  const location = [listing.city, listing.state].filter(Boolean).join(', ') || listing.property_address || listing.address || ''

  function handleShare(e) {
    e.stopPropagation()
    const url = `${window.location.origin}/listing/${listing.id}`
    if (navigator.share) {
      navigator.share({ title: listing.landlord_name || listing.name, url })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied!')
    }
  }

  return (
    <div
      className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors cursor-pointer"
      onClick={() => router.push(`/listing/${listing.id}`)}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{listing.landlord_name || listing.name}</p>
          <p className="text-sm text-gray-400 mt-0.5 truncate">{listing.property_address || ''}</p>
          <p className="text-xs text-gray-400 mt-0.5">{location} · {typeLabel}</p>
        </div>
        <div className="text-right shrink-0">
          <Stars rating={listing.rating} />
          <p className="text-xs text-gray-400 mt-0.5">{listing.rating?.toFixed(1)} / 5</p>
          <RatingBar rating={listing.rating} />
        </div>
      </div>

      {listing.flags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {listing.flags.slice(0, 4).map(f => (
            <span key={f} className={`text-xs px-2.5 py-1 rounded-full font-medium ${FLAG_COLORS[f] || 'bg-gray-100 text-gray-600'}`}>{f}</span>
          ))}
          {listing.flags.length > 4 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">+{listing.flags.length - 4} more</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-400">
          {listing.reviews} review{listing.reviews !== 1 ? 's' : ''}
          {listing.deposit_lost > 0 && ` · $${listing.deposit_lost.toLocaleString()} in deposits`}
        </p>
        <button onClick={handleShare} className="text-xs text-gray-400 hover:text-brand transition-colors px-2 py-1 rounded hover:bg-gray-50">
          Share ↗
        </button>
      </div>
    </div>
  )
}
