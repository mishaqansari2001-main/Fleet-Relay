import './App.css'
import {
  Truck, MapPin, Clock, CheckCircle2, Timer,
  ChevronRight, Search, User, Settings, Zap,
  Shield, MessageSquare, Filter, ArrowUpRight,
  AlertCircle, CircleDot
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════
   FONT STACKS
   ═══════════════════════════════════════════════════════ */
const FONT = {
  sans: '"Geist Sans", "Geist", -apple-system, system-ui, sans-serif',
  mono: '"Geist Mono", "SF Mono", "Fira Code", monospace',
}

/* ═══════════════════════════════════════════════════════
   2 FINALIST COLOR SYSTEMS
   ═══════════════════════════════════════════════════════ */
const designSystems = [
  {
    id: 'graphite',
    name: 'Graphite',
    subtitle: 'Data-Focused & Dense',
    description: 'Near-black charcoal with emerald green accents. Built for operators scanning data fast — high contrast, zero distraction. Bloomberg made modern.',
    light: {
      bg: '#f6f7f8',
      surface: '#ffffff',
      surfaceAlt: '#eef0f2',
      border: '#dfe2e6',
      borderStrong: '#c0c6ce',
      text: '#111318',
      textSecondary: '#454b55',
      textTertiary: '#7c8490',
      primary: '#18794e',
      primaryHover: '#15643f',
      primaryText: '#ffffff',
      accent: '#18794e',
      success: '#18794e',
      warning: '#c07d10',
      danger: '#cd2b31',
      info: '#3b7dd8',
      badgeBg: '#eef0f2',
      inputBg: '#ffffff',
      shadow: '0 1px 2px rgba(17,19,24,0.05), 0 1px 5px rgba(17,19,24,0.03)',
    },
    dark: {
      bg: '#0a0b0d',
      surface: '#111316',
      surfaceAlt: '#18191e',
      border: '#222429',
      borderStrong: '#32353c',
      text: '#ecedee',
      textSecondary: '#8b8f96',
      textTertiary: '#55585f',
      primary: '#30a46c',
      primaryHover: '#3cb87a',
      primaryText: '#0a0b0d',
      accent: '#30a46c',
      success: '#30a46c',
      warning: '#f5d90a',
      danger: '#e5484d',
      info: '#5b9ef0',
      badgeBg: '#18191e',
      inputBg: '#111316',
      shadow: '0 1px 2px rgba(0,0,0,0.4), 0 3px 10px rgba(0,0,0,0.3)',
    },
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    subtitle: 'Refined & Authoritative',
    description: 'Deep wine burgundy on warm neutral grounds. Evokes seriousness and trust — a fleet command center that feels established and confident. Inspired by editorial design.',
    light: {
      bg: '#f9f7f5',
      surface: '#ffffff',
      surfaceAlt: '#f3efeb',
      border: '#e5dfd8',
      borderStrong: '#cdc4b9',
      text: '#1c1412',
      textSecondary: '#5c4f47',
      textTertiary: '#8c7f76',
      primary: '#7c2d36',
      primaryHover: '#651f28',
      primaryText: '#ffffff',
      accent: '#7c2d36',
      success: '#2d6a40',
      warning: '#a6610a',
      danger: '#b42318',
      info: '#3565a8',
      badgeBg: '#f3efeb',
      inputBg: '#ffffff',
      shadow: '0 1px 2px rgba(28,20,18,0.05), 0 1px 5px rgba(28,20,18,0.03)',
    },
    dark: {
      bg: '#0e0a09',
      surface: '#161110',
      surfaceAlt: '#1e1816',
      border: '#2c2320',
      borderStrong: '#3d322e',
      text: '#f0ebe8',
      textSecondary: '#998e88',
      textTertiary: '#5e5450',
      primary: '#c25d68',
      primaryHover: '#d4737d',
      primaryText: '#0e0a09',
      accent: '#c25d68',
      success: '#4aba6a',
      warning: '#e0a832',
      danger: '#e54d3c',
      info: '#5e9be0',
      badgeBg: '#1e1816',
      inputBg: '#161110',
      shadow: '0 1px 2px rgba(0,0,0,0.4), 0 3px 10px rgba(0,0,0,0.3)',
    },
  },
]

/* ═══════════════════════════════════════════════════════
   SWATCH WITH HEX
   ═══════════════════════════════════════════════════════ */
function Swatch({ color, label }) {
  return (
    <div style={{ textAlign: 'center', width: 52 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: color,
        margin: '0 auto 5px',
        border: '1px solid rgba(128,128,128,0.15)',
      }} />
      <div style={{ fontFamily: FONT.sans, fontSize: 10, fontWeight: 500, color: 'inherit', opacity: 0.5, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT.mono, fontSize: 9, color: 'inherit', opacity: 0.35, letterSpacing: '0.01em' }}>
        {color}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════════════════ */
function Logo({ colors }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: colors.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Truck size={17} color={colors.primaryText} strokeWidth={2} />
      </div>
      <span style={{
        fontFamily: FONT.sans, fontSize: 19, fontWeight: 650,
        letterSpacing: '-0.03em', color: colors.text,
      }}>
        Fleet<span style={{ color: colors.primary }}>Relay</span>
      </span>
    </div>
  )
}

function Btn({ colors, variant = 'primary', children, icon: Icon }) {
  const s = {
    primary: { bg: colors.primary, color: colors.primaryText, border: 'none' },
    secondary: { bg: 'transparent', color: colors.text, border: `1px solid ${colors.border}` },
    ghost: { bg: 'transparent', color: colors.textTertiary, border: 'none' },
  }[variant]

  return (
    <button style={{
      background: s.bg, color: s.color, border: s.border,
      fontFamily: FONT.sans, fontSize: 12.5, fontWeight: 550,
      padding: '7px 14px', borderRadius: 7, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 5,
      letterSpacing: '-0.01em', lineHeight: 1,
    }}>
      {Icon && <Icon size={14} strokeWidth={2} />}
      {children}
    </button>
  )
}

function Badge({ colors, type, children }) {
  const map = {
    success: colors.success,
    warning: colors.warning || '#d97706',
    danger: colors.danger,
    primary: colors.primary,
    default: colors.textTertiary,
  }
  const c = map[type] || map.default

  return (
    <span style={{
      fontFamily: FONT.sans, fontSize: 10.5, fontWeight: 600,
      padding: '3px 9px', borderRadius: 99,
      background: `${c}14`, color: c,
      border: `1px solid ${c}25`,
      letterSpacing: '0.03em', textTransform: 'uppercase',
    }}>
      {children}
    </span>
  )
}

function SearchInput({ colors }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      background: colors.inputBg,
      border: `1px solid ${colors.border}`,
      borderRadius: 7, padding: '7px 11px',
    }}>
      <Search size={14} color={colors.textTertiary} strokeWidth={1.75} />
      <span style={{ fontFamily: FONT.sans, fontSize: 12.5, color: colors.textTertiary }}>
        Search tickets, drivers...
      </span>
    </div>
  )
}

