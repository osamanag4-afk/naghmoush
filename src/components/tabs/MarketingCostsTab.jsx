import { useCalc } from '../../contexts/CalculatorContext'
import CostTable from '../shared/CostTable'
import SummaryCard from '../shared/SummaryCard'

export default function MarketingCostsTab() {
  const { state, marketingHandlers } = useCalc()
  const total = state.marketingCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0)
  const totalFixed = state.fixedCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0)
  const mktPct = totalFixed + total > 0 ? (total / (totalFixed + total) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="text-4xl">📣</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">مصاريف الدعاية والإعلان</h2>
          <p className="text-sm text-gray-500 mt-1">إعلانات، محتوى، سوشيال ميديا، عروض وخصومات...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard
          title="إجمالي التسويق شهرياً"
          value={total}
          icon="📣"
          color="purple"
          subtitle="شهري"
        />
        <SummaryCard
          title="نسبة التسويق من المصاريف"
          value={mktPct}
          icon="📊"
          color="warning"
          subtitle="النسبة الموصى بها 5-15%"
          suffix="%"
        />
      </div>

      <CostTable
        rows={state.marketingCosts}
        onAdd={() => marketingHandlers.add()}
        onRemove={marketingHandlers.remove}
        onChange={marketingHandlers.update}
        totalLabel="إجمالي التسويق"
      />

      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-sm text-purple-700">
        <strong>📣 نصيحة:</strong> يُوصى بتخصيص 5-15% من المصاريف الكلية للتسويق. نسبتك الحالية: <strong>{mktPct}%</strong>.
        {Number(mktPct) < 5 && total > 0 && ' قد تحتاج لرفع ميزانية التسويق لجذب العملاء.'}
        {Number(mktPct) > 20 && ' الميزانية مرتفعة نسبياً، تأكد من قياس عائد الاستثمار.'}
      </div>
    </div>
  )
}
