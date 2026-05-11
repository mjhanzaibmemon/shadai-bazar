'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Users, ShoppingBag, MessageSquare, Star, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalListings: number;
  totalMessages: number;
  totalReviews: number;
  totalRevenue: number;
  activeSellers: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchStats();
  }, [isAuthenticated, user, router]);

  const fetchStats = async () => {
    try {
      // For now, mock data. In production, create /api/admin/stats endpoint
      setStats({
        totalUsers: 2450,
        totalListings: 8920,
        totalMessages: 45230,
        totalReviews: 3420,
        totalRevenue: 542000, // PKR
        activeSellers: 1240,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      link: '/admin/users',
    },
    {
      title: 'Active Listings',
      value: stats?.totalListings || 0,
      icon: ShoppingBag,
      color: 'from-purple-500 to-purple-600',
      link: '/admin/listings',
    },
    {
      title: 'Total Messages',
      value: stats?.totalMessages || 0,
      icon: MessageSquare,
      color: 'from-green-500 to-green-600',
      link: '/admin/messages',
    },
    {
      title: 'Total Reviews',
      value: stats?.totalReviews || 0,
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      link: '/admin/reviews',
    },
    {
      title: 'Active Sellers',
      value: stats?.activeSellers || 0,
      icon: TrendingUp,
      color: 'from-red-500 to-red-600',
      link: '/admin/sellers',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      link: '/admin/payments',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white py-8 shadow">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">🛡️ Admin Dashboard</h1>
          <p className="text-gray-100 mt-2">Welcome, {user?.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link key={card.title} href={card.link}>
                    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-6 cursor-pointer group">
                      <div className={`inline-block p-3 rounded-lg bg-gradient-to-r ${card.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                      </div>
                      <h3 className="text-gray-600 text-sm font-semibold mb-2">{card.title}</h3>
                      <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/admin/users"
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-[#800020] hover:bg-gray-50 transition-all"
                >
                  <h3 className="font-bold text-gray-800 mb-2">👥 User Management</h3>
                  <p className="text-sm text-gray-600">Verify, suspend, or manage users</p>
                </Link>

                <Link
                  href="/admin/listings"
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-[#800020] hover:bg-gray-50 transition-all"
                >
                  <h3 className="font-bold text-gray-800 mb-2">📋 Listing Moderation</h3>
                  <p className="text-sm text-gray-600">Approve or reject new listings</p>
                </Link>

                <Link
                  href="/admin/reviews"
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-[#800020] hover:bg-gray-50 transition-all"
                >
                  <h3 className="font-bold text-gray-800 mb-2">⭐ Review Moderation</h3>
                  <p className="text-sm text-gray-600">Review and manage user feedback</p>
                </Link>

                <Link
                  href="/admin/payments"
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-[#800020] hover:bg-gray-50 transition-all"
                >
                  <h3 className="font-bold text-gray-800 mb-2">💰 Payments & Revenue</h3>
                  <p className="text-sm text-gray-600">Track transactions and payouts</p>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Platform Overview</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">New Listings (Today)</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-gradient-to-r from-[#800020] to-[#e11d48] rounded-full"></div>
                    <span className="text-sm font-bold text-gray-800">28</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Pending Reviews</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-yellow-500 rounded-full" style={{ width: '35%' }}></div>
                    <span className="text-sm font-bold text-gray-800">47</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Pending Payments</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-green-500 rounded-full" style={{ width: '22%' }}></div>
                    <span className="text-sm font-bold text-gray-800">12</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
