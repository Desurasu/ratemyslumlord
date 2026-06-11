import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import ReportModal from '../components/ReportModal'
import ListingCard from '../components/ListingCard'

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Landlords', value: 'landlord' },
  { label: 'Properties', value: 'property' },
  { label: 'Mgmt companies', value: 'pm' },
]

export default function Home({ toggleDark, dark }) {
  const [listings, setListings] = useState([])
  const [stats, setStats] = useState({ total: 0, reviews: 0, deposits: 0 })
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('listings').select('*').order('reviews', { ascending: false })
    if (tab !== 'all') query = query.eq('type', tab)
    if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)
    const { data } = await query
    setListings(data || [])
    setLoading(false)
  }, [tab, search])

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
        <meta name="description" content="The national database of predatory landlords, properties, and management companies." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900 text-lg">RateMy</span>
              <span className="font-bold text-brand text-lg">Slumlord</span>
              <span className="text-gray-400 text-xs">.us</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleDark}
                className="text-gray-400 hover:text-gray-600 text-lg px-2 py-1 rounded-lg border border-gray-200"
                title="Toggle dark mode">
                {dark ? '☀️' : '🌙'}
              </button>
              <button onClick={() => setShowModal(true)}
                className="bg-brand text-white text-sm px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors">
                + Report
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Rate your landlord.<br />Warn your neighbors.</h1>
            <p className="text-gray-500 mt-2 text-sm">The national database of predatory landlords, rental properties, and management companies.</p>
            <div className="mt-5 flex gap-2 max-w-md mx-auto">
              <input
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                placeholder="Search landlord, address, or company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchListings()}
              />
              <button onClick={fetchListings}
                className="bg-brand text-white px-4 py-2.5 rounded-lg text-sm hover:bg-brand-dark transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Listings', value: stats.total.toLocaleString() },
              { label: 'Reviews', value: stats.reviews.toLocaleString() },
              { label: 'Deposits lost', value: '$' + stats.deposits.toLocaleString() },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xl font-semibold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button key={t.value} onClick={() => setTab(t.value)}
                className={`text-sm px-4 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                  tab === t.value ? 'bg-brand text-white border-brand' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}>{t.label}</button>
            ))}
          </div>

          {/* Listings */}
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No listings yet.</p>
              <button onClick={() => setShowModal(true)} className="mt-3 text-brand text-sm hover:underline">Be the first to submit a report →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>

        <button onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 bg-brand text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg hover:bg-brand-dark transition-colors md:hidden">
          + Report
        </button>
      </div>

      {showModal && <ReportModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
    </>
  )
}
