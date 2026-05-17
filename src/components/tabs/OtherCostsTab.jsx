import { useCalc } from '../../contexts/CalculatorContext'
import CostTable from '../shared/CostTable'
import SummaryCard from '../shared/SummaryCard'

export default function OtherCostsTab() {
  const { state, otherHandlers } = useCalc()
  const monthly   = state.otherCosts.filter(c => c.isMonthly).reduce((s, c) => s + (Number(c.amount) || 0), 0)
  const oneTime   = state.otherCosts.filter(c => !c.isMonthly).reduce((s, c) => s + (Number(c.amount) || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="text-4xl">📂</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">مصاريف أخرى</h2>
          <p className="text-sm text-gray-500 mt-1">أي بنود إضافية لم تُذكر في التبويبات الأخرى — يمكنك تحديد إن كانت شهرية أم مرة واحدة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard title="شهرية" value={monthly} icon="📅" color="blue" subtitle="شهري" />
        <SummaryCard title="لمرة واحدة" value={oneTime} icon="📌" color="warning" subtitle="مرة واحدة" />
      </div>

      <CostTable
        rows={state.otherCosts}
        onAdd={() => otherHandlers.add({ isMonthly: true })}
        onRemove={otherHandlers.remove}
        onChange={otherHandlers.update}
        showIsMonthly
        totalLabel="المجموع الكلي"
      />

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-600">
        <strong>💡 أمثلة على مصاريف قد تنسى:</strong>
        <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
          {['اشتراك منصة توصيل', 'رسوم محاسب', 'تأمين على المعدات', 'مكافآت موظفين موسمية',
            'تكاليف التوظيف والتدريب', 'عضوية غرفة تجارية', 'رسوم بلدية', 'أدوات ومواد تنظيف'].map(t => (
            <div key={t} className="flex items-center gap-1 text-gray-500">
              <span>•</span>{t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