function StatCard({ colors, label, value, icon: Icon, trend }) {
  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: 9, padding: 13, flex: 1, minWidth: 100,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Icon size={15} color={colors.textTertiary} strokeWidth={1.75} />
        {trend && (
          <span style={{
            fontFamily: FONT.mono, fontSize: 10, fontWeight: 600,
            color: trend > 0 ? colors.success : colors.danger,
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <ArrowUpRight size={9} strokeWidth={2.5}
              style={{ transform: trend < 0 ? 'rotate(90deg)' : 'none' }} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{
        fontFamily: FONT.sans, fontSize: 20, fontWeight: 700,
        color: colors.text, letterSpacing: '-0.03em',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: FONT.sans, fontSize: 11, color: colors.textTertiary, marginTop: 1,
      }}>
        {label}
      </div>
    </div>
  )
}

function StatusRow({ colors }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {[
        { label: 'Open', color: colors.warning || '#d97706', count: 12 },
        { label: 'In Progress', color: colors.primary, count: 8 },
        { label: 'Resolved', color: colors.success, count: 47 },
        { label: 'Urgent', color: colors.danger, count: 3 },
      ].map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: 99, background: s.color }} />
          <span style={{ fontFamily: FONT.sans, fontSize: 11.5, color: colors.textSecondary }}>
            {s.label}
          </span>
          <span style={{ fontFamily: FONT.mono, fontSize: 11.5, fontWeight: 600, color: colors.text }}>
            {s.count}
          </span>
        </div>
      ))}
    </div>
  )
}

