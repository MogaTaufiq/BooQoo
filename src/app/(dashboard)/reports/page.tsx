'use client';

// ============================================
// Reports & Analytics Page
// ============================================

import { useState, useEffect } from 'react';
import { Card, Alert, Badge, Table, Input, SkeletonCard } from '@/components/ui';
import { SalesTrendChart } from '@/components/charts/SalesTrendChart';
import { PaymentMethodChart } from '@/components/charts/PaymentMethodChart';
import { TopProductsChart } from '@/components/charts/TopProductsChart';

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
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Laporan Penjualan
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-primary text-primary'
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
                <Input
                  label="Dari Tanggal"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                />

                <Input
                  label="Sampai Tanggal"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelompokkan
                  </label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-primary focus:ring-primary"
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
            <div className="space-y-4">
              <SkeletonCard className="h-48" />
              <SkeletonCard className="h-64" />
            </div>
          ) : salesData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Pendapatan</h3>
                  <p className="text-2xl md:text-3xl font-bold text-green-600">
                    Rp {salesData.summary.totalRevenue.toLocaleString('id-ID')}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Transaksi</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {salesData.summary.totalTransactions}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Rata-rata Transaksi</h3>
                  <p className="text-2xl md:text-3xl font-bold text-primary">
                    Rp {Math.round(salesData.summary.averageTransaction).toLocaleString('id-ID')}
                  </p>
                </Card>
              </div>

              {/* Payment Method Breakdown */}
              <Card className="mb-6 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Metode Pembayaran
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PaymentMethodChart
                    data={salesData.paymentMethodBreakdown}
                    labels={paymentMethodLabels}
                  />
                  <div className="space-y-3">
                    {Object.entries(salesData.paymentMethodBreakdown)
                      .sort(([, a]: any, [, b]: any) => b.total - a.total)
                      .map(([method, data]: any) => (
                        <div key={method} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
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
                </div>
              </Card>

              {/* Top Products */}
              <Card className="mb-6 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top 10 Produk Terlaris
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TopProductsChart data={salesData.topProducts} />
                  <div className="overflow-x-auto">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase w-8">#</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Produk</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Terjual</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Pendapatan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {salesData.topProducts.map((p: any, i: number) => (
                            <tr key={p.productId}>
                              <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                              <td className="px-3 py-2 font-medium text-gray-900">{p.productName}</td>
                              <td className="px-3 py-2 text-right text-gray-700">{p.quantity}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900">Rp {p.revenue.toLocaleString('id-ID')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Sales Trend Chart */}
              <Card className="mb-6 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tren Penjualan
                </h3>
                <SalesTrendChart data={salesData.salesByDate} groupBy={groupBy} />
              </Card>

              {/* Sales by Date */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detail Per {groupBy === 'day' ? 'Hari' : groupBy === 'week' ? 'Minggu' : 'Bulan'}
                </h3>
                <Table
                  data={salesData.salesByDate}
                  keyExtractor={(item: any) => item.date}
                  columns={[
                    { key: 'date', header: 'Tanggal', render: (item: any) => new Date(item.date).toLocaleDateString('id-ID') },
                    { key: 'transactions', header: 'Transaksi', className: 'text-right' },
                    { key: 'revenue', header: 'Pendapatan', className: 'text-right font-semibold', render: (item: any) => `Rp ${item.revenue.toLocaleString('id-ID')}` },
                  ]}
                />
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* Inventory Report */}
      {activeTab === 'inventory' && (
        <div>
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonCard className="h-48" />
              <SkeletonCard className="h-64" />
            </div>
          ) : inventoryData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Produk</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {inventoryData.summary.totalProducts}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Nilai Inventori</h3>
                  <p className="text-2xl md:text-3xl font-bold text-green-600">
                    Rp {inventoryData.summary.totalValue.toLocaleString('id-ID')}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Stok Menipis</h3>
                  <p className="text-2xl md:text-3xl font-bold text-yellow-600">
                    {inventoryData.summary.lowStockCount}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Akan Kedaluwarsa</h3>
                  <p className="text-2xl md:text-3xl font-bold text-red-600">
                    {inventoryData.summary.expiringCount}
                  </p>
                </Card>
              </div>

              {/* Inventory Table */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Inventori</h3>
                <Table
                  data={inventoryData.products}
                  keyExtractor={(p: any) => p.productId}
                  columns={[
                    { key: 'productName', header: 'Produk', className: 'font-medium' },
                    { key: 'sku', header: 'SKU' },
                    { key: 'category', header: 'Kategori', render: (p: any) => p.category || '-' },
                    { key: 'stock', header: 'Stok', className: 'text-right', render: (p: any) => `${p.totalStock} ${p.unit}` },
                    { key: 'priceSell', header: 'Harga Jual', className: 'text-right', render: (p: any) => `Rp ${p.priceSell.toLocaleString('id-ID')}` },
                    { key: 'totalValue', header: 'Nilai Total', className: 'text-right font-semibold', render: (p: any) => `Rp ${p.totalValue.toLocaleString('id-ID')}` },
                    {
                      key: 'status',
                      header: 'Status',
                      className: 'text-center',
                      render: (p: any) => (
                        <div className="flex gap-1 justify-center">
                          {p.isLowStock && <Badge variant="warning">Low</Badge>}
                          {p.hasExpiringSoon && <Badge variant="danger">Exp</Badge>}
                          {!p.isLowStock && !p.hasExpiringSoon && <Badge variant="success">OK</Badge>}
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
