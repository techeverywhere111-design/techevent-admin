import React, { useState } from 'react';
import { Search, MoreVertical, Download } from 'lucide-react';

export default function PaymentHistory() {
  const [searchQuery, setSearchQuery] = useState('');

  const payments = Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    date: '20 - 07 - 2023',
    name: 'Jane Doe',
    email: 'janedoe123@gmail.com',
    amount: '₦5,000.00',
    medium: 'Paystack'
  }));

  const filteredPayments = payments.filter(payment =>
    payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

          {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6 mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6">Payment History</h2>

            {/* Search Bar and Export Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medium</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.date}</td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-medium">
                            JD
                          </div>
                          <span className="text-sm text-gray-900">{payment.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.medium}</td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">10 of 50</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 bg-blue-500 text-white rounded">1</button>
                <button className="px-3 py-1 hover:bg-gray-100 rounded">2</button>
                <button className="px-3 py-1 hover:bg-gray-100 rounded">3</button>
                <span className="px-3 py-1">...</span>
                <button className="px-3 py-1 hover:bg-gray-100 rounded">10</button>
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-medium">
                      JD
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.name}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                  </div>

                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-900">{payment.email}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-medium text-gray-900">{payment.amount}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Medium:</span>
                    <span className="text-gray-900">{payment.medium}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">10 of 50</span>
                <div className="flex gap-1">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">1</button>
                  <button className="px-3 py-1 hover:bg-gray-100 rounded text-sm">2</button>
                  <button className="px-3 py-1 hover:bg-gray-100 rounded text-sm">3</button>
                  <span className="px-2 py-1 text-sm">...</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
