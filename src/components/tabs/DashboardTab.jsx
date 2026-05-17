import { useCalc } from '../../contexts/CalculatorContext'
import SummaryCard from '../shared/SummaryCard'
import CostBreakdownPie from '../charts/CostBreakdownPie'
import MonthlyCostsBar from '../charts/MonthlyCostsBar'

function fmt(n) {
  if (!isFinite(n) || isNaN(n)) return '—'
  return Number(n).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const STATUS_BADGE = {
  green:   { cls: 'bg-success-100 text-success-700 border-success-300', label: 'سعر صحيح ✅' },
  yellow:  { cls: 'bg-warning-100 text-warning-700 border-warning-300', label: 'قريب من الحد ⚠️' },
  red:     { cls: 'bg-danger-100  text-danger-700  border-danger-300',  label: 'منخفض جداً 🚨' },
  neutral: { cls: 'bg-gray-100   text-gray-500    border-gray-200',    label: 'لم يُدخل سعر' },
}

export default function DashboardTab() {
  const { state, derived } = useCalc()
  const pct = Math.round(state.profitMargin * 100)

  const pieData = [
    { name: 'مصاريف ثابتة', value: derived.costBreakdown.fixed },
    { name: 'مصاريف تشغيلية', value: derived.costBreakdown.operational },
    { name: 'دعاية وإعلان', value: derived.costBreakdown.marketing },
    { name: 'مصاريف أخرى', value: derived.costBreakdown.other },
  ]

  const allZero = derived.totalStartupCapital === 0 && derived.totalMonthlyFixed === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🍽️</span>
          <div>
            <h2 className="text-xl font-bold">حاسبة تأسيس المطعم</h2>
            <p className="text-sm opacity-80">ابدأ بإدخال التكاليف من التبويبات ثم سعّر منتجاتك</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="bg-white bg-opacity-20 rounded-xl px-3 py-2">
            هامش الربح المستهدف: <strong>{pct}%</strong>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl px-3 py-2">
            عدد المنتجات: <strong>{derived.products.length}</strong>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl px-3 py-2">
            إجمالي الوحدات/شهر: <strong>{derived.products.reduce((s,p) => s+(Number(p.expectedUnitsPerMonth)||0), 0).toLocaleString('ar-SA')}</strong>
          </div>
        </div>
      </div>

      {allZero && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-700 text-sm">
          <strong>👋 مرحباً!</strong> ابدأ بإدخال التكاليف من التبويبات أعلاه لرؤية الأرقام والرسوم البيانية.
          <div className="mt-2 flex gap-2 flex-wrap text-xs">
            {['المصاريف التأسيسية 🏗️', 'المصاريف التشغيلية ⚙️', 'المصاريف الثابتة 📌', 'تسعير المنتجات 💰'].map(t => (
              <span key={t} className="bg-amber-100 px-2 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="رأس المال المقدر"
          value={derived.estimatedCapital}
          icon="💰"
          color="primary"
          subtitle="تأسيس + 3 أشهر"
        />
        <SummaryCard
          title="المصاريف التأسيسية"
          value={derived.totalStartupCapital}
          icon="🏗️"
          color="warning"
          subtitle="مرة واحدة"
        />
        <SummaryCard
          title="المصاريف الثابتة شهرياً"
          value={derived.totalMonthlyFixed}
          icon="📌"
          color="blue"
          subtitle="شهري متكرر"
        />
        <SummaryCard
          title="توزيع المصاريف/وحدة"
          value={derived.overheadPerUnit}
          icon="📦"
          color="purple"
          subtitle="ر.س لكل وحدة"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4">توزيع المصاريف الشهرية</h3>
          <CostBreakdownPie data={pieData} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4">مقارنة تكلفة المنتجات والأسعار</h3>
          <MonthlyCostsBar products={derived.products} />
        </div>
      </div>

      {/* Products Summary Table */}
      {derived.products.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-700">ملخص تسعير المنتجات</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">المنتج</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">تكلفة المواد</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">الحد الأدنى للسعر</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">السعر المدخل</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">نقطة التعادل</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {derived.products.map(p => {
                  const badge = STATUS_BADGE[p.priceStatus]
                  return (
                    <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors`}>
                      <td className="px-4 py-3 font-semibold text-gray-800">{p.name || 'منتج'}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm" dir="ltr" style={{textAlign:'right'}}>
                        {fmt(p.adjustedRawCost)} ر.س
                      </td>
                      <td className="px-4 py-3 font-bold text-primary-600 text-sm" dir="ltr" style={{textAlign:'right'}}>
                        {isFinite(p.minimumSellingPrice) ? `${fmt(p.minimumSellingPrice)} ر.س` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm" dir="ltr" style={{textAlign:'right'}}>
                        {p.enteredPrice > 0 ? `${fmt(p.enteredPrice)} ر.س` : <span className="text-gray-400">لم يُدخل</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600" dir="ltr" style={{textAlign:'right'}}>
                        {isFinite(p.breakEvenUnits) ? `${p.breakEvenUnits.toLocaleString('ar-SA')} وحدة` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Capital Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-700 mb-4">🧮 تفصيل رأس المال المطلوب</h3>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">المصاريف التأسيسية (مرة واحدة)</span>
            <span className="font-semibold text-gray-800" dir="ltr">{fmt(derived.totalStartupCapital)} ر.س</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">مصاريف أخرى لمرة واحدة</span>
            <span className="font-semibold text-gray-800" dir="ltr">{fmt(derived.totalOtherOneTime)} ر.س</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-600">احتياطي تشغيل (3 أشهر × {fmt(derived.totalMonthlyFixed)} ر.س)</span>
            <span className="font-semibold text-gray-800" dir="ltr">{fmt(derived.totalMonthlyFixed * 3)} ر.س</span>
          </div>
          <div className="flex justify-between py-3 bg-primary-50 rounded-xl px-3">
            <span className="font-bold text-primary-700">رأس المال الكلي المقدر</span>
            <span className="font-black text-primary-700 text-lg" dir="ltr">{fmt(derived.estimatedCapital)} ر.س</span>
          </div>
        </div>
      </div>
    </div>
  )
}
