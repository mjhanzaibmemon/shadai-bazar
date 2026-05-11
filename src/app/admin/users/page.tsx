'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Ban } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/');
      return;
    }
    // Load mock data
    setUsers([
      {
        _id: '1',
        name: 'Ahmed Khan',
        email: 'ahmed@example.com',
        phone: '03001234567',
        city: 'Karachi',
        role: 'user',
        isVerified: true,
        isSuspended: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        name: 'Fatima Ali',
        email: 'fatima@example.com',
        phone: '03009876543',
        city: 'Lahore',
        role: 'user',
        isVerified: true,
        isSuspended: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#800020] to-[#e11d48] text-white py-8 shadow">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">👥 User Management</h1>
          <p className="text-gray-100 mt-2">Manage platform users</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">City</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{u.name}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-600">{u.city}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {u.isVerified && (
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            ✓ Verified
                          </span>
                        )}
                        {u.isSuspended && (
                          <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            🔒 Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                          <Shield size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                          <Ban size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
