import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'


// Strip PII and sanitize input
function sanitize(str) {
  if (!str) return ''
  return str
    // Remove phone numbers
    .replace(/(\+?1?\s?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g, '[phone removed]')
    // Remove emails
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[email removed]')
    // Remove SSNs
    .replace(/\d{3}-\d{2}-\d{4}/g, '[removed]')
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Trim excessive whitespace
    .trim()
    .slice(0, 5000)
}

function validateForm(form) {
  if (!form.landlord_name.trim() || form.landlord_name.trim().length < 3)
    return 'Landlord name must be at least 3 characters.'
  if (form.landlord_name.length > 200)
    return 'Landlord name is too long.'
  if (!form.property_address.trim() || form.property_address.trim().length < 5)
    return 'Please enter a valid property address.'
  if (form.property_address.length > 300)
    return 'Address is too long.'
  if (form.rating < 1 || form.rating > 5)
    return 'Rating must be between 1 and 5.'
  if (form.deposit_lost && parseInt(form.deposit_lost) > 99999)
    return 'Deposit amount seems too high. Please check.'
  if (form.review_text && form.review_text.length > 5000)
    return 'Review is too long (max 5000 characters).'
  return null
}

const FLAGS = [
  'Deposit withheld',
  'Pet rent + deposit double-dip',
  'No notice entry',
  'Ignored maintenance',
  'Illegal fees',
  'Mold / habitability',
  'Retaliation',
  'Harassment',
]

export default function ReportModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    landlord_name: '', property_address: '', city: '', state: '',
    type: 'landlord', rating: 1, review_text: '', deposit_lost: '', flags: [],
    honeypot: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [duplicate, setDuplicate] = useState(null)
  const debounceRef = useRef(null)

  function toggleFlag(f) {
    setForm(prev => ({
      ...prev,
      flags: prev.flags.includes(f) ? prev.flags.filter(x => x !== f) : [...prev.flags, f],
    }))
  }

  function handleAddressChange(val) {
    setForm(p => ({ ...p, property_address: val }))
    setDuplicate(null)
    clearTimeout(debounceRef.current)
    if (val.length < 4) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=us&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        setSuggestions(data.map(d => ({ display: d.display_name, lat: d.lat, lon: d.lon })))
      } catch { setSuggestions([]) }
    }, 400)
  }

  async function selectAddress(s) {
    // Nominatim US format: "123 Main St, City, County, State, ZIP, United States"
    // We want: street address (parts 0), city (find non-county, non-zip part), state abbrev
    const parts = s.display.split(',').map(p => p.trim())
    
    const streetAddress = parts[0] || ''
    
    // Find state: look for known US state names or abbreviations
    const US_STATES = {
      'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
      'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
      'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS',
      'Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD','Massachusetts':'MA',
      'Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO','Montana':'MT',
      'Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM',
      'New York':'NY','North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK',
      'Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC',
      'South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT',
      'Virginia':'VA','Washington':'WA','West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY'
    }
    
    let city = ''
    let state = ''
    
    for (let i = 1; i < parts.length; i++) {
      const p = parts[i]
      // Skip zip codes, "United States", counties
      if (/^\d{5}/.test(p) || p === 'United States') continue
      if (p.toLowerCase().includes('county')) continue
      
      // Check if it's a state name
      if (US_STATES[p]) {
        state = US_STATES[p]
        continue
      }
      // Check 2-letter state abbrev
      if (/^[A-Z]{2}$/.test(p)) {
        state = p
        continue
      }
      // First non-junk part after street = city
      if (!city && p.length > 1) {
        city = p
      }
    }
    
    setForm(p => ({ ...p, property_address: streetAddress, city, state }))
    setSuggestions([])
    
    // Only check duplicate if we have a real street address (more than 3 chars)
    if (streetAddress.length > 5) {
      const { data } = await supabase
        .from('listings')
        .select('id, landlord_name, rating, reviews')
        .ilike('property_address', `%${streetAddress}%`)
      if (data && data.length > 0) setDuplicate(data[0])
    }
  }

  async function submit() {
    // Honeypot check - bots fill hidden fields
    if (form.honeypot) return

    const validationError = validateForm(form)
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    // Check for exact duplicate
    const { data: existing } = await supabase
      .from('listings')
      .select('id, reviews, rating, flags, deposit_lost')
      .ilike('property_address', `%${form.property_address.trim()}%`)
      .ilike('landlord_name', `%${form.landlord_name.trim()}%`)

    if (existing && existing.length > 0) {
      const rec = existing[0]
      const newRating = ((rec.rating * rec.reviews) + parseFloat(form.rating)) / (rec.reviews + 1)
      const mergedFlags = [...new Set([...(rec.flags || []), ...form.flags])]
      const addedDeposit = form.deposit_lost ? parseInt(form.deposit_lost.replace(/\D/g, '')) : 0
      await supabase.from('listings').update({
        reviews: rec.reviews + 1,
        rating: Math.round(newRating * 10) / 10,
        flags: mergedFlags,
        deposit_lost: (rec.deposit_lost || 0) + addedDeposit,
      }).eq('id', rec.id)
      // Insert individual review
      await supabase.from('reviews').insert({
        listing_id: rec.id,
        rating: parseFloat(form.rating),
        review_text: form.review_text.trim(),
        deposit_lost: addedDeposit,
        flags: form.flags,
      })
      setLoading(false)
      onSuccess(); onClose(); return
    }

    const { data: newListing, error: err } = await supabase.from('listings').insert({
      landlord_name: sanitize(form.landlord_name),
      property_address: sanitize(form.property_address),
      city: sanitize(form.city),
      state: form.state.toUpperCase().slice(0, 2),
      type: form.type,
      rating: parseFloat(form.rating),
      review_text: sanitize(form.review_text),
      deposit_lost: form.deposit_lost ? Math.min(99999, parseInt(form.deposit_lost.replace(/\D/g, ''))) : 0,
      flags: form.flags,
      reviews: 1,
    }).select()

    if (err) { setError('Something went wrong. Try again.'); setLoading(false); return }

    // Insert first review
    if (newListing && newListing[0]) {
      await supabase.from('reviews').insert({
        listing_id: newListing[0].id,
        rating: parseFloat(form.rating),
        review_text: form.review_text.trim(),
        deposit_lost: form.deposit_lost ? parseInt(form.deposit_lost.replace(/\D/g, '')) : 0,
        flags: form.flags,
      })
    }

    setLoading(false)
    onSuccess(); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-xl mx-auto p-4 sm:p-6 shadow-xl my-4 sm:my-8 relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Report a landlord or property</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

        {duplicate && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
            ⚠️ <strong>{duplicate.landlord_name}</strong> already has {duplicate.reviews} review{duplicate.reviews !== 1 ? 's' : ''} at this address. Your review will be added to their profile.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Landlord / management company name *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
              value={form.landlord_name} onChange={e => setForm(p => ({ ...p, landlord_name: e.target.value }))}
              placeholder="e.g. Sunrise Property Management or John Smith" />
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-500 mb-1">Property address *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
              value={form.property_address}
              onChange={e => handleAddressChange(e.target.value)}
              placeholder="Start typing an address..."
              autoComplete="off" />
            {suggestions.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li key={i}
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    onMouseDown={() => selectAddress(s)}>
                    {s.display}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1">City</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                placeholder="Jacksonville" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">State</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                placeholder="FL" maxLength={2} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Type</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="landlord">Individual landlord</option>
                <option value="property">Apartment / complex</option>
                <option value="pm">Mgmt company</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Rating</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}>
                <option value={1}>⭐ 1 — Predatory</option>
                <option value={2}>⭐⭐ 2 — Bad</option>
                <option value={3}>⭐⭐⭐ 3 — Okay</option>
                <option value={4}>⭐⭐⭐⭐ 4 — Good</option>
                <option value={5}>⭐⭐⭐⭐⭐ 5 — Great</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">Red flags (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {FLAGS.map(f => (
                <button key={f} onClick={() => toggleFlag(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.flags.includes(f)
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>{f}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Your experience</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand resize-none h-24"
              value={form.review_text} onChange={e => setForm(p => ({ ...p, review_text: e.target.value }))}
              placeholder="What happened? Dates, dollar amounts, and specific details help other renters." />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Deposit amount lost (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-gray-400">$</span>
              <input className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-brand"
                value={form.deposit_lost} onChange={e => setForm(p => ({ ...p, deposit_lost: e.target.value }))}
                placeholder="2950" type="number" />
            </div>
          </div>
        </div>


        {/* Honeypot - hidden from real users */}
        <div style={{position:'absolute',left:'-9999px',opacity:0,pointerEvents:'none'}} aria-hidden="true">
          <input tabIndex={-1} autoComplete="off"
            value={form.honeypot} onChange={e => setForm(p => ({ ...p, honeypot: e.target.value }))}
            placeholder="Leave this blank" />
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={loading}
            className="px-5 py-2 text-sm text-white bg-brand rounded-lg hover:bg-brand-dark disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit report'}
          </button>
        </div>
      </div>
    </div>
  )
}
