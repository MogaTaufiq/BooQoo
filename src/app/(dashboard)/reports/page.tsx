'use client';

// ============================================
// Reports & Analytics Page
// ============================================

import { useState, useEffect } from 'react';
import { Card, Alert } from '@/components/ui';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const [salesData, setSalesData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReport();
    } else {
      fetchInventoryReport();
    }
  }, [activeTab, dateRange, groupBy]);

  const fetchSalesReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate: new Date(dateRange.startDate).toISOString(),
        endDate: new Date(dateRange.endDate + 'T23:59:59').toISOString(),
        groupBy,
      });

      const response = await fetch(`/api/reports/sales?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setSalesData(result.data);
      } else {
        setError(result.error?.message || 'Gagal mengambil laporan penjualan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reports/inventory');
      const result = await response.json();

      if (result.success) {
        setInventoryData(result.data);
      } else {
        setError(result.error?.message || 'Gagal mengambil laporan inventori');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  };

  const paymentMethodLabels: any = {
    CASH: 'Tunai',
    TRANSFER_BCA: 'Transfer BCA',
    TRANSFER_BRI: 'Transfer BRI',
    TRANSFER_MANDIRI: 'Transfer Mandiri',
    TRANSFER_BNI: 'Transfer BNI',
    EWALLET_OVO: 'OVO',
    EWALLET_GOPAY: 'GoPay',
    EWALLET_DANA: 'DANA',
    EWALLET_SHOPEEPAY: 'ShopeePay',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Laporan & Analitik</h2>
        <p className="text-gray-600 mt-1">Analisis performa bisnis Anda</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sales'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Laporan Penjualan
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Laporan Inventori
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Sales Report */}
      {activeTab === 'sales' && (
        <div>
          {/* Date Range & Filters */}
          <Card className="mb-6 p-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickDateRange(7)}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                >
                  7 Hari
                </button>
                <button
                  onClick={() => handleQuickDateRange(30)}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                >
                  30 Hari
                </button>
                <button
                  onClick={() => handleQuickDateRange(90)}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                >
                  90 Hari
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelompokkan
                  </label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="day">Per Hari</option>
                    <option value="week">Per Minggu</option>
                    <option value="month">Per Bulan</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat laporan...</p>
            </div>
          ) : salesData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Pendapatan</h3>
                  <p className="text-3xl font-bold text-green-600">
                    Rp {salesData.summary.totalRevenue.toLocaleString('id-ID')}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Transaksi</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {salesData.summary.totalTransactions}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Rata-rata Transaksi</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    Rp {Math.round(salesData.summary.averageTransaction).toLocaleString('id-ID')}
                  </p>
                </Card>
              </div>

              {/* Payment Method Breakdown */}
              <Card className="mb-6 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Metode Pembayaran
                </h3>
                <div className="space-y-3">
                  {Object.entries(salesData.paymentMethodBreakdown).map(([method, data]: any) => (
                    <div key={method} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {paymentMethodLabels[method] || method}
                        </p>
                        <p className="text-sm text-gray-600">{data.count} transaksi</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        Rp {data.total.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Top Products */}
              <Card className="mb-6 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top 10 Produk Terlaris
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">
                          #
                        </th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">
                          Produk
                        </th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">
                          Kategori
                        </th>
                        <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">
                          Terjual
                        </th>
                        <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">
                          Pendapatan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.topProducts.map((product: any, index: number) => (
                        <tr key={product.productId} className="border-b">
                          <td className="py-3 px-2 text-sm text-gray-900">{index + 1}</td>
                          <td className="py-3 px-2 text-sm font-medium text-gray-900">
                            {product.productName}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {product.category || '-'}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-900 text-right">
                            {product.quantity}
                          </td>
                          <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-right">
                            Rp {product.revenue.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Sales by Date */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Penjualan Per {groupBy === 'day' ? 'Hari' : groupBy === 'week' ? 'Minggu' : 'Bulan'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">
                          Tanggal
                        </th>
                        <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">
                          Transaksi
                        </th>
                        <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">
                          Pendapatan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.salesByDate.map((item: any) => (
                        <tr key={item.date} className="border-b">
                          <td className="py-3 px-2 text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-900 text-right">
                            {item.transactions}
                          </td>
                          <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-right">
                            Rp {item.revenue.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* Inventory Report */}
      {activeTab === 'inventory' && (
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat laporan...</p>
            </div>
          ) : inventoryData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Produk</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {inventoryData.summary.totalProducts}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Nilai Inventori</h3>
                  <p className="text-3xl font-bold text-green-600">
                    Rp {inventoryData.summary.totalValue.toLocaleString('id-ID')}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Stok Menipis</h3>
                  <p className="text-3xl font-bold text-yellow-600">
                    {inventoryData.summary.lowStockCount}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Akan Kedaluwarsa</h3>
                  <p className="text-3xl font-bold text-red-600">
                    {inventoryData.summary.expiringCount}
                  </p>
                </Card>
              </div>

              {/* Inventory Table */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Inventori</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">
                          Produk
                        </th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">
                          SKU
                        </th>
                        <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">
                          Kategori
                        </th>
                        <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">
                          Stok
                        </th>
                        <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">
                          Harga Jual
                        </th>
                        <th className="text-right py-2 px-2 text-sm font-medium text-gray-600">
                          Nilai Total
                        </th>
                        <th className="text-center py-2 px-2 text-sm font-medium text-gray-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.products.map((product: any) => (
                        <tr key={product.productId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 text-sm font-medium text-gray-900">
                            {product.productName}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">{product.sku}</td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {product.category || '-'}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-900 text-right">
                            {product.totalStock} {product.unit}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-900 text-right">
                            Rp {product.priceSell.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-right">
                            Rp {product.totalValue.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex gap-1 justify-center">
                              {product.isLowStock && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Low
                                </span>
                              )}
                              {product.hasExpiringSoon && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  Exp
                                </span>
                              )}
                              {!product.isLowStock && !product.hasExpiringSoon && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  OK
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
