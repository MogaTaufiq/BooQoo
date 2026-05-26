'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface PaymentMethodChartProps {
  data: Record<string, { count: number; total: number }>;
  labels: Record<string, string>;
}

const COLORS = ['#e85c1e', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-sm text-gray-600">
          {entry.name === 'total' ? 'Total: ' : 'Transaksi: '}
          <span className="font-semibold text-gray-900">
            {entry.name === 'total' ? `Rp ${entry.value.toLocaleString('id-ID')}` : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function PaymentMethodChart({ data, labels }: PaymentMethodChartProps) {
  const chartData = Object.entries(data)
    .map(([key, val]) => ({
      name: labels[key] || key,
      total: val.total,
      count: val.count,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} tickLine={false} axisLine={false} width={90} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" radius={[0, 6, 6, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
