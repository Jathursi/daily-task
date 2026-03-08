'use client';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ProductivityChartProps {
  data: { day: string; score: number }[];
}

export default function ProductivityChart({ data }: ProductivityChartProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Productivity</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ED9E59" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ED9E59" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(233, 188, 185, 0.1)" />
            <XAxis 
              dataKey="day" 
              stroke="rgba(233, 188, 185, 0.5)"
              fontSize={12}
            />
            <YAxis 
              stroke="rgba(233, 188, 185, 0.5)"
              fontSize={12}
              domain={[0, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1B1931',
                border: '1px solid rgba(233, 188, 185, 0.2)',
                borderRadius: '12px',
                color: '#E9BCB9'
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#ED9E59"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