function TicketCard({ colors }) {
  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: 10, padding: 14,
      boxShadow: colors.shadow,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 11, color: colors.textTertiary, fontWeight: 600 }}>
            #1847
          </span>
          <Badge colors={colors} type="danger">Urgent</Badge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: colors.warning || '#d97706' }}>
          <Timer size={12} strokeWidth={2} />
          <span style={{ fontFamily: FONT.mono, fontSize: 10.5, fontWeight: 600 }}>4:32</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: colors.surfaceAlt, border: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={14} color={colors.textTertiary} strokeWidth={1.75} />
        </div>
        <div>
          <div style={{ fontFamily: FONT.sans, fontSize: 12.5, fontWeight: 600, color: colors.text }}>
            Jasur Karimov
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 10.5, color: colors.textTertiary }}>
            TRK-4471 · I-40 near Amarillo, TX
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: FONT.sans, fontSize: 12.5, color: colors.textSecondary,
        lineHeight: 1.55, marginBottom: 12,
        paddingLeft: 10, borderLeft: `2px solid ${colors.border}`,
      }}>
        Engine overheating, pulled over. Smoke from under the hood.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <MapPin size={11} color={colors.textTertiary} strokeWidth={1.75} />
            <span style={{ fontFamily: FONT.sans, fontSize: 10.5, color: colors.textTertiary }}>
              Group: Central
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={11} color={colors.textTertiary} strokeWidth={1.75} />
            <span style={{ fontFamily: FONT.sans, fontSize: 10.5, color: colors.textTertiary }}>
              2m ago
            </span>
          </div>
        </div>
        <div style={{
          fontFamily: FONT.sans, fontSize: 11, fontWeight: 600,
          color: colors.primary, display: 'flex', alignItems: 'center', gap: 2,
          cursor: 'pointer',
        }}>
          Open <ChevronRight size={12} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   THEME PANEL
   ═══════════════════════════════════════════════════════ */
function ThemePanel({ colors, mode }) {
  return (
    <div style={{
      background: colors.bg, borderRadius: 14, padding: 24,
      flex: 1, minWidth: 340,
      border: `1px solid ${colors.border}`,
    }}>
      <div style={{
        fontFamily: FONT.mono, fontSize: 10, fontWeight: 600,
        color: colors.textTertiary, textTransform: 'uppercase',
        letterSpacing: '0.1em', marginBottom: 18,
      }}>
        {mode} mode
      </div>

      <div style={{ marginBottom: 22 }}>
        <Logo colors={colors} />
      </div>

      {/* Palette with hex values */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 22, flexWrap: 'wrap', color: colors.text }}>
        <Swatch color={colors.primary} label="Primary" />
        <Swatch color={colors.text} label="Text" />
        <Swatch color={colors.textSecondary} label="Muted" />
        <Swatch color={colors.surface} label="Surface" />
        <Swatch color={colors.success} label="Success" />
        <Swatch color={colors.warning || '#d97706'} label="Warning" />
        <Swatch color={colors.danger} label="Danger" />
      </div>

      {/* Typography */}
      <div style={{ marginBottom: 22 }}>
        <div style={{
          fontFamily: FONT.sans, fontSize: 18, fontWeight: 700,
          color: colors.text, letterSpacing: '-0.03em', marginBottom: 4,
        }}>
          Fleet Operations Dashboard
        </div>
        <div style={{
          fontFamily: FONT.sans, fontSize: 13, color: colors.textSecondary,
          lineHeight: 1.55, marginBottom: 4,
        }}>
          Monitor tickets, track response times, and manage your fleet support in real time.
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 11.5, color: colors.textTertiary }}>
          TRK-4471 · 347 mi · 6.2 hrs · SLA: 00:04:32
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        <Btn colors={colors} variant="primary" icon={Zap}>Claim Ticket</Btn>
        <Btn colors={colors} variant="secondary" icon={Filter}>Filter</Btn>
        <Btn colors={colors} variant="ghost" icon={Settings}>Settings</Btn>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 20, flexWrap: 'wrap' }}>
        <Badge colors={colors} type="success">Resolved</Badge>
        <Badge colors={colors} type="warning">Open</Badge>
        <Badge colors={colors} type="danger">Urgent</Badge>
        <Badge colors={colors} type="primary">In Progress</Badge>
        <Badge colors={colors} type="default">DM</Badge>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <SearchInput colors={colors} />
      </div>

      {/* Status row */}
      <div style={{ marginBottom: 20 }}>
        <StatusRow colors={colors} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <StatCard colors={colors} label="Open Tickets" value="23" icon={MessageSquare} trend={-12} />
        <StatCard colors={colors} label="Avg Response" value="3.2m" icon={Timer} trend={18} />
        <StatCard colors={colors} label="SLA Rate" value="96%" icon={Shield} trend={4} />
      </div>

      {/* Ticket */}
      <TicketCard colors={colors} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   DESIGN OPTION
   ═══════════════════════════════════════════════════════ */
