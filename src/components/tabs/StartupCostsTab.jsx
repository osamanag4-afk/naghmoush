import { useCalc } from '../../contexts/CalculatorContext'
import CostTable from '../shared/CostTable'
import SummaryCard from '../shared/SummaryCard'

function fmt(n) {
  return Number(n).toLocaleString('ar-SA', { maximumFractionDigits: 2 })
}

export default function StartupCostsTab() {
  const { state, derived, startupHandlers } = useCalc()

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="text-4xl">🏗️</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">المصاريف التأسيسية</h2>
          <p className="text-sm text-gray-500 mt-1">التكاليف التي تُدفع مرة واحدة عند تأسيس المطعم (لا تتكرر شهرياً)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="إجمالي المصاريف التأسيسية"
          value={derived.totalStartupCapital}
          icon="🏗️"
          color="primary"
          subtitle="مرة واحدة"
        />
        <SummaryCard
          title="احتياطي التشغيل (3 أشهر)"
          value={derived.totalMonthlyFixed * 3}
          icon="🛡️"
          color="warning"
          subtitle="موصى به"
        />
        <SummaryCard
          title="رأس المال المقدر الكلي"
          value={derived.estimatedCapital}
          icon="💰"
          color="blue"
          subtitle="تأسيس + 3 أشهر"
        />
      </div>

      <CostTable
        rows={state.startupCosts}
        onAdd={() => startupHandlers.add()}
        onRemove={startupHandlers.remove}
        onChange={startupHandlers.update}
        totalLabel="إجمالي التأسيس"
      />

      {derived.totalStartupCapital > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 text-sm text-primary-700">
          <strong>💡 نصيحة:</strong> يُنصح بإضافة مبلغ احتياطي يعادل 3 أشهر من التشغيل ({fmt(derived.totalMonthlyFixed * 3)} ر.س) لضمان استمرارية المشروع.
          المجموع التقديري المطلوب: <strong>{fmt(derived.estimatedCapital)} ر.س</strong>
        </div>
      )}
    </div>
  )
}
