import { createContext, useContext } from 'react'
import { useCalculator } from '../hooks/useCalculator'

const CalculatorContext = createContext(null)

export function CalculatorProvider({ children }) {
  const calculator = useCalculator()
  return (
    <CalculatorContext.Provider value={calculator}>
      {children}
    </CalculatorContext.Provider>
  )
}

export function useCalc() {
  return useContext(CalculatorContext)
}