function DesignOption({ ds, index }) {
  return (
    <section id={ds.id} style={{ marginBottom: 100, scrollMarginTop: 80 }}>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{
          fontFamily: FONT.mono, fontSize: 11, color: '#52525b',
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6,
        }}>
          Option {index + 1}
        </div>
        <h2 style={{
          fontFamily: FONT.sans, fontSize: 32, fontWeight: 750,
          color: '#fafafa', letterSpacing: '-0.04em', margin: '0 0 4px',
        }}>
          {ds.name}
        </h2>
        <div style={{
          fontFamily: FONT.sans, fontSize: 15, fontWeight: 450,
          color: '#71717a', marginBottom: 4,
        }}>
          {ds.subtitle}
        </div>
        <div style={{
          fontFamily: FONT.sans, fontSize: 13, color: '#52525b',
          maxWidth: 520, margin: '0 auto', lineHeight: 1.6,
        }}>
          {ds.description}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <ThemePanel colors={ds.light} mode="Light" />
        <ThemePanel colors={ds.dark} mode="Dark" />
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════ */
function Nav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(9,9,11,0.88)',
      backdropFilter: 'blur(16px) saturate(180%)',
      borderBottom: '1px solid #18181b',
      padding: '12px 0',
    }}>
      <div style={{
        maxWidth: 1480, margin: '0 auto', padding: '0 28px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          fontFamily: FONT.sans, fontSize: 15, fontWeight: 650,
          color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: 8,
          letterSpacing: '-0.02em',
        }}>
          <Truck size={18} color="#71717a" strokeWidth={1.75} />
          FleetRelay
          <span style={{
            fontFamily: FONT.mono, fontSize: 10, color: '#52525b',
            padding: '2px 6px', borderRadius: 4, border: '1px solid #27272a',
            fontWeight: 500,
          }}>
            Final Two
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {designSystems.map((ds) => (
            <a key={ds.id} href={`#${ds.id}`} style={{
              fontFamily: FONT.mono, fontSize: 11, fontWeight: 500,
              color: '#71717a', textDecoration: 'none',
              padding: '5px 10px', borderRadius: 5,
              border: '1px solid transparent',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => {
                e.target.style.color = '#e4e4e7'
                e.target.style.borderColor = '#27272a'
                e.target.style.background = '#18181b'
              }}
              onMouseLeave={e => {
                e.target.style.color = '#71717a'
                e.target.style.borderColor = 'transparent'
                e.target.style.background = 'transparent'
              }}
            >
              {ds.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════ */
export default function App() {
  return (
    <div>
      <Nav />

      <div style={{
        textAlign: 'center', padding: '52px 28px 40px',
        maxWidth: 600, margin: '0 auto',
      }}>
        <h1 style={{
          fontFamily: FONT.sans, fontSize: 38, fontWeight: 780,
          color: '#fafafa', letterSpacing: '-0.05em',
          lineHeight: 1.1, margin: '0 0 12px',
        }}>
          Final Two
        </h1>
        <p style={{
          fontFamily: FONT.sans, fontSize: 14, color: '#71717a',
          lineHeight: 1.65, margin: 0,
        }}>
          Graphite (emerald accents) vs Burgundy (deep wine accents). Both in light and dark.
          Compare hex values, buttons, badges, and sample tickets side by side.
        </p>
      </div>

      <div style={{ maxWidth: 1480, margin: '0 auto', padding: '0 28px 80px' }}>
        {designSystems.map((ds, i) => (
          <DesignOption key={ds.id} ds={ds} index={i} />
        ))}
      </div>

      <div style={{
        textAlign: 'center', padding: 28,
        borderTop: '1px solid #18181b',
      }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 11, color: '#3f3f46' }}>
          FleetRelay · {new Date().getFullYear()}
        </span>
      </div>
    </div>
  )
}
