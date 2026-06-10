import { useState } from 'react'
import { supabase } from '../lib/supabase'

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
    name: '', address: '', type: 'landlord', rating: 1,
    review_text: '', deposit_lost: '', flags: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleFlag(f) {
    setForm(prev => ({
      ...prev,
      flags: prev.flags.includes(f) ? prev.flags.filter(x => x !== f) : [...prev.flags, f],
    }))
  }

  async function submit() {
    if (!form.name.trim() || !form.address.trim()) {
      setError('Name and address are required.')
      return
    }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('listings').insert({
      name: form.name.trim(),
      address: form.address.trim(),
      type: form.type,
      rating: parseFloat(form.rating),
      review_text: form.review_text.trim(),
      deposit_lost: form.deposit_lost ? parseInt(form.deposit_lost.replace(/\D/g, '')) : 0,
      flags: form.flags,
    })
    setLoading(false)
    if (err) { setError('Something went wrong. Try again.'); return }
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-600 text-gray-900">Report a landlord or property</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Landlord / management company name *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Sunrise Property Management" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Property address *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
              value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="123 Main St, City, State" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Type</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="landlord">Landlord</option>
                <option value="property">Property</option>
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
            <label className="block text-sm text-gray-500 mb-2">Red flags</label>
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
              placeholder="What happened? Dates, amounts, and specific details help other renters." />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Deposit amount lost (optional)</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
              value={form.deposit_lost} onChange={e => setForm(p => ({ ...p, deposit_lost: e.target.value }))}
              placeholder="e.g. 2950" />
          </div>
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
