import { useState, useRef } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'

const ACCENT = '#2596be'
const ACCENT_DARK = '#1e7a9a'
const ACCENT_LIGHT = '#2596be33'

const INVESTMENT_METRICS = [
  { label: 'Purchase Price', value: '$17.3M' },
  { label: 'Basis', value: '$67 / SF' },
  { label: 'Total Capex Budget', value: '~$1.5M' },
  { label: 'Stabilized NOI', value: '~$2.6M' },
  { label: 'Target Unlevered IRR', value: '16–18%' },
  { label: 'Hold Period', value: '5–7 Years' },
]

const WATERFALL_STEPS = [
  { label: 'In-Place NOI', value: '~$1.67M', amount: 1.67, cumulative: 1.67, isBase: true },
  { label: '+ Suite Reconfiguration', value: '+$515K–$900K', amount: 0.7, cumulative: 2.37 },
  { label: '+ IOS Yard Income', value: '+$126K', amount: 0.126, cumulative: 2.5 },
  { label: '+ Solar Lease', value: '+$81K', amount: 0.081, cumulative: 2.58 },
  { label: 'Stabilized NOI', value: '~$2.6M', amount: 2.58, cumulative: 2.58, isFinal: true },
]

const EXIT_SCENARIOS = [
  { capRate: '7.0%', salePrice: '$37.1M', multiple: '1.97x', irr: '~19%' },
  { capRate: '7.5%', salePrice: '$34.7M', multiple: '1.84x', irr: '~17%', isBase: true },
  { capRate: '8.0%', salePrice: '$32.5M', multiple: '1.73x', irr: '~15%' },
]

const TIMELINE_MILESTONES = [
  { label: 'Acquisition', date: 'January 2025', status: 'completed' },
  { label: 'CAPEX Program', date: '2025-2026', status: 'in-progress' },
  { label: 'Suite Repositioning', date: '2026–2027', status: 'future' },
  { label: 'Stabilization', date: '2028', status: 'future' },
  { label: 'Targeted Exit', date: '2030–2032', status: 'future' },
]

const HOTSPOTS = [
  { id: 1, label: 'Acquisition Basis', x: 50, y: 50, tooltipBelow: true },
  { id: 2, label: 'Rooftop Solar Lease', x: 37, y: 17 },
  { id: 3, label: 'Industrial Outdoor Storage', x: 10, y: 50 },
  { id: 4, label: 'Site & Aesthetic Capex', x: 27, y: 30 },
  { id: 5, label: 'Suite Reconfiguration', x: 50, y: 40 },
]

const HOTSPOT_DETAILS = {
  1: {
    title: 'Acquisition Basis',
    summary: 'Snowball acquired 1640 John Fitch Blvd in January 2025, capitalizing on an opportunity to purchase a fully-leased 257,000 SF Class B warehouse on 12 acres at an attractive basis of $67 per square foot.',
    metrics: [
      { label: 'Purchase Price', value: '$17.3M' },
      { label: 'Basis', value: '$67 / SF' },
      { label: 'Building', value: '257,000 SF' },
      { label: 'Site', value: '12 acres' },
      { label: 'Acquired', value: 'January 2025' },
      { label: 'Occupancy at close', value: '100% (4 tenants)' },
    ],
    source: 'Source: Snowball Developments',
  },
  2: {
    title: 'Rooftop Solar Lease',
    summary: "Snowball's plan to solicit bids for rooftops approximately 180,000 SF of usable roof area into a 20-year recurring income stream at zero capex to the owner, partnering with the Connecticut Green Bank or a private developer.",
    metrics: [
      { label: 'Usable roof area (illustrative)', value: '~180,000 SF' },
      { label: 'Lease rate (illustrative)', value: '~$0.45 / SF / year' },
      { label: 'Annual rent to owner (illustrative)', value: '~$81K' },
      { label: 'Lease term', value: '20 years' },
      { label: 'Capex to owner', value: '$0' },
    ],
    source: 'Illustrative — Solar Landscape industry rates, CT Green Bank Solar Roof Lease program',
  },
  3: {
    title: 'Industrial Outdoor Storage',
    summary: 'Approximately 3–4 acres of underutilized site area can be paved, fenced, and leased as industrial outdoor storage — one of the highest-yielding subsectors of the industrial market, with supply constrained by zoning and demand driven by logistics and trucking users.',
    metrics: [
      { label: 'Convertible area (illustrative)', value: '~3.5 acres' },
      { label: 'Market rent (illustrative)', value: '~$3,000 / acre / month NNN' },
      { label: 'Incremental annual NOI (illustrative)', value: '~$126K' },
      { label: 'Buildout capex (illustrative)', value: '$200K–$400K' },
      { label: 'Lease structure', value: '5–7 year terms, 3–4% escalators' },
    ],
    source: 'Illustrative — Matthews, Hamilton Lane, CRE Daily IOS market reports',
  },
  4: {
    title: 'Site & Aesthetic Capex',
    summary: 'A targeted capital program replaces entrance and parking asphalt, refreshes the building exterior, and upgrades landscaping and signage — positioning the asset to attract higher-credit tenants and support the repositioning thesis.',
    metrics: [
      { label: 'Total budget (illustrative)', value: '$1.0M–$1.5M' },
      { label: 'Asphalt & parking', value: '~$700K–$1.0M' },
      { label: 'Building exterior & landscaping', value: '~$300K–$500K' },
      { label: 'Timeline', value: 'In progress' },
    ],
    source: 'Illustrative — industry cost benchmarks',
  },
  5: {
    title: 'Suite Reconfiguration',
    summary: 'At lease roll, Snowball plans to reposition the asset by subdividing larger tenant spaces into right-sized suites that command higher rents per square foot, capturing latent value in the current rent roll.',
    metrics: [
      { label: 'In-place rent (illustrative)', value: '~$6.50 / SF NNN' },
      { label: 'Market rent, reconfigured suites (illustrative)', value: '$8.50–$10.00 / SF NNN' },
      { label: 'Rent uplift (illustrative)', value: '$2.00–$3.50 / SF' },
      { label: 'Incremental annual revenue at stabilization (illustrative)', value: '$515K–$900K' },
    ],
    source: 'Illustrative — Hartford Class B warehouse market comps',
  },
}

