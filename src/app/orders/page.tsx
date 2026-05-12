'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck, Package, Truck, CheckCircle2, AlertTriangle,
  Clock, XCircle, Eye,
} from 'lucide-react';

interface Order {
  _id: string;
  status: string;
  amount: number;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  inspectionDeadline?: string;
  trackingNumber?: string;
  listing: {
    _id: string;
    title: string;
    images: string[];
    price: number;
  };
  buyer: { _id: string; name: string };
  seller: { _id: string; name: string };
}

const STATUS_INFO: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pending_payment:  { label: 'Awaiting Payment',  color: 'amber',  icon: Clock },
  paid:             { label: 'Paid (Escrow)',     color: 'blue',   icon: ShieldCheck },
  shipped:          { label: 'Shipped',           color: 'purple', icon: Truck },
  delivered:        { label: 'Delivered',         color: 'indigo', icon: Package },
  completed:        { label: 'Completed',         color: 'green',  icon: CheckCircle2 },
  disputed:         { label: 'Disputed',          color: 'red',    icon: AlertTriangle },
  cancelled:        { label: 'Cancelled',         color: 'gray',   icon: XCircle },
  resolved_buyer:   { label: 'Resolved (Refund)', color: 'gray',   icon: CheckCircle2 },
  resolved_seller:  { label: 'Resolved (Paid)',   color: 'gray',   icon: CheckCircle2 },
  refunded:         { label: 'Refunded',          color: 'gray',   icon: XCircle },
};

export default function OrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
    if (isAuthenticated) fetchOrders();
  }, [authLoading, isAuthenticated, role, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck size={28} /> My Orders
          </h1>
          <p className="text-rose-100 mt-2">Track your purchases with full buyer protection.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Role toggle */}
        <div className="inline-flex bg-white shadow rounded-full p-1 border border-gray-200 mb-6">
          {(['buyer', 'seller'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-6 py-2 rounded-full font-semibold capitalize transition-all ${
                role === r ? 'bg-[#800020] text-white' : 'text-gray-600 hover:text-[#800020]'
              }`}
            >
              As {r}
            </button>
          ))}
        </div>

        {/* Escrow protection banner */}
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex gap-3">
          <ShieldCheck className="text-blue-600 flex-shrink-0 mt-0.5" size={22} />
          <div className="text-sm text-blue-900">
            <strong>Buyer Protection:</strong> Aapka paisa platform ke paas safely rakha jata hai jab tak aap dress receive aur inspect kar lein.
            3-day inspection window milta hai delivery ke baad — agar dress sahi nahi, dispute open kar saktay hain.
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 mb-4">
              {role === 'buyer' ? "Aap ne abhi koi order nahi diya." : "Aapko abhi koi order nahi mila."}
            </p>
            <Link
              href={role === 'buyer' ? '/' : '/sell'}
              className="inline-block px-5 py-2 bg-[#800020] text-white rounded-lg font-semibold hover:bg-[#600018]"
            >
              {role === 'buyer' ? 'Start Shopping' : 'Post a Listing'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const s = STATUS_INFO[o.status];
              const Icon = s?.icon || Package;
              return (
                <div key={o._id} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow border border-gray-100">
                  <div className="p-5 flex gap-4">
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {o.listing.images?.[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={o.listing.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800 truncate">{o.listing.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {role === 'buyer' ? `From: ${o.seller.name}` : `To: ${o.buyer.name}`} · Order #{o._id.slice(-6)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-${s?.color}-100 text-${s?.color}-800 whitespace-nowrap`}
                        >
                          <Icon size={12} /> {s?.label}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <span className="text-gray-700">
                          <strong>Rs. {o.totalAmount.toLocaleString()}</strong>
                        </span>
                        <span className="text-gray-500">
                          {o.paymentMethod.toUpperCase()}
                        </span>
                        <span className="text-gray-500">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {o.trackingNumber && (
                        <p className="text-xs text-gray-600 mt-1.5">
                          🚚 Tracking: <span className="font-mono font-semibold">{o.trackingNumber}</span>
                        </p>
                      )}
                      {o.inspectionDeadline && o.status === 'delivered' && (
                        <p className="text-xs text-amber-700 mt-1.5">
                          ⏰ Inspect by {new Date(o.inspectionDeadline).toLocaleDateString()} or order auto-completes
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/orders/${o._id}`}
                      className="self-center flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded font-semibold text-sm hover:border-[#800020] hover:text-[#800020]"
                    >
                      <Eye size={14} /> View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
