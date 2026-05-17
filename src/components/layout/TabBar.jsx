import { useCalc } from '../../contexts/CalculatorContext'

const TABS = [
  { id: 'dashboard',    label: 'لوحة التحكم',      icon: '📊' },
  { id: 'startup',      label: 'المصاريف التأسيسية', icon: '🏗️' },
  { id: 'operational',  label: 'المصاريف التشغيلية', icon: '⚙️' },
  { id: 'fixed',        label: 'المصاريف الثابتة',   icon: '📌' },
  { id: 'variable',     label: 'التكاليف المتغيرة',  icon: '📈' },
  { id: 'marketing',    label: 'الدعاية والإعلان',   icon: '📣' },
  { id: 'waste',        label: 'مصاريف الهدر',       icon: '♻️' },
  { id: 'other',        label: 'مصاريف أخرى',        icon: '📂' },
  { id: 'pricing',      label: 'تسعير المنتجات',     icon: '💰' },
]

export default function TabBar() {
  const { state, setActiveTab } = useCalc()

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex gap-0.5 overflow-x-auto scrollbar-hide py-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                state.activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
