function fmt(n) {
  if (!isFinite(n) || isNaN(n)) return '—'
  return Number(n).toLocaleString('ar-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export default function SummaryCard({ title, value, subtitle, icon, color = 'primary', suffix = 'ر.س' }) {
  const colorMap = {
    primary: 'bg-primary-50 border-primary-200 text-primary-700',
    success: 'bg-success-50 border-success-200 text-success-700',
    danger:  'bg-danger-50  border-danger-200  text-danger-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
    blue:    'bg-blue-50    border-blue-200    text-blue-700',
    purple:  'bg-purple-50  border-purple-200  text-purple-700',
  }
  const valueColor = {
    primary: 'text-primary-600',
    success: 'text-success-600',
    danger:  'text-danger-600',
    warning: 'text-warning-600',
    blue:    'text-blue-600',
    purple:  'text-purple-600',
  }
  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs font-medium opacity-60 bg-white bg-opacity-50 rounded-full px-2 py-0.5">{subtitle}</span>
      </div>
      <div className={`text-2xl font-bold mb-1 price-value ${valueColor[color]}`} dir="ltr" style={{textAlign:'right'}}>
        {fmt(value)} <span className="text-sm font-medium opacity-70">{suffix}</span>
      </div>
      <div className="text-sm font-semibold opacity-80">{title}</div>
    </div>
  )
}
