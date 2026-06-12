import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import ReportModal from '../components/ReportModal'
import ListingCard from '../components/ListingCard'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Landlords', value: 'landlord' },
  { label: 'Apartments', value: 'property' },
  { label: 'Mgmt companies', value: 'pm' },
]

const SORTS = [
  { label: 'Most reviewed', value: 'reviews' },
  { label: 'Worst rated', value: 'rating' },
  { label: 'Newest', value: 'created_at' },
]

export default function Home({ toggleDark, dark }) {
  const [listings, setListings] = useState([])
  const [stats, setStats] = useState({ total: 0, reviews: 0, deposits: 0 })
  const [tab, setTab] = useState('all')
  const [sort, setSort] = useState('reviews')
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('listings').select('*')
    if (tab !== 'all') query = query.eq('type', tab)
    if (stateFilter) query = query.ilike('state', stateFilter)
    if (search.trim()) {
      const s = search.trim()
      query = query.or(
        `landlord_name.ilike.%${s}%,property_address.ilike.%${s}%,city.ilike.%${s}%,name.ilike.%${s}%,address.ilike.%${s}%,state.ilike.%${s}%`
      )
    }
    query = query.order(sort, { ascending: sort === 'rating' })
    const { data } = await query.limit(50)
    setListings(data || [])
    setLoading(false)
  }, [tab, sort, search, stateFilter])

  const fetchStats = async () => {
    const { data } = await supabase.from('listings').select('reviews, deposit_lost')
    if (!data) return
    setStats({
      total: data.length,
      reviews: data.reduce((a, d) => a + (d.reviews || 0), 0),
      deposits: data.reduce((a, d) => a + (d.deposit_lost || 0), 0),
    })
  }

  useEffect(() => { fetchListings() }, [fetchListings])
  useEffect(() => { fetchStats() }, [])

  function handleSuccess() { fetchListings(); fetchStats() }

  return (
    <>
      <Head>
        <title>RateMySlumlord — Rate your landlord. Warn your neighbors.</title>
        <meta name="description" content="The national database of predatory landlords, rental properties, and management companies. Read and submit reviews before you sign a lease." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="RateMySlumlord" />
        <meta property="og:description" content="Rate your landlord. Warn your neighbors." />
        <meta property="og:url" content="https://ratemyslumlord.us" />
      </Head>

      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
            <a href="/" className="flex items-baseline gap-0.5">
              <span className="font-bold text-gray-900 text-lg tracking-tight">RateMy</span>
              <span className="font-bold text-brand text-lg tracking-tight">Slumlord</span>
              <span className="text-gray-300 text-xs ml-0.5">.us</span>
            </a>
            <div className="flex items-center gap-2">
              <button onClick={toggleDark}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-base"
                title="Toggle dark mode">
                {dark ? '☀️' : '🌙'}
              </button>
              <button onClick={() => setShowModal(true)}
                className="bg-brand text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors font-medium">
                + Report
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-5 py-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              Rate your landlord.<br />
              <span className="text-brand">Warn your neighbors.</span>
            </h1>
            <p className="text-gray-400 mt-3 text-sm max-w-sm mx-auto leading-relaxed">
              The national database of predatory landlords and property managers. Look before you lease.
            </p>
            <div className="mt-6 flex gap-2 max-w-md mx-auto">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand bg-gray-50 placeholder-gray-400"
                placeholder="Search by name, address, or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchListings()}
              />
              <button onClick={fetchListings}
                className="bg-brand text-white px-5 py-3 rounded-xl text-sm hover:bg-brand-dark transition-colors font-medium whitespace-nowrap">
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-5 py-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Listings', value: stats.total.toLocaleString() },
              { label: 'Reviews', value: stats.reviews.toLocaleString() },
              { label: 'Deposits lost', value: stats.deposits > 0 ? '$' + stats.deposits.toLocaleString() : '$0' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            <div className="flex gap-1.5 overflow-x-auto flex-1 scrollbar-hide">
              {TABS.map(t => (
                <button key={t.value} onClick={() => setTab(t.value)}
                  className={`text-xs px-3.5 py-2 rounded-full border whitespace-nowrap transition-colors font-medium ${
                    tab === t.value
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                  }`}>{t.label}</button>
              ))}
            </div>
            <div className="flex gap-2 shrink-0">
              <input
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs w-16 focus:outline-none focus:border-brand uppercase text-center bg-white font-medium tracking-widest placeholder-gray-300"
                placeholder="ST"
                value={stateFilter}
                onChange={e => setStateFilter(e.target.value.toUpperCase())}
                maxLength={2}
              />
              <select
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand bg-white text-gray-500"
                value={sort} onChange={e => setSort(e.target.value)}>
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Listings */}
          {loading ? (
            <div className="text-center py-16 text-gray-300 text-sm">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No listings found.</p>
              <button onClick={() => setShowModal(true)} className="mt-3 text-brand text-sm hover:underline font-medium">
                Be the first to submit a report →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 mt-16 py-10">
          <div className="max-w-2xl mx-auto px-5 text-center space-y-3">
            <p className="font-bold text-gray-900 text-sm">
              RateMy<span className="text-brand">Slumlord</span>.us
            </p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Reviews reflect personal tenant experiences and are not independently verified.
            </p>
            <div className="flex justify-center gap-5 text-xs text-gray-400">
              <a href="/about" className="hover:text-gray-600 transition-colors">About</a>
              <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-gray-600 transition-colors">Terms</a>
              <a href="mailto:hello@ratemyslumlord.us" className="hover:text-gray-600 transition-colors">Contact</a>
            </div>
          </div>
        </footer>

        {/* Mobile FAB */}
        <button onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 bg-brand text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg hover:bg-brand-dark transition-colors md:hidden">
          + Report
        </button>
      </div>

      {showModal && <ReportModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
    </>
  )
}
