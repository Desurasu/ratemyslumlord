import Head from 'next/head'
import Link from 'next/link'

export default function About() {
  return (
    <>
      <Head>
        <title>About — RateMySlumlord</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-5 h-14 flex items-center">
            <Link href="/" className="flex items-baseline">
              <span className="font-bold text-gray-900 text-lg tracking-tight">RateMy</span>
              <span className="font-bold text-brand text-lg tracking-tight">Slumlord</span>
              <span className="text-gray-300 text-xs ml-0.5">.us</span>
            </Link>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-5 py-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">

            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">About RateMySlumlord</h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                RateMySlumlord.us is a free, public platform built for renters — by renters. Our mission is simple: give tenants a voice and create accountability in the rental housing market.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">The problem</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Millions of Americans rent their homes. Many face predatory practices — security deposits withheld without cause, illegal fees, ignored maintenance requests, and landlords who know tenants have little recourse. When you sign a lease, you're making one of the biggest financial decisions of your year. You deserve to know what you're signing up for.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">What we do</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We provide a searchable, national database of landlord and property reviews submitted by real tenants. Every review includes a rating, specific red flags, and the option to report deposit losses — building a transparent record that helps renters make informed decisions before they sign.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Our principles</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  'Free for tenants, always.',
                  'No fake reviews — we use technical measures to prevent spam and abuse.',
                  'Landlords can request removal of false content by contacting us.',
                  'We don\'t take sides — good landlords deserve good reviews too.',
                  'Data stays with the community that created it.',
                ].map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand mt-0.5">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Get in touch</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Questions, concerns, or review removal requests? We read every email.
              </p>
              <a href="mailto:hello@ratemyslumlord.us"
                className="inline-block mt-3 bg-brand text-white text-sm px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors font-medium">
                hello@ratemyslumlord.us
              </a>
            </div>

          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-brand hover:underline">← Back to RateMySlumlord</Link>
          </div>
        </div>
      </div>
    </>
  )
}
