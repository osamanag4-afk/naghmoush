function fmt(n) {
  if (!isFinite(n) || isNaN(n)) return '—'
  return Number(n).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PriceIndicator({ status, minPrice, enteredPrice, actualMargin }) {
  if (status === 'neutral') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm">
        <span>💡</span>
        <span>أدخل سعر البيع لمعرفة الحالة</span>
      </div>
    )
  }

  const config = {
    green: {
      bg: 'bg-success-50 border-success-300',
      text: 'text-success-700',
      icon: '✅',
      label: 'السعر صحيح',
    },
    yellow: {
      bg: 'bg-warning-50 border-warning-300',
      text: 'text-warning-700',
      icon: '⚠️',
      label: 'السعر قريب — راجع',
    },
    red: {
      bg: 'bg-danger-50 border-danger-300',
      text: 'text-danger-700',
      icon: '🚨',
      label: 'السعر منخفض جداً',
    },
  }

  const c = config[status]

  return (
    <div className={`flex flex-col gap-1 px-3 py-2 rounded-xl border-2 ${c.bg}`}>
      <div className={`flex items-center gap-2 font-bold text-sm ${c.text}`}>
        <span>{c.icon}</span>
        <span>{c.label}</span>
      </div>
      {status !== 'green' && isFinite(minPrice) && (
        <div className={`text-xs ${c.text} opacity-80`}>
          الحد الأدنى: <span className="font-bold" dir="ltr">{fmt(minPrice)}</span> ر.س
        </div>
      )}
      {actualMargin !== null && isFinite(actualMargin) && (
        <div className={`text-xs ${c.text} opacity-80`}>
          هامش الربح الفعلي: <span className="font-bold" dir="ltr">{Number(actualMargin).toFixed(1)}%</span>
        </div>
      )}
    </div>
  )
}
