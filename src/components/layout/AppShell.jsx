import { useCalc } from '../../contexts/CalculatorContext'
import ProfitSlider from './ProfitSlider'
import TabBar from './TabBar'
import DashboardTab from '../tabs/DashboardTab'
import StartupCostsTab from '../tabs/StartupCostsTab'
import OperationalCostsTab from '../tabs/OperationalCostsTab'
import FixedCostsTab from '../tabs/FixedCostsTab'
import VariableCostsTab from '../tabs/VariableCostsTab'
import MarketingCostsTab from '../tabs/MarketingCostsTab'
import WasteCostsTab from '../tabs/WasteCostsTab'
import OtherCostsTab from '../tabs/OtherCostsTab'
import ProductPricingTab from '../tabs/ProductPricingTab'

const TAB_COMPONENTS = {
  dashboard:   DashboardTab,
  startup:     StartupCostsTab,
  operational: OperationalCostsTab,
  fixed:       FixedCostsTab,
  variable:    VariableCostsTab,
  marketing:   MarketingCostsTab,
  waste:       WasteCostsTab,
  other:       OtherCostsTab,
  pricing:     ProductPricingTab,
}

export default function AppShell() {
  const { state } = useCalc()
  const ActiveTab = TAB_COMPONENTS[state.activeTab] || DashboardTab

  return (
    <div className="min-h-screen bg-gray-50 font-arabic" dir="rtl">
      {/* App Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <h1 className="text-lg font-black text-gray-800 leading-none">حاسبة تأسيس المطعم</h1>
            <p className="text-xs text-gray-400">احسب تكاليفك وسعّر منتجاتك بذكاء</p>
          </div>
        </div>
      </header>

      <ProfitSlider />
      <TabBar />

      {/* Tab Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <ActiveTab />
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-300">
        حاسبة تأسيس المطعم — جميع الحسابات تقديرية للتخطيط المالي
      </footer>
    </div>
  )
}
