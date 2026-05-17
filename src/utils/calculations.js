// ── Fixed / Overhead Costs ──────────────────────────────────────────

export function totalStartupCapital(state) {
  return state.startupCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0)
}

export function totalMonthlyFixed(state) {
  const fixed = state.fixedCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0)
  const ops   = state.operationalCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0)
  const mkt   = state.marketingCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0)
  const other = state.otherCosts
    .filter(c => c.isMonthly)
    .reduce((s, c) => s + (Number(c.amount) || 0), 0)
  return fixed + ops + mkt + other
}

export function totalOtherOneTime(state) {
  return state.otherCosts
    .filter(c => !c.isMonthly)
    .reduce((s, c) => s + (Number(c.amount) || 0), 0)
}

export function totalUnitsPerMonth(state) {
  const sum = state.products.reduce((s, p) => s + (Number(p.expectedUnitsPerMonth) || 0), 0)
  return sum > 0 ? sum : state.expectedMonthlyUnits || 1
}

export function overheadPerUnit(state) {
  return totalMonthlyFixed(state) / totalUnitsPerMonth(state)
}

// ── Variable Costs ──────────────────────────────────────────────────

// Total fixed-part variable cost per unit (excludes perRevenue which depends on price)
export function fixedVariableCostPerUnit(state) {
  return state.variableCosts.reduce((sum, item) => {
    if (item.scaleType === 'perUnit') {
      return sum + (Number(item.costPerUnit) || 0)
    }
    if (item.scaleType === 'perBatch') {
      const batch = Number(item.batchSize) || 1
      return sum + (Number(item.costPerUnit) || 0) / batch
    }
    // perRevenue is price-dependent, handled separately
    return sum
  }, 0)
}

// Sum of percentageOfRevenue rates (for perRevenue items)
export function revenueVariableRate(state) {
  return state.variableCosts
    .filter(item => item.scaleType === 'perRevenue')
    .reduce((sum, item) => sum + (Number(item.percentageOfRevenue) || 0) / 100, 0)
}

// ── Per-Product Calculations ────────────────────────────────────────

export function rawMaterialCost(product) {
  return product.ingredients.reduce(
    (s, ing) => s + (Number(ing.costPerUnit) || 0) * (Number(ing.quantity) || 0),
    0
  )
}

export function adjustedRawCost(product, wastePercentage) {
  return rawMaterialCost(product) * (1 + (Number(wastePercentage) || 0))
}

// Total cost excluding revenue-based variable costs
export function baseTotalCostPerUnit(product, state) {
  const raw      = adjustedRawCost(product, state.wastePercentage)
  const overhead = overheadPerUnit(state)
  const fixedVar = fixedVariableCostPerUnit(state)
  return raw + overhead + fixedVar
}

// Minimum selling price solving:
// price = baseCost / (1 - profitMargin - revenueRate)
export function minimumSellingPrice(product, state) {
  const base       = baseTotalCostPerUnit(product, state)
  const margin     = Number(state.profitMargin) || 0
  const revRate    = revenueVariableRate(state)
  const divisor    = 1 - margin - revRate
  if (divisor <= 0) return Infinity
  return base / divisor
}

// Total variable cost per unit at a given price
export function totalVariableCostPerUnit(state, price) {
  const fixed  = fixedVariableCostPerUnit(state)
  const rev    = revenueVariableRate(state) * (price || 0)
  return fixed + rev
}

// Contribution margin per unit
export function contributionMarginPerUnit(product, state) {
  const price      = minimumSellingPrice(product, state)
  const varCost    = adjustedRawCost(product, state.wastePercentage) + totalVariableCostPerUnit(state, price)
  return price - varCost
}

// Break-even units per month (for this product)
export function breakEvenUnits(product, state) {
  const cm = contributionMarginPerUnit(product, state)
  if (cm <= 0 || !isFinite(cm)) return Infinity
  const monthlyFixed = totalMonthlyFixed(state)
  return Math.ceil(monthlyFixed / cm)
}

// Price status for color coding
export function priceStatus(product, state) {
  const entered = Number(product.enteredPrice) || 0
  if (entered === 0) return 'neutral'
  const minPrice = minimumSellingPrice(product, state)
  if (!isFinite(minPrice) || minPrice === 0) return 'neutral'
  const ratio = entered / minPrice
  if (ratio >= 1) return 'green'
  if (ratio >= 0.9) return 'yellow'
  return 'red'
}

// Actual profit margin % when using enteredPrice
export function actualProfitMargin(product, state) {
  const entered    = Number(product.enteredPrice) || 0
  const totalCost  = baseTotalCostPerUnit(product, state)
  const revCost    = revenueVariableRate(state) * entered
  const realCost   = totalCost + revCost
  if (entered === 0) return null
  return ((entered - realCost) / entered) * 100
}

// ── Aggregate Derived Object ────────────────────────────────────────

export function computeDerived(state) {
  const startup   = totalStartupCapital(state)
  const monthly   = totalMonthlyFixed(state)
  const oneTime   = totalOtherOneTime(state)
  const capital   = startup + oneTime + monthly * 3  // 3 months operating buffer

  const products = state.products.map(p => ({
    ...p,
    rawMaterialCost:       rawMaterialCost(p),
    adjustedRawCost:       adjustedRawCost(p, state.wastePercentage),
    overheadPerUnit:       overheadPerUnit(state),
    fixedVariableCost:     fixedVariableCostPerUnit(state),
    baseTotalCost:         baseTotalCostPerUnit(p, state),
    minimumSellingPrice:   minimumSellingPrice(p, state),
    breakEvenUnits:        breakEvenUnits(p, state),
    priceStatus:           priceStatus(p, state),
    actualProfitMargin:    actualProfitMargin(p, state),
  }))

  return {
    totalStartupCapital: startup,
    totalMonthlyFixed:   monthly,
    totalOtherOneTime:   oneTime,
    estimatedCapital:    capital,
    overheadPerUnit:     overheadPerUnit(state),
    revenueVariableRate: revenueVariableRate(state),
    products,
    // Cost breakdown for pie chart (monthly)
    costBreakdown: {
      fixed:       state.fixedCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0),
      operational: state.operationalCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0),
      marketing:   state.marketingCosts.reduce((s, c) => s + (Number(c.amount) || 0), 0),
      other:       state.otherCosts.filter(c => c.isMonthly).reduce((s, c) => s + (Number(c.amount) || 0), 0),
    },
  }
}
