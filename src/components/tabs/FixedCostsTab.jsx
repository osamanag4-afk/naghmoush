import { useCalc } from '../../contexts/CalculatorContext'
import CostTable from '../shared/CostTable'
import SummaryCard from '../shared/SummaryCard'

export default function FixedCostsTab() {
  const { state, derived, fixedHandlers } = useCalc()
  const total = state.fixedCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="text-4xl">📌</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">المصاريف الثابتة</h2>
          <p className="text-sm text-gray-500 mt-1">تكاليف لا تتغير بتغير حجم المبيعات: إيجار، رواتب، أقساط...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="إجمالي الثابتة شهرياً"
          value={total}
          icon="📌"
          color="purple"
          subtitle="شهري"
        />
        <SummaryCard
          title="توزيع على الوحدات"
          value={total / (derived.products.reduce((s,p) => s + (Number(p.expectedUnitsPerMonth)||0), 0) || 1)}
          icon="📊"
          color="warning"
          subtitle="ر.س / وحدة"
        />
        <SummaryCard
          title="إجمالي المصاريف الثابتة الكلية"
          value={derived.totalMonthlyFixed}
          icon="💎"
          color="primary"
          subtitle="كل التكاليف الثابتة"
        />
      </div>

      <CostTable
        rows={state.fixedCosts}
        onAdd={() => fixedHandlers.add()}
        onRemove={fixedHandlers.remove}
        onChange={fixedHandlers.update}
        totalLabel="إجمالي الثابتة"
      />

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
        <strong>📌 ملاحظة:</strong> المصاريف الثابتة لا تتغير حتى لو لم تبع شيئاً. كلما زادت مبيعاتك، قل توزيعها على كل وحدة (تكلفة الوحدة انخفضت).
        الحد الأدنى للمبيعات لتغطية كل مصاريفك: <strong>{derived.products[0] ? Math.ceil(derived.totalMonthlyFixed / Math.max((derived.products[0].minimumSellingPrice - derived.products[0].baseTotalCost + derived.overheadPerUnit), 1)).toLocaleString('ar-SA') : '—'}</strong> وحدة/شهر
      </div>
    </div>
  )
}
