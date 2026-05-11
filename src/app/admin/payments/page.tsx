'use client';

import { useState, useEffect } from 'react');
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Clock, XCircle, Download } from 'lucide-react';

interface Payment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  listing: {
    _id: string;
    title: string;
  };
  amount: number;
  type: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchPayments();
  }, [isAuthenticated, user, router, filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockPayments: Payment[] = [
        {
          _id: '1',
          user: {
            _id: 'user1',
            name: 'Ahmed Khan',
            email: 'ahmed@example.com',
          },
          listing: {
            _id: 'listing1',
            title: 'Red Bridal Lehenga',
          },
          amount: 2500,
          type: 'featured_listing',
          status: 'completed',
          transactionId: 'TXN_1702000000000',
          paymentMethod: 'jazzcash',
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          user: {
            _id: 'user2',
            name: 'Fatima Ali',
            email: 'fatima@example.com',
          },
          listing: {
            _id: 'listing2',
            title: 'Designer Groom Sherwani',
          },
          amount: 2500,
          type: 'featured_listing',
          status: 'pending',
          transactionId: 'TXN_1702086400000',
          paymentMethod: 'jazzcash',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: '3',
          user: {
            _id: 'user3',
            name: 'Hira Ahmad',
            email: 'hira@example.com',
          },
          listing: {
            _id: 'listing3',
            title: 'Green Formal Saree',
          },
          amount: 2500,
          type: 'featured_listing',
          status: 'completed',
          transactionId: 'TXN_1701912000000',
          paymentMethod: 'jazzcash',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          _id: '4',
          user: {
            _id: 'user4',
            name: 'Sara Hassan',
            email: 'sara@example.com',
          },
          listing: {
            _id: 'listing4',
            title: 'Bridal Wedding Dress',
          },
          amount: 2500,
          type: 'featured_listing',
          status: 'failed',
          transactionId: 'TXN_1701825600000',
          paymentMethod: 'jazzcash',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      const filtered = filter === 'all'
        ? mockPayments
        : mockPayments.filter(p => p.status === filter);

      setPayments(filtered);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white py-8 shadow">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">💰 Payments & Revenue</h1>
          <p className="text-gray-100 mt-2">Track transactions and platform revenue</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Revenue Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Revenue (Completed)</p>
            <p className="text-3xl font-bold text-gray-800">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Pending Amount</p>
            <p className="text-3xl font-bold text-yellow-600">Rs. {pendingAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-800">{payments.length}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'completed', 'failed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === status
                  ? 'bg-[#800020] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#800020]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No {filter === 'all' ? 'payments' : filter + ' payments'} found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Listing</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{payment.user.name}</p>
                      <p className="text-xs text-gray-500">{payment.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800">{payment.listing.title}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">Rs. {payment.amount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.transactionId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#600018] transition-colors font-semibold">
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
