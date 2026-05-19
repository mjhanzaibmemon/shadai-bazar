import { Mail, Phone, Clock, MessageCircle } from 'lucide-react';

export const metadata = { title: 'Contact Us' };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold gradient-gold mb-2">Contact Us</h1>
          <p className="text-gray-600 mb-8">
            Koi bhi sawal? Hum yahan hain madad ke liye.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="mailto:support@rukhsati.pk"
              className="border border-gray-200 rounded-xl p-6 hover:border-[#800020] hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-[#800020]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="text-[#800020]" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Email Support</h3>
                <p className="text-gray-600 text-sm">support@rukhsati.pk</p>
                <p className="text-gray-500 text-xs mt-1">Reply 24 hours ke andar</p>
              </div>
            </a>

            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">WhatsApp</h3>
                <p className="text-gray-600 text-sm">+92 300 1234567</p>
                <p className="text-gray-500 text-xs mt-1">Mon-Fri 10 AM - 6 PM</p>
              </div>
            </a>

            <a
              href="tel:+923001234567"
              className="border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Phone</h3>
                <p className="text-gray-600 text-sm">+92 300 1234567</p>
              </div>
            </a>

            <div className="border border-gray-200 rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Business Hours</h3>
                <p className="text-gray-600 text-sm">Mon-Fri: 10 AM - 6 PM</p>
                <p className="text-gray-500 text-xs mt-1">Pakistan Standard Time</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="font-bold text-amber-900 mb-2">⚡ Quick Help</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• <strong>Password forgot?</strong> Use the <a href="/forgot-password" className="underline font-semibold">forgot password</a> page</li>
              <li>• <strong>Listing post karna hai?</strong> <a href="/sell" className="underline font-semibold">Click here</a></li>
              <li>• <strong>Verification issue?</strong> Email karein with screenshots</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
