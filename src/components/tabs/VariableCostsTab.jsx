import { useCalc } from '../../contexts/CalculatorContext'
import NumberInput from '../shared/NumberInput'
import SummaryCard from '../shared/SummaryCard'

const uid = () => crypto.randomUUID()

const SCALE_LABELS = {
  perUnit:    'لكل طلب',
  perBatch:   'لكل X طلب',
  perRevenue: '% من الإيراد',
}

const SCALE_DESC = {
  perUnit:    'تُحسب لكل وحدة مباشرة (تغليف، أكياس، مناديل)',
  perBatch:   'تُقسّم على عدد الوحدات المحدد (غاز، كهرباء، صيانة)',
  perRevenue: 'نسبة من سعر البيع (عمولة توصيل)',
}

function fmt(n) {
  if (!isFinite(n) || isNaN(n)) return '—'
  return Number(n).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
}

export default function VariableCostsTab() {
  const { state, derived, variableHandlers } = useCalc()

  const totalVarPerUnit = derived.products.length > 0 ? derived.products[0].fixedVariableCost : 0
  const revenueRate = derived.revenueVariableRate * 100

  const addVariableCost = () => {
    variableHandlers.add({
      id: uid(),
      name: '',
      scaleType: 'perUnit',
      costPerUnit: 0,
      batchSize: 1,
      percentageOfRevenue: 0,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="text-4xl">📈</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">التكاليف المتغيرة</h2>
          <p className="text-sm text-gray-500 mt-1">
            تكاليف تتغير تلقائياً مع زيادة الطلبات — كل بند احذفه إن لم ينطبق على مطعمك
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="إجمالي المتغيرة (لكل طلب)"
          value={totalVarPerUnit}
          icon="📦"
          color="primary"
          subtitle="ر.س / وحدة"
        />
        <SummaryCard
          title="عمولة التوصيل"
          value={revenueRate}
          icon="🛵"
          color="warning"
          subtitle="% من الإيراد"
          suffix="%"
        />
        <SummaryCard
          title="تأثيرها على السعر الأدنى"
          value={derived.products[0] ? derived.products[0].minimumSellingPrice - derived.products[0].baseTotalCost + totalVarPerUnit : 0}
          icon="💡"
          color="blue"
          subtitle="ر.س إضافية في السعر"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-700">بنود التكاليف المتغيرة</h3>
          <p className="text-xs text-gray-400 mt-0.5">يمكنك حذف أي بند لا ينطبق على مطعمك — حذفه يزيل تأثيره على سعر المنتج</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-right px-3 py-3 text-sm font-semibold text-gray-600">اسم البند</th>
                <th className="text-right px-3 py-3 text-sm font-semibold text-gray-600 w-36">نوع الحساب</th>
                <th className="text-right px-3 py-3 text-sm font-semibold text-gray-600 w-36">التكلفة</th>
                <th className="text-right px-3 py-3 text-sm font-semibold text-gray-600 w-28">لكل (وحدة)</th>
                <th className="text-right px-3 py-3 text-sm font-semibold text-gray-600 w-32">تأثير/وحدة</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {state.variableCosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                    لا توجد تكاليف متغيرة — اضغط على "إضافة بند"
                  </td>
                </tr>
              )}
              {state.variableCosts.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <div>
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => variableHandlers.update(item.id, 'name', e.target.value)}
                        placeholder="اسم البند"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                      />
                      <div className="text-xs text-gray-400 mt-0.5 px-1">{SCALE_DESC[item.scaleType]}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={item.scaleType}
                      onChange={e => variableHandlers.update(item.id, 'scaleType', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                    >
                      {Object.entries(SCALE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    {item.scaleType === 'perRevenue' ? (
                      <NumberInput
                        value={item.percentageOfRevenue}
                        onChange={v => variableHandlers.update(item.id, 'percentageOfRevenue', v)}
                        suffix="%"
                        min={0}
                        step={0.5}
                      />
                    ) : (
                      <NumberInput
                        value={item.costPerUnit}
                        onChange={v => variableHandlers.update(item.id, 'costPerUnit', v)}
                      />
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {item.scaleType === 'perBatch' ? (
                      <NumberInput
                        value={item.batchSize}
                        onChange={v => variableHandlers.update(item.id, 'batchSize', Math.max(1, v))}
                        suffix="طلب"
                        min={1}
                        step={1}
                      />
                    ) : (
                      <span className="text-xs text-gray-400 px-2">
                        {item.scaleType === 'perUnit' ? '1 طلب' : '% سعر'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold text-primary-600" dir="ltr" style={{textAlign:'right'}}>
                    {item.scaleType === 'perUnit'
                      ? `${fmt(Number(item.costPerUnit) || 0)} ر.س`
                      : item.scaleType === 'perBatch'
                      ? `${fmt((Number(item.costPerUnit) || 0) / Math.max(Number(item.batchSize) || 1, 1))} ر.س`
                      : `${item.percentageOfRevenue || 0}% × سعر`
                    }
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => variableHandlers.remove(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-danger-500 hover:bg-danger-50 transition-all text-lg"
                      title="حذف البند"
                    >×</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={4} className="px-3 py-3 font-bold text-gray-700">إجمالي التكاليف المتغيرة لكل طلب</td>
                <td className="px-3 py-3 font-bold text-primary-600" dir="ltr" style={{textAlign:'right'}}>
                  {fmt(totalVarPerUnit)} ر.س
                  {revenueRate > 0 && <span className="text-xs text-warning-600 mr-2">+ {revenueRate}% من الإيراد</span>}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={addVariableCost}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-semibold hover:bg-primary-50 px-3 py-2 rounded-lg transition-all"
          >
            <span className="text-lg leading-none">+</span>
            إضافة تكلفة متغيرة
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
        <strong>📈 كيف تعمل التكاليف المتغيرة؟</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li><strong>لكل طلب:</strong> تُضاف مباشرة لتكلفة كل وحدة (تغليف، مناديل)</li>
          <li><strong>لكل X طلب:</strong> تُقسّم على عدد الطلبات المحددة (غاز = 5 ر.س لكل 10 طلبات = 0.5 ر.س/طلب)</li>
          <li><strong>% من الإيراد:</strong> نسبة من سعر البيع، تُحسب في معادلة السعر تلقائياً</li>
        </ul>
      </div>
    </div>
  )
}
