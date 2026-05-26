'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface SalesData {
  date: string;
  transactions: number;
  revenue: number;
}

interface SalesTrendChartProps {
  data: SalesData[];
  groupBy: 'day' | 'week' | 'month';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <p className="text-sm font-medium text-gray-900 mb-1">
        {new Date(label).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name === 'revenue' ? 'Pendapatan' : 'Transaksi'}: {entry.name === 'revenue' ? `Rp ${entry.value.toLocaleString('id-ID')}` : entry.value}
        </p>
      ))}
    </div>
  );
}

export function SalesTrendChart({ data, groupBy: _groupBy }: SalesTrendChartProps) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : v.toString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#e85c1e"
            strokeWidth={2}
            dot={{ r: 3, fill: '#e85c1e' }}
            activeDot={{ r: 5, fill: '#e85c1e' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
