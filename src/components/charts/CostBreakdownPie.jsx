import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']
const RADIAN = Math.PI / 180

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.04) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

function fmt(n) {
  return Number(n).toLocaleString('ar-SA', { maximumFractionDigits: 0 })
}

export default function CostBreakdownPie({ data }) {
  const filtered = data.filter(d => d.value > 0)
  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        أدخل التكاليف لعرض الرسم البياني
      </div>
    )
  }
  return (
    <div dir="ltr">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            dataKey="value"
          >
            {filtered.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${fmt(value)} ر.س`, '']}
            contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', borderRadius: '8px' }}
          />
          <Legend
            formatter={(value) => <span style={{ fontFamily: 'Cairo', fontSize: '12px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
