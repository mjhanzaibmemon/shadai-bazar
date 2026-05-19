export const metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold gradient-gold mb-2">Terms &amp; Conditions</h1>
          <p className="text-gray-500 text-sm mb-8">Last updated: May 2026</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">1. Acceptance</h2>
              <p>
                Rukhsati use karke aap in terms se agree karte ho. Agar agree nahi to platform use
                mat karein.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">2. Account</h2>
              <p>
                Aap apne account ki security ke khud zimmedaar ho. Galat information dene par account
                suspend ho sakta hai.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">3. Listings</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sirf legal wedding-related items list karein</li>
                <li>Real photos use karein (stock photos allowed sirf reference ke liye)</li>
                <li>Accurate description aur condition batayein</li>
                <li>Counterfeit items strictly prohibited</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">4. Transactions</h2>
              <p>
                Rukhsati buyer aur seller ko connect karta hai. Payment aur shipment ki zimmedaari
                dono parties ki hai. JazzCash payment use karne se transaction trace ho jati hai.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">5. Prohibited Behavior</h2>
              <p>
                Fake reviews, spam messages, harassment, aur duplicate accounts strictly prohibited.
                Violation pe account permanent ban ho sakta hai.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">6. Disclaimer</h2>
              <p>
                Rukhsati platform "as-is" provide kiya jata hai. Hum third-party transactions ke
                liye responsible nahi hain — lekin Shaadi Sahara aur escrow features fraud prevent
                karne mein madad karte hain.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
