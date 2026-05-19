export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold gradient-gold mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm mb-8">Last updated: May 2026</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">1. Information We Collect</h2>
              <p>
                Jab aap Rukhsati pe account banate ho, hum yeh information collect karte hain:
                naam, email, phone number, city, aur (verification ke liye) CNIC details. Jab aap
                listing post karte ho, photos aur item details bhi store hoti hain.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Account management aur authentication</li>
                <li>Listings aur orders process karna</li>
                <li>Email notifications (welcome, verification, password reset, messages)</li>
                <li>Trust &amp; safety — fraud prevention aur seller verification</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">3. Sharing</h2>
              <p>
                Hum aapka data kisi third-party ko sell nahi karte. Sirf payment processor (JazzCash)
                aur email service (Resend) ke saath relevant info share hoti hai jo platform chalane
                ke liye zaroori hai.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">4. Your Rights</h2>
              <p>
                Aap apna account aur data kisi bhi waqt delete karne ka request kar sakte ho —
                support@rukhsati.pk pe email karke.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-2">5. Contact</h2>
              <p>
                Privacy ke baare mein koi sawal? <a href="mailto:support@rukhsati.pk" className="text-[#800020] font-semibold hover:underline">support@rukhsati.pk</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