function App() {
  const [hoveredId, setHoveredId] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const activeDetail = activeId ? HOTSPOT_DETAILS[activeId] : null

  return (
    <div className="min-h-screen bg-stone-50 text-black font-sans flex flex-col">
      {/* Header */}
      <header className="bg-stone-50 px-6 sm:px-10 py-7 border-b border-stone-200">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: '#2596be' }}>
          Value-Add Industrial Case Study
        </p>
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight leading-tight text-stone-900">
          1640 John Fitch Boulevard
        </h1>
        <p className="text-stone-500 text-sm mt-1 font-light">
          South Windsor, Connecticut
        </p>
        <p className="text-stone-400 text-[11px] mt-3 tracking-wide">
          Snowball Developments&nbsp;&middot;&nbsp;Acquired January 2025
        </p>
      </header>

      {/* Hero / Aerial Image */}
      <main className="flex-1 relative">
        <div className="relative w-full">
          <img
            src="/aerial.jpg"
            alt="Aerial view of 1640 John Fitch Boulevard, South Windsor, CT"
            className="w-full h-auto block"
          />

          {/* Hotspot Markers */}
          {HOTSPOTS.map((spot) => (
            <div
              key={spot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, zIndex: hoveredId === spot.id || activeId === spot.id ? 20 : 10 }}
              onMouseEnter={() => {
                setHoveredId(spot.id)
                setActiveId(spot.id)
              }}
              onMouseLeave={() => {
                setHoveredId(null)
                setActiveId(null)
              }}
            >
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-full animate-ping" style={{ animationDuration: '2.5s', backgroundColor: 'rgba(37,150,190,0.3)' }} />

              {/* Glow ring on hover */}
              <div
                className={`absolute inset-[-8px] rounded-full transition-opacity duration-300 ${
                  hoveredId === spot.id || activeId === spot.id
                    ? 'opacity-100'
                    : 'opacity-0'
                }`}
                style={{ background: 'radial-gradient(circle, rgba(37,150,190,0.35) 0%, transparent 70%)' }}
              />

              {/* Marker circle */}
              <div
                className={`relative w-9 h-9 rounded-full border-[2.5px] border-white flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-all duration-200 ${
                  activeId === spot.id
                    ? 'scale-110 shadow-xl'
                    : 'hover:scale-110 shadow-lg'
                }`}
                style={{
                  backgroundColor: activeId === spot.id ? '#1e7a9a' : '#2596be',
                  boxShadow: activeId === spot.id ? '0 0 20px rgba(37,150,190,0.5), 0 4px 12px rgba(0,0,0,0.3)' : undefined
                }}
              >
                {spot.id}
              </div>

              {/* Tooltip */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/95 text-white text-[11px] font-medium rounded-md shadow-xl whitespace-nowrap pointer-events-none transition-all duration-200 backdrop-blur-sm ${
                  spot.tooltipBelow ? 'top-full mt-3' : 'bottom-full mb-3'
                } ${
                  hoveredId === spot.id
                    ? 'opacity-100 translate-y-0'
                    : spot.tooltipBelow ? 'opacity-0 -translate-y-1' : 'opacity-0 translate-y-1'
                }`}
              >
                {spot.label}
                {spot.tooltipBelow ? (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-stone-900/95" />
                ) : (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-stone-900/95" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Side Panel */}
        <AnimatePresence mode="wait">
          {activeDetail && (
            <motion.div
              key={activeId}
              className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-white z-40 flex flex-col border-l border-stone-200"
              style={{ boxShadow: '-8px 0 30px rgba(0,0,0,0.08)' }}
              initial={{ x: '100%', opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-stone-100">
                <span className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: '#2596be' }}>
                  Strategy {activeId} of 5
                </span>
                <button
                  onClick={() => setActiveId(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>

              {/* Panel content */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                {/* Accent bar */}
                <div className="w-8 h-[3px] rounded-full mb-5" style={{ backgroundColor: '#2596be' }} />

                <h2 className="text-lg font-semibold text-stone-900 tracking-tight mb-3">
                  {activeDetail.title}
                </h2>

                <p className="text-[13px] text-stone-600 leading-relaxed mb-8">
                  {activeDetail.summary}
                </p>

                {/* Metrics */}
                <div className="bg-stone-50 rounded-lg p-5">
                  <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-400 mb-3">
                    Key Metrics
                  </p>
                  {activeDetail.metrics.map((metric, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-baseline py-2.5 ${
                        i < activeDetail.metrics.length - 1 ? 'border-b border-stone-200/60' : ''
                      }`}
                    >
                      <span className="text-[11px] text-stone-500 pr-4 leading-tight">
                        {metric.label}
                      </span>
                      <span className="text-[13px] font-semibold text-stone-900 text-right tabular-nums">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Source tag */}
                <div className="mt-5 pt-4 border-t border-stone-100">
                  <p className="text-[10px] text-stone-400 leading-relaxed">
                    {activeDetail.source}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ ANALYSIS SECTIONS ============ */}
        <div className="bg-stone-50">

          {/* SUBSECTION 1: Investment Summary */}
          <motion.section
            className="px-6 sm:px-10 py-16 border-b border-stone-200"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: ACCENT }}>
              Investment Overview
            </p>
            <h2 className="text-xl font-semibold text-stone-900 tracking-tight mb-8">
              Investment Summary
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {INVESTMENT_METRICS.map((metric, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-lg p-4 border-t-2"
                  style={{ borderTopColor: ACCENT }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <p className="text-[10px] text-stone-500 uppercase tracking-wide mb-2 leading-tight">
                    {metric.label}
                  </p>
                  <p className="text-lg md:text-xl font-bold tabular-nums" style={{ color: ACCENT }}>
                    {metric.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* SUBSECTION 2: Value Creation Waterfall */}
          <motion.section
            className="px-6 sm:px-10 py-16 border-b border-stone-200"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: ACCENT }}>
              NOI Growth
            </p>
            <h2 className="text-xl font-semibold text-stone-900 tracking-tight mb-8">
              Value Creation Waterfall
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {WATERFALL_STEPS.map((step, i) => {
                const maxVal = 2.6
                const barWidth = step.isFinal
                  ? (step.amount / maxVal) * 100
                  : step.isBase
                    ? (step.amount / maxVal) * 100
                    : (step.amount / maxVal) * 100
                const offset = step.isFinal || step.isBase
                  ? 0
                  : ((step.cumulative - step.amount) / maxVal) * 100

                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className="w-44 shrink-0 text-right">
                      <p className={`text-[12px] ${step.isFinal ? 'font-bold text-stone-900' : 'text-stone-600'}`}>
                        {step.label}
                      </p>
                    </div>
                    <div className="flex-1 h-9 bg-stone-100 rounded overflow-hidden relative">
                      <motion.div
                        className="absolute top-0 h-full rounded flex items-center justify-end pr-3"
                        style={{
                          left: step.isFinal || step.isBase ? 0 : `${offset}%`,
                          backgroundColor: step.isFinal ? ACCENT : step.isBase ? ACCENT_DARK : `${ACCENT}99`,
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${barWidth}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: i * 0.12, ease: 'easeOut' }}
                      >
                        <span className="text-white text-[11px] font-semibold whitespace-nowrap">
                          {step.value}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>

          {/* SUBSECTION 3: Exit Scenario Analysis */}
          <motion.section
            className="px-6 sm:px-10 py-16 border-b border-stone-200"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: ACCENT }}>
              Returns Analysis
            </p>
            <h2 className="text-xl font-semibold text-stone-900 tracking-tight mb-8">
              Exit Scenario Analysis
            </h2>
            <div className="max-w-3xl mx-auto">
              {/* Table header */}
              <div className="grid grid-cols-4 gap-4 pb-3 border-b border-stone-300 mb-1">
                {['Exit Cap Rate', 'Implied Sale Price', 'Equity Multiple', 'Unlevered IRR'].map((h) => (
                  <p key={h} className="text-[10px] text-stone-500 uppercase tracking-wide font-semibold text-center">
                    {h}
                  </p>
                ))}
              </div>
              {/* Table rows */}
              {EXIT_SCENARIOS.map((row, i) => (
                <motion.div
                  key={i}
                  className={`grid grid-cols-4 gap-4 py-4 border-l-[3px] pl-4 ${
                    row.isBase
                      ? 'border-b border-stone-200'
                      : 'border-b border-stone-100'
                  }`}
                  style={{
                    borderLeftColor: row.isBase ? ACCENT : 'transparent',
                    backgroundColor: row.isBase ? `${ACCENT}08` : 'transparent',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.12 }}
                >
                  <p className={`text-sm tabular-nums text-center ${row.isBase ? 'font-bold text-stone-900' : 'text-stone-700'}`}>
                    {row.capRate}
                    {row.isBase && <span className="text-[10px] font-normal text-stone-400 ml-1">(base)</span>}
                  </p>
                  <p className={`text-sm tabular-nums text-center ${row.isBase ? 'font-bold text-stone-900' : 'text-stone-700'}`}>
                    {row.salePrice}
                  </p>
                  <p className={`text-sm tabular-nums text-center ${row.isBase ? 'font-bold' : 'text-stone-700'}`} style={row.isBase ? { color: ACCENT } : {}}>
                    {row.multiple}
                  </p>
                  <p className={`text-sm tabular-nums text-center ${row.isBase ? 'font-bold' : 'text-stone-700'}`} style={row.isBase ? { color: ACCENT } : {}}>
                    {row.irr}
                  </p>
                </motion.div>
              ))}
              <p className="text-[10px] text-stone-400 mt-4 leading-relaxed text-center">
                Assumes ~$18.8M total cost basis ($17.3M acquisition + ~$1.5M capex). All figures illustrative.
              </p>
            </div>
          </motion.section>

          {/* SUBSECTION 4: Execution Timeline */}
          <motion.section
            className="px-6 sm:px-10 py-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: ACCENT }}>
              Execution Plan
            </p>
            <h2 className="text-xl font-semibold text-stone-900 tracking-tight mb-12">
              Execution Timeline
            </h2>
            <div className="max-w-3xl mx-auto">
              {/* Timeline */}
              <div className="relative flex justify-between items-start">
                {/* Connecting line */}
                <motion.div
                  className="absolute top-[14px] left-[5%] right-[5%] h-[2px]"
                  style={{ backgroundColor: ACCENT }}
                  initial={{ scaleX: 0, transformOrigin: 'left' }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />

                {TIMELINE_MILESTONES.map((m, i) => (
                  <motion.div
                    key={i}
                    className="relative flex flex-col items-center text-center z-10"
                    style={{ width: '20%' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
                  >
                    {/* Node */}
                    <div className="relative mb-3">
                      {m.status === 'in-progress' && (
                        <div
                          className="absolute inset-[-4px] rounded-full animate-ping"
                          style={{ backgroundColor: `${ACCENT}40`, animationDuration: '2s' }}
                        />
                      )}
                      <div
                        className="w-7 h-7 rounded-full border-[2.5px] flex items-center justify-center"
                        style={{
                          backgroundColor: m.status === 'completed' ? ACCENT : m.status === 'in-progress' ? ACCENT : 'white',
                          borderColor: ACCENT,
                        }}
                      >
                        {m.status === 'completed' && (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 8.5l3.5 3.5L13 5" />
                          </svg>
                        )}
                      </div>
                    </div>
                    {/* Label */}
                    <p className="text-[11px] font-semibold text-stone-900 leading-tight mb-1">
                      {m.label}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      {m.date}
                    </p>
                    {m.status !== 'future' && (
                      <span
                        className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: m.status === 'completed' ? `${ACCENT}15` : `${ACCENT}15`,
                          color: ACCENT,
                        }}
                      >
                        {m.status === 'completed' ? 'Done' : 'Active'}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-50 text-stone-400 text-[11px] px-6 sm:px-10 py-5 leading-relaxed border-t border-stone-200">
        Acquisition details are sourced from Snowball Developments' public website.
        All financial projections for value-add programs are illustrative estimates
        based on publicly available market data and not Snowball-confirmed figures.
        Prepared by Andrew Kim, Columbia MSRED 2026.
      </footer>
    </div>
  )
}

export default App
