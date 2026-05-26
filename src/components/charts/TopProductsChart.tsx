'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

interface TopProductsChartProps {
  data: Array<{ productName: string; quantity: number; revenue: number }>;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-sm text-gray-600">
          {entry.name === 'revenue' ? 'Pendapatan: ' : 'Terjual: '}
          <span className="font-semibold text-gray-900">
            {entry.name === 'revenue' ? `Rp ${entry.value.toLocaleString('id-ID')}` : `${entry.value} pcs`}
          </span>
        </p>
      ))}
    </div>
  );
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const chartData = data.slice(0, 10).map((p) => ({
    name: p.productName.length > 15 ? p.productName.slice(0, 15) + '...' : p.productName,
    revenue: p.revenue,
    quantity: p.quantity,
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} tickLine={false} axisLine={false} width={110} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" fill="#22c55e" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
