import { useCalc } from '../../contexts/CalculatorContext'
import CostTable from '../shared/CostTable'
import SummaryCard from '../shared/SummaryCard'

export default function OperationalCostsTab() {
  const { state, derived, operationalHandlers } = useCalc()
  const total = state.operationalCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="text-4xl">⚙️</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">المصاريف التشغيلية</h2>
          <p className="text-sm text-gray-500 mt-1">تكاليف شهرية متكررة تتعلق بتشغيل المطعم (كهرباء، صيانة، اشتراكات...)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard
          title="إجمالي التشغيلية شهرياً"
          value={total}
          icon="⚙️"
          color="blue"
          subtitle="شهري"
        />
        <SummaryCard
          title="تأثيرها على سعر الوحدة"
          value={total / (derived.products.reduce((s,p) => s + (Number(p.expectedUnitsPerMonth)||0), 0) || 1)}
          icon="📦"
          color="warning"
          subtitle="ر.س / وحدة"
        />
      </div>

      <CostTable
        rows={state.operationalCosts}
        onAdd={() => operationalHandlers.add()}
        onRemove={operationalHandlers.remove}
        onChange={operationalHandlers.update}
        totalLabel="إجمالي التشغيلية"
      />
    </div>
  )
}
