import { useCalc } from '../../contexts/CalculatorContext'

export default function ProfitSlider() {
  const { state, updateProfitMargin } = useCalc()
  const pct = Math.round(state.profitMargin * 100)

  const color =
    pct < 15 ? 'text-danger-600' :
    pct < 25 ? 'text-warning-600' :
    'text-success-600'

  const trackColor =
    pct < 15 ? '#dc2626' :
    pct < 25 ? '#d97706' :
    '#16a34a'

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🎯</span>
            <span className="font-bold text-gray-700 text-sm whitespace-nowrap">هامش الربح المستهدف</span>
          </div>
          <div className="flex-1 min-w-48">
            <input
              type="range"
              min="5"
              max="80"
              step="1"
              value={pct}
              onChange={e => updateProfitMargin(e.target.value)}
              className="w-full cursor-pointer"
              style={{ accentColor: trackColor, background: `linear-gradient(to left, ${trackColor} ${pct}%, #e2e8f0 ${pct}%)` }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5 px-0.5">
              <span>5%</span>
              <span>80%</span>
            </div>
          </div>
          <div className={`text-3xl font-black tabular-nums price-value shrink-0 ${color}`}>
            {pct}%
          </div>
          <div className={`text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 ${
            pct < 15 ? 'bg-danger-50 text-danger-600' :
            pct < 25 ? 'bg-warning-50 text-warning-600' :
            'bg-success-50 text-success-600'
          }`}>
            {pct < 15 ? 'منخفض جداً ⚠️' : pct < 25 ? 'مقبول' : pct < 40 ? 'جيد ✓' : 'ممتاز 🌟'}
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">
            كل تغيير يُحدّث جميع الأسعار تلقائياً
          </div>
        </div>
      </div>
    </div>
  )
}
