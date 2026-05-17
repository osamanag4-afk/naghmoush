export default function NumberInput({ value, onChange, placeholder = '0', suffix = 'ر.س', className = '', min = 0, step = 1, disabled = false }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={value === 0 ? '' : value}
        onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-left ltr text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400"
        style={{ direction: 'ltr', textAlign: 'right' }}
      />
      {suffix && (
        <span className="absolute left-3 text-gray-400 text-sm pointer-events-none select-none">{suffix}</span>
      )}
    </div>
  )
}
