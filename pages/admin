import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'changeme123'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [reviews, setReviews] = useState([])
  const [listings, setListings] = useState([])
  const [tab, setTab] = useState('reviews')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  function login() {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      sessionStorage.setItem('admin', '1')
    } else {
      setMsg('Wrong password.')
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('admin')) setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchAll()
  }, [authed])

  async function fetchAll() {
    setLoading(true)
    const [{ data: r }, { data: l }] = await Promise.all([
      supabase.from('reviews').select('*, listings(landlord_name, property_address)').order('created_at', { ascending: false }),
      supabase.from('listings').select('*').order('created_at', { ascending: false }),
    ])
    setReviews(r || [])
    setListings(l || [])
    setLoading(false)
  }

  async function deleteReview(id) {
    if (!confirm('Delete this review?')) return
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
    setMsg('Review deleted.')
    setTimeout(() => setMsg(''), 3000)
  }

  async function deleteListing(id) {
    if (!confirm('Delete this listing AND all its reviews?')) return
    await supabase.from('reviews').delete().eq('listing_id', id)
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
    setMsg('Listing deleted.')
    setTimeout(() => setMsg(''), 3000)
  }

  if (!authed) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Admin</h1>
        {msg && <p className="text-red-600 text-sm mb-4">{msg}</p>}
        <input
          type="password"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-brand"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
        />
        <button onClick={login} className="w-full bg-brand text-white py-2 rounded-lg text-sm font-medium">
          Login
        </button>
      </div>
    </div>
  )

  return (
    <>
      <Head><title>Admin — RateMySlumlord</title></Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900">RateMy</span>
              <span className="font-bold text-brand">Slumlord</span>
              <span className="text-gray-400 text-sm ml-2">Admin</span>
            </div>
            <div className="flex items-center gap-3">
              {msg && <span className="text-sm text-green-600">{msg}</span>}
              <button onClick={() => { sessionStorage.removeItem('admin'); setAuthed(false) }}
                className="text-sm text-gray-400 hover:text-gray-600">Logout</button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
              <p className="text-xs text-gray-400">Listings</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              <p className="text-xs text-gray-400">Reviews</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {['reviews', 'listings'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-sm px-4 py-1.5 rounded-full border transition-colors capitalize ${
                  tab === t ? 'bg-brand text-white border-brand' : 'bg-white text-gray-500 border-gray-200'
                }`}>{t}</button>
            ))}
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm text-center py-12">Loading...</p>
          ) : tab === 'reviews' ? (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {r.listings?.landlord_name || 'Unknown'} — {r.listings?.property_address || ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {'★'.repeat(Math.round(r.rating || 0))} · {new Date(r.created_at).toLocaleDateString()}
                        {r.deposit_lost > 0 && ` · $${r.deposit_lost.toLocaleString()} lost`}
                      </p>
                      {r.review_text && <p className="text-sm text-gray-600 mt-2">{r.review_text}</p>}
                      {r.flags?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">{r.flags.join(', ')}</p>
                      )}
                    </div>
                    <button onClick={() => deleteReview(r.id)}
                      className="shrink-0 text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map(l => (
                <div key={l.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{l.landlord_name || l.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {l.property_address || l.address} · {[l.city, l.state].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {l.reviews} review{l.reviews !== 1 ? 's' : ''} · {'★'.repeat(Math.round(l.rating || 0))} {l.rating?.toFixed(1)}
                        {l.deposit_lost > 0 && ` · $${l.deposit_lost.toLocaleString()} deposits`}
                      </p>
                    </div>
                    <button onClick={() => deleteListing(l.id)}
                      className="shrink-0 text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      Delete all
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
