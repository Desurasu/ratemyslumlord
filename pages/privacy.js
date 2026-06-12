import Head from 'next/head'
import Link from 'next/link'

export default function Privacy() {
  const updated = 'June 12, 2026'
  return (
    <>
      <Head>
        <title>Privacy Policy — RateMySlumlord</title>
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
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
            <p className="text-xs text-gray-400 mb-8">Last updated: {updated}</p>

            <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
              <section>
                <h2 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
                <p>RateMySlumlord.us ("we", "our", "the site") collects information you voluntarily submit when posting a review, including landlord names, property addresses, ratings, and written descriptions of your rental experience. We do not require you to create an account or provide your name or email address to submit a review.</p>
                <p className="mt-2">We also collect standard web analytics data such as page views, browser type, and general geographic region through Cloudflare, our hosting provider. This data is aggregated and anonymous.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
                <p>Information submitted in reviews is published publicly on the site. We use this information to:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Display landlord and property ratings to other users</li>
                  <li>Aggregate statistics about rental experiences nationally</li>
                  <li>Improve the site and its features</li>
                </ul>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">3. Public Nature of Reviews</h2>
                <p>Reviews submitted to RateMySlumlord.us are public. Do not include personal information about yourself (such as your name, phone number, or email address) in review text. Any personally identifiable information about third parties that is submitted may be removed at our discretion.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">4. Data Storage</h2>
                <p>Your submitted data is stored securely via Supabase, a third-party database provider. We take reasonable technical precautions to protect your data, but no system is 100% secure.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">5. Cookies</h2>
                <p>We use localStorage in your browser to remember your dark/light mode preference. We do not use tracking cookies or third-party advertising cookies.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">6. Third Parties</h2>
                <p>We use the following third-party services: Cloudflare (hosting and security), Supabase (database), and OpenStreetMap/Nominatim (address autocomplete). Each has their own privacy policy governing data they collect.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">7. Review Removal</h2>
                <p>If you believe a review contains false, defamatory, or private information about you, you may request its removal by contacting us at <a href="mailto:hello@ratemyslumlord.us" className="text-brand hover:underline">hello@ratemyslumlord.us</a>. We will review requests and remove content at our sole discretion.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">8. Children's Privacy</h2>
                <p>This site is not directed at children under 13. We do not knowingly collect data from children.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">9. Changes to This Policy</h2>
                <p>We may update this policy from time to time. Continued use of the site after changes constitutes acceptance of the new policy.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">10. Contact</h2>
                <p>Questions about this policy? Email us at <a href="mailto:hello@ratemyslumlord.us" className="text-brand hover:underline">hello@ratemyslumlord.us</a>.</p>
              </section>
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
