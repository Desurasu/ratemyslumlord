import Head from 'next/head'
import Link from 'next/link'

export default function Terms() {
  const updated = 'June 12, 2026'
  return (
    <>
      <Head>
        <title>Terms of Service — RateMySlumlord</title>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Terms of Service</h1>
            <p className="text-xs text-gray-400 mb-8">Last updated: {updated}</p>

            <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
              <section>
                <h2 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
                <p>By accessing or using RateMySlumlord.us ("the Site"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Site.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">2. Purpose of the Site</h2>
                <p>RateMySlumlord.us is a public platform for tenants to share their rental experiences. The Site is intended to provide information to prospective renters and to promote accountability in the rental housing market.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">3. User-Submitted Content</h2>
                <p>By submitting a review, you represent and warrant that:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>The review is based on your genuine personal experience as a tenant</li>
                  <li>The information is truthful and accurate to the best of your knowledge</li>
                  <li>You are not submitting false, defamatory, or malicious content</li>
                  <li>Your review does not contain personal information about private individuals beyond what is necessary to identify a rental property or landlord</li>
                  <li>You have the right to submit the content and it does not violate any third-party rights</li>
                </ul>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">4. Prohibited Content</h2>
                <p>You may not submit content that:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Is knowingly false or fabricated</li>
                  <li>Contains hate speech, harassment, or threats</li>
                  <li>Includes private personal information such as phone numbers, Social Security numbers, or financial account details</li>
                  <li>Is submitted by a landlord or their agent about a competing property or in retaliation against a tenant</li>
                  <li>Violates any applicable law</li>
                </ul>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">5. Section 230 Notice</h2>
                <p>RateMySlumlord.us is an interactive computer service as defined under 47 U.S.C. § 230. We are not the publisher or speaker of user-submitted content and are not liable for content submitted by third parties. We reserve the right, but have no obligation, to remove content at our discretion.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">6. Disclaimer of Warranties</h2>
                <p>The Site and its content are provided "as is" without warranties of any kind. We do not verify the accuracy of user-submitted reviews. RateMySlumlord.us makes no representations about the completeness, reliability, or accuracy of any content on the Site.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">7. Limitation of Liability</h2>
                <p>To the maximum extent permitted by law, RateMySlumlord.us and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or reliance on any content posted on the Site.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">8. Content Removal & DMCA</h2>
                <p>If you believe content on the Site infringes your copyright or contains false and defamatory statements about you, contact us at <a href="mailto:hello@ratemyslumlord.us" className="text-brand hover:underline">hello@ratemyslumlord.us</a> with a detailed description of the content in question and your contact information. We will review all requests and respond within a reasonable time.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">9. Modifications</h2>
                <p>We reserve the right to modify these Terms at any time. Continued use of the Site after changes constitutes your acceptance of the revised Terms.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">10. Governing Law</h2>
                <p>These Terms are governed by the laws of the State of Florida, without regard to its conflict of law provisions.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">11. Contact</h2>
                <p>Questions about these Terms? Email <a href="mailto:hello@ratemyslumlord.us" className="text-brand hover:underline">hello@ratemyslumlord.us</a>.</p>
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
