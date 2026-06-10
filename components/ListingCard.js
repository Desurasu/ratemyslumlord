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
  const r = Math.round(rating)
  return (
    <span className="text-brand text-sm">
      {'★'.repeat(r)}{'☆'.repeat(5 - r)}
    </span>
  )
}

export default function ListingCard({ listing }) {
  const typeLabel = listing.type === 'pm' ? 'Mgmt company' : listing.type === 'property' ? 'Property' : 'Landlord'
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start gap-3">
        <div>
          <p className="font-500 text-gray-900">{listing.name}</p>
          <p className="text-sm text-gray-400 mt-0.5">{listing.address} · {typeLabel}</p>
        </div>
        <div className="text-right shrink-0">
          <Stars rating={listing.rating} />
          <p className="text-xs text-gray-400 mt-0.5">{listing.rating?.toFixed(1)} / 5</p>
        </div>
      </div>
      {listing.flags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {listing.flags.map(f => (
            <span key={f} className={`text-xs px-2.5 py-1 rounded-full font-500 ${FLAG_COLORS[f] || 'bg-gray-100 text-gray-600'}`}>{f}</span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">
        {listing.reviews} review{listing.reviews !== 1 ? 's' : ''}
        {listing.deposit_lost > 0 && ` · $${listing.deposit_lost.toLocaleString()} in deposits reported`}
      </p>
    </div>
  )
}
