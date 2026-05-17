import NumberInput from './NumberInput'

function fmt(n) {
  if (!n) return '0'
  return Number(n).toLocaleString('ar-SA', { maximumFractionDigits: 2 })
}

export default function CostTable({
  rows,
  onAdd,
  onRemove,
  onChange,
  title,
  addLabel = '+ إضافة بند',
  showIsMonthly = false,
  totalLabel = 'المجموع',
}) {
  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600 w-8">#</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">اسم البند</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600 w-44">المبلغ (ر.س)</th>
              {showIsMonthly && (
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600 w-28">شهري؟</th>
              )}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={showIsMonthly ? 5 : 4} className="text-center py-8 text-gray-400 text-sm">
                  لا توجد بنود — اضغط على زر الإضافة
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 text-sm">{i + 1}</td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={row.name}
                    onChange={e => onChange(row.id, 'name', e.target.value)}
                    placeholder="اسم البند"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  />
                </td>
                <td className="px-4 py-3">
                  <NumberInput
                    value={row.amount}
                    onChange={v => onChange(row.id, 'amount', v)}
                  />
                </td>
                {showIsMonthly && (
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={!!row.isMonthly}
                      onChange={e => onChange(row.id, 'isMonthly', e.target.checked)}
                      className="w-4 h-4 accent-primary-500 cursor-pointer"
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onRemove(row.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-danger-500 hover:bg-danger-50 transition-all text-lg"
                    title="حذف"
                  >×</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={showIsMonthly ? 2 : 2} className="px-4 py-3 font-bold text-gray-700">
                {totalLabel}
              </td>
              <td className="px-4 py-3 font-bold text-primary-600" dir="ltr" style={{textAlign:'right'}}>
                {fmt(total)} <span className="text-xs font-normal text-gray-500">ر.س</span>
              </td>
              {showIsMonthly && <td></td>}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="p-4 border-t border-gray-50">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-semibold hover:bg-primary-50 px-3 py-2 rounded-lg transition-all"
        >
          <span className="text-lg leading-none">+</span>
          {addLabel}
        </button>
      </div>
    </div>
  )
}
