import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function fmt(n) {
  return Number(n).toLocaleString('ar-SA', { maximumFractionDigits: 2 })
}

export default function MonthlyCostsBar({ products }) {
  const data = products.map(p => ({
    name: p.name || 'منتج',
    'تكلفة المواد (مع هدر)': Number(p.adjustedRawCost.toFixed(2)),
    'المصاريف العامة': Number(p.overheadPerUnit.toFixed(2)),
    'تكاليف متغيرة': Number(p.fixedVariableCost.toFixed(2)),
    'الحد الأدنى للسعر': Number(isFinite(p.minimumSellingPrice) ? p.minimumSellingPrice.toFixed(2) : 0),
    'السعر المدخل': Number(p.enteredPrice) || 0,
  }))

  if (data.length === 0 || data.every(d => d['الحد الأدنى للسعر'] === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        أدخل مكونات المنتج لعرض مقارنة الأسعار
      </div>
    )
  }

  return (
    <div dir="ltr">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontFamily: 'Cairo', fontSize: 12 }} />
          <YAxis tick={{ fontFamily: 'Cairo', fontSize: 11 }} tickFormatter={v => `${v}`} />
          <Tooltip
            formatter={(value, name) => [`${fmt(value)} ر.س`, name]}
            contentStyle={{ fontFamily: 'Cairo', direction: 'rtl', borderRadius: '8px' }}
          />
          <Legend formatter={v => <span style={{ fontFamily: 'Cairo', fontSize: '12px' }}>{v}</span>} />
          <Bar dataKey="تكلفة المواد (مع هدر)" stackId="cost" fill="#f97316" radius={[0,0,4,4]} />
          <Bar dataKey="المصاريف العامة" stackId="cost" fill="#3b82f6" />
          <Bar dataKey="تكاليف متغيرة" stackId="cost" fill="#8b5cf6" radius={[4,4,0,0]} />
          <Bar dataKey="الحد الأدنى للسعر" fill="#16a34a" radius={[4,4,4,4]} />
          <Bar dataKey="السعر المدخل" fill="#ec4899" radius={[4,4,4,4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
