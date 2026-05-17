import { useCalc } from '../../contexts/CalculatorContext'

function fmt(n) {
  if (!isFinite(n)) return '—'
  return Number(n).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function WasteCostsTab() {
  const { state, derived, updateWaste } = useCalc()
  const wastePct = Math.round(state.wastePercentage * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="text-4xl">♻️</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">مصاريف الهدر</h2>
          <p className="text-sm text-gray-500 mt-1">نسبة الفاقد من المواد الخام (تلف، طبخ زائد، خطأ في التحضير...)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              نسبة الهدر العامة لجميع المنتجات
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={wastePct}
              onChange={e => updateWaste(e.target.value)}
              className="w-full cursor-pointer"
              style={{
                accentColor: wastePct < 10 ? '#16a34a' : wastePct < 20 ? '#d97706' : '#dc2626',
                background: `linear-gradient(to left, ${wastePct < 10 ? '#16a34a' : wastePct < 20 ? '#d97706' : '#dc2626'} ${wastePct * 2}%, #e2e8f0 ${wastePct * 2}%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-black ${wastePct < 10 ? 'text-success-600' : wastePct < 20 ? 'text-warning-600' : 'text-danger-600'}`}>
              {wastePct}%
            </div>
            <div className={`text-xs font-semibold mt-1 px-3 py-1 rounded-full ${
              wastePct < 10 ? 'bg-success-50 text-success-600' :
              wastePct < 20 ? 'bg-warning-50 text-warning-600' :
              'bg-danger-50 text-danger-600'
            }`}>
              {wastePct === 0 ? 'لا هدر' : wastePct < 10 ? 'طبيعي ✓' : wastePct < 20 ? 'مرتفع ⚠️' : 'خطير 🚨'}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <strong>📖 المعدل الطبيعي للمطاعم: 5-10%</strong>
          {wastePct > 15 && <span> — نسبتك مرتفعة، راجع عمليات الشراء والتخزين.</span>}
        </div>
      </div>

      {/* Impact Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-700">تأثير الهدر على تكلفة كل منتج</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">المنتج</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">تكلفة المواد</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">بعد الهدر (+{wastePct}%)</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">الفرق</th>
              </tr>
            </thead>
            <tbody>
              {derived.products.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-700">{p.name || 'منتج'}</td>
                  <td className="px-4 py-3 text-gray-600" dir="ltr" style={{textAlign:'right'}}>{fmt(p.rawMaterialCost)} ر.س</td>
                  <td className="px-4 py-3 font-semibold text-warning-600" dir="ltr" style={{textAlign:'right'}}>{fmt(p.adjustedRawCost)} ر.س</td>
                  <td className="px-4 py-3 text-danger-500 text-sm" dir="ltr" style={{textAlign:'right'}}>
                    +{fmt(p.adjustedRawCost - p.rawMaterialCost)} ر.س
                  </td>
                </tr>
              ))}
              {derived.products.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                    أضف منتجات في تبويب "تسعير المنتجات" لرؤية تأثير الهدر
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
