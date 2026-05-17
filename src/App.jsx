import { CalculatorProvider } from './contexts/CalculatorContext'
import AppShell from './components/layout/AppShell'
import './index.css'

export default function App() {
  return (
    <CalculatorProvider>
      <AppShell />
    </CalculatorProvider>
  )
}
