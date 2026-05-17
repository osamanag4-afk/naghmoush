import { useCalc } from '../../contexts/CalculatorContext'
import NumberInput from '../shared/NumberInput'
import PriceIndicator from '../shared/PriceIndicator'

function fmt(n) {
  if (!isFinite(n) || isNaN(n) || n === 0) return '—'
  return Number(n).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function CostRow({ label, value, highlight, sub }) {
  return (
    <div className={`flex justify-between items-center py-2 px-3 rounded-lg ${highlight ? 'bg-primary-50 font-bold' : 'hover:bg-gray-50'}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-semibold ${highlight ? 'text-primary-700' : 'text-gray-700'}`} dir="ltr">
          {fmt(value)} <span className="text-xs font-normal text-gray-400">ر.س</span>
        </span>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
      </div>
    </div>
  )
}

function ProductCard({ product, dp, onUpdate, onRemove, onAddIngredient, onRemoveIngredient, onUpdateIngredient, profitMargin }) {
  const pct = Math.round(profitMargin * 100)

  const statusColors = {
    green:   'border-success-300 bg-success-50',
    yellow:  'border-warning-300 bg-warning-50',
    red:     'border-danger-300 bg-danger-50',
    neutral: 'border-gray-200 bg-white',
  }

  return (
    <div className={`rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${statusColors[dp.priceStatus]}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-40">
          <span className="text-2xl">🍽️</span>
          <input
            type="text"
            value={product.name}
            onChange={e => onUpdate('name', e.target.value)}
            placeholder="اسم المنتج"
            className="text-lg font-bold text-gray-800 border-none outline-none bg-transparent w-full focus:bg-white focus:border focus:border-gray-200 focus:px-2 rounded transition-all"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">كمية شهرية</label>
            <div className="w-28">
              <NumberInput
                value={product.expectedUnitsPerMonth}
                onChange={v => onUpdate('expectedUnitsPerMonth', Math.max(1, v))}
                suffix="وحدة"
                min={1}
              />
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-xs text-danger-500 hover:text-danger-700 hover:bg-danger-50 px-2 py-1 rounded-lg transition-all"
          >
            🗑️ حذف المنتج
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-gray-100">
        {/* Ingredients */}
        <div className="p-5 bg-white">
          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>🧂</span> المكونات والمواد الخام
          </h4>
          <table className="w-full mb-3">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-right text-xs text-gray-500 pb-2 font-semibold">المكوّن</th>
                <th className="text-right text-xs text-gray-500 pb-2 font-semibold w-28">سعر الوحدة</th>
                <th className="text-right text-xs text-gray-500 pb-2 font-semibold w-24">الكمية</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {product.ingredients.map(ing => (
                <tr key={ing.id} className="border-b border-gray-50">
                  <td className="py-2 pl-2">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={e => onUpdateIngredient(ing.id, 'name', e.target.value)}
                      placeholder="اسم المكوّن"
                      className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </td>
                  <td className="py-2 pl-2">
                    <NumberInput
                      value={ing.costPerUnit}
                      onChange={v => onUpdateIngredient(ing.id, 'costPerUnit', v)}
                      placeholder="0"
                      step={0.01}
                    />
                  </td>
                  <td className="py-2 pl-2">
                    <NumberInput
                      value={ing.quantity}
                      onChange={v => onUpdateIngredient(ing.id, 'quantity', v)}
                      placeholder="1"
                      suffix=""
                      step={0.001}
                      min={0}
                    />
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => onRemoveIngredient(ing.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-danger-500 hover:bg-danger-50 transition-all text-base"
                    >×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={onAddIngredient}
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 hover:bg-primary-50 px-2 py-1.5 rounded-lg transition-all"
          >
            <span>+</span> إضافة مكوّن
          </button>
        </div>

        {/* Cost Breakdown */}
        <div className="p-5 bg-white">
          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>📊</span> تفصيل التكلفة والسعر
          </h4>
          <div className="space-y-1 mb-4">
            <CostRow label="تكلفة المواد الخام" value={dp.rawMaterialCost} />
            <CostRow label={`بعد الهدر`} value={dp.adjustedRawCost} sub={`+ ${Math.round((dp.adjustedRawCost / Math.max(dp.rawMaterialCost,0.001) - 1) * 100)}% هدر`} />
            <CostRow label="توزيع المصاريف الثابتة" value={dp.overheadPerUnit} />
            <CostRow label="التكاليف المتغيرة" value={dp.fixedVariableCost} />
            <div className="border-t border-gray-200 my-1"></div>
            <CostRow label="إجمالي التكلفة" value={dp.baseTotalCost} highlight />
            <CostRow
              label={`الحد الأدنى للسعر (هامش ${pct}%)`}
              value={isFinite(dp.minimumSellingPrice) ? dp.minimumSellingPrice : null}
              highlight
            />
          </div>

          {/* Break-even */}
          {isFinite(dp.breakEvenUnits) && dp.breakEvenUnits > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700 mb-4">
              📉 نقطة التعادل: <strong>{dp.breakEvenUnits.toLocaleString('ar-SA')} وحدة/شهر</strong>
            </div>
          )}

          {/* Entered Price */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">سعر البيع المقترح</label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <NumberInput
                  value={product.enteredPrice}
                  onChange={v => onUpdate('enteredPrice', v)}
                  placeholder={isFinite(dp.minimumSellingPrice) ? Math.ceil(dp.minimumSellingPrice).toString() : '0'}
                  step={0.5}
                />
              </div>
              {isFinite(dp.minimumSellingPrice) && dp.minimumSellingPrice > 0 && (
                <button
                  onClick={() => onUpdate('enteredPrice', Math.ceil(dp.minimumSellingPrice * 10) / 10)}
                  className="text-xs bg-success-50 text-success-700 hover:bg-success-100 border border-success-200 px-2 py-2 rounded-lg whitespace-nowrap font-semibold transition-all"
                >
                  استخدم الحد الأدنى
                </button>
              )}
            </div>
            <PriceIndicator
              status={dp.priceStatus}
              minPrice={dp.minimumSellingPrice}
              enteredPrice={product.enteredPrice}
              actualMargin={dp.actualProfitMargin}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductPricingTab() {
  const {
    state, derived,
    addProduct, removeProduct, updateProduct,
    addIngredient, removeIngredient, updateIngredient,
  } = useCalc()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <span className="text-4xl">💰</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">تسعير المنتجات</h2>
            <p className="text-sm text-gray-500 mt-1">أدخل مكونات كل منتج واحصل على السعر الصحيح تلقائياً</p>
          </div>
        </div>
        <button
          onClick={addProduct}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <span>+</span> منتج جديد
        </button>
      </div>

      {derived.products.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🍽️</div>
          <div className="text-lg font-semibold">لا توجد منتجات</div>
          <div className="text-sm mt-1">اضغط "منتج جديد" لإضافة أول منتج</div>
        </div>
      )}

      {derived.products.map((dp, i) => {
        const product = state.products[i]
        return (
          <ProductCard
            key={dp.id}
            product={product}
            dp={dp}
            profitMargin={state.profitMargin}
            onUpdate={(field, value) => updateProduct(dp.id, field, value)}
            onRemove={() => removeProduct(dp.id)}
            onAddIngredient={() => addIngredient(dp.id)}
            onRemoveIngredient={ingId => removeIngredient(dp.id, ingId)}
            onUpdateIngredient={(ingId, field, value) => updateIngredient(dp.id, ingId, field, value)}
          />
        )
      })}
    </div>
  )
}
