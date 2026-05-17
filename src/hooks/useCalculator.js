import { useState, useMemo, useCallback } from 'react'
import { initialState } from '../constants/defaults'
import { computeDerived } from '../utils/calculations'

const uid = () => crypto.randomUUID()

export function useCalculator() {
  const [state, setState] = useState(initialState)

  const derived = useMemo(() => computeDerived(state), [state])

  // ── Tab ───────────────────────────────────────────────────────
  const setActiveTab = useCallback(tab =>
    setState(s => ({ ...s, activeTab: tab })), [])

  // ── Profit Margin ──────────────────────────────────────────────
  const updateProfitMargin = useCallback(value =>
    setState(s => ({ ...s, profitMargin: Number(value) / 100 })), [])

  const updateExpectedUnits = useCallback(value =>
    setState(s => ({ ...s, expectedMonthlyUnits: Number(value) || 1 })), [])

  // ── Generic Cost List Helpers ─────────────────────────────────
  const makeListHandlers = useCallback((listKey) => ({
    add: (template = {}) =>
      setState(s => ({
        ...s,
        [listKey]: [...s[listKey], { id: uid(), name: '', amount: 0, ...template }]
      })),
    remove: (id) =>
      setState(s => ({ ...s, [listKey]: s[listKey].filter(c => c.id !== id) })),
    update: (id, field, value) =>
      setState(s => ({
        ...s,
        [listKey]: s[listKey].map(c => c.id === id ? { ...c, [field]: value } : c)
      })),
  }), [])

  const startupHandlers    = useMemo(() => makeListHandlers('startupCosts'), [makeListHandlers])
  const operationalHandlers= useMemo(() => makeListHandlers('operationalCosts'), [makeListHandlers])
  const marketingHandlers  = useMemo(() => makeListHandlers('marketingCosts'), [makeListHandlers])
  const fixedHandlers      = useMemo(() => makeListHandlers('fixedCosts'), [makeListHandlers])
  const otherHandlers      = useMemo(() => makeListHandlers('otherCosts'), [makeListHandlers])
  const variableHandlers   = useMemo(() => makeListHandlers('variableCosts'), [makeListHandlers])

  // ── Waste ──────────────────────────────────────────────────────
  const updateWaste = useCallback(value =>
    setState(s => ({ ...s, wastePercentage: Number(value) / 100 })), [])

  // ── Products ──────────────────────────────────────────────────
  const addProduct = useCallback(() =>
    setState(s => ({
      ...s,
      products: [...s.products, {
        id: uid(),
        name: `منتج ${s.products.length + 1}`,
        enteredPrice: 0,
        expectedUnitsPerMonth: 100,
        ingredients: [{ id: uid(), name: '', costPerUnit: 0, quantity: 0 }],
      }]
    })), [])

  const removeProduct = useCallback(id =>
    setState(s => ({ ...s, products: s.products.filter(p => p.id !== id) })), [])

  const updateProduct = useCallback((id, field, value) =>
    setState(s => ({
      ...s,
      products: s.products.map(p => p.id === id ? { ...p, [field]: value } : p)
    })), [])

  // ── Ingredients ───────────────────────────────────────────────
  const addIngredient = useCallback(productId =>
    setState(s => ({
      ...s,
      products: s.products.map(p =>
        p.id === productId
          ? { ...p, ingredients: [...p.ingredients, { id: uid(), name: '', costPerUnit: 0, quantity: 0 }] }
          : p
      )
    })), [])

  const removeIngredient = useCallback((productId, ingId) =>
    setState(s => ({
      ...s,
      products: s.products.map(p =>
        p.id === productId
          ? { ...p, ingredients: p.ingredients.filter(i => i.id !== ingId) }
          : p
      )
    })), [])

  const updateIngredient = useCallback((productId, ingId, field, value) =>
    setState(s => ({
      ...s,
      products: s.products.map(p =>
        p.id === productId
          ? { ...p, ingredients: p.ingredients.map(i => i.id === ingId ? { ...i, [field]: value } : i) }
          : p
      )
    })), [])

  return {
    state,
    derived,
    setActiveTab,
    updateProfitMargin,
    updateExpectedUnits,
    updateWaste,
    startupHandlers,
    operationalHandlers,
    marketingHandlers,
    fixedHandlers,
    otherHandlers,
    variableHandlers,
    addProduct,
    removeProduct,
    updateProduct,
    addIngredient,
    removeIngredient,
    updateIngredient,
  }
}
