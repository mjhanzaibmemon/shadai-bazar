'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BeforeInstallPrompt = any;

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPrompt | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.warn('SW register failed:', err));
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 5 seconds
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-dismissed');
        if (!dismissed) setShow(true);
      }, 5000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem('pwa-dismissed', Date.now().toString());
    setShow(false);
  };

  if (!show || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 bg-white rounded-xl shadow-2xl border-2 border-[#800020] p-4 animate-fadeInUp">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-[#800020] to-[#d4a853] rounded-xl flex items-center justify-center flex-shrink-0">
          <Download size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-sm">Install Shaadi Bazaar</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            App ki tarah install karein — faster, offline support, push notifications.
          </p>
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={install}
              className="flex-1 bg-[#800020] text-white text-sm font-semibold py-1.5 rounded hover:bg-[#600018]"
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="text-sm text-gray-500 px-3 hover:text-gray-700"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="text-gray-400 hover:text-gray-700 flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
