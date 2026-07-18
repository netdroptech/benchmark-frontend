import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Copy, TrendingUp, Users, ShieldCheck, Loader2, X,
  BadgeCheck, Search,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:4000'

function imgSrc(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${API_BASE}${url}`
}

interface CopyTrader {
  id:            string
  name:          string
  username:      string
  imageUrl:      string | null
  strategy:      string
  description:   string | null
  winRate:       number
  monthlyReturn: number
  totalReturn:   number
  followers:     number
  minAmount:     number
  riskLevel:     string
  tags:          string[]
  isVerified:    boolean
}

const RISK_COLOR: Record<string, { color: string; bg: string }> = {
  Low:    { color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  High:   { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function TraderAvatar({ trader, size = 44 }: { trader: CopyTrader; size?: number }) {
  const src = imgSrc(trader.imageUrl)
  const [errored, setErrored] = useState(false)
  if (src && !errored) {
    return (
      <img
        src={src}
        alt={trader.name}
        onError={() => setErrored(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(0,255,4,0.12)', border: '1px solid rgba(0,255,4,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#00ff04', fontWeight: 700, fontSize: size * 0.36 }}>
      {initials(trader.name)}
    </div>
  )
}

export function CopyTrading() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [traders, setTraders] = useState<CopyTrader[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [riskFilter, setRiskFilter] = useState('All')
  const [query, setQuery]     = useState('')
  const [modal, setModal]     = useState<CopyTrader | null>(null)

  const balance = user?.balance ?? 0

  const fetchTraders = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.get<{ success: boolean; data: CopyTrader[] }>('/user/traders')
      setTraders(res.data ?? [])
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load traders.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTraders() }, [fetchTraders])

  const filtered = traders.filter(t => {
    if (riskFilter !== 'All' && t.riskLevel !== riskFilter) return false
    if (query && !`${t.name} ${t.username} ${t.strategy}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const avgReturn = traders.length
    ? traders.reduce((s, t) => s + t.monthlyReturn, 0) / traders.length
    : 0

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'hsl(40 6% 95%)' }}>Copy Traders</h1>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>Pro</span>
          </div>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 55%)' }}>Follow and mirror the moves of top-performing traders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Available Traders', value: `${traders.length}`,               icon: Users,      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
          { label: 'Avg Monthly Return', value: `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%`, icon: TrendingUp, color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
          { label: 'Your Balance',      value: `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: ShieldCheck, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(40 6% 92%)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(240 5% 45%)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search traders…"
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(40 6% 90%)', fontSize: 13, outline: 'none' }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {['All', 'Low', 'Medium', 'High'].map(r => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              style={{ padding: '0.45rem 0.85rem', borderRadius: '0.6rem', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', ...(riskFilter === r ? { background: 'rgba(0,255,4,0.12)', color: '#00ff04', borderColor: 'rgba(0,255,4,0.3)' } : { background: 'rgba(255,255,255,0.04)', color: 'hsl(240 5% 55%)', borderColor: 'rgba(255,255,255,0.08)' }) }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'hsl(240 5% 55%)' }}>
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#f87171', fontSize: 14 }}>
          {error}
          <div>
            <button onClick={fetchTraders} style={{ marginTop: 12, padding: '0.45rem 1rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(40 6% 80%)', fontSize: 12, cursor: 'pointer' }}>Retry</button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(240 5% 55%)', fontSize: 14 }}>
          No traders match your filters yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(trader => {
            const risk = RISK_COLOR[trader.riskLevel] ?? RISK_COLOR.Medium
            return (
              <div key={trader.id} style={{ background: 'hsl(260 60% 5%)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '0.875rem', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <TraderAvatar trader={trader} />
                    <div>
                      <div className="flex items-center gap-1">
                        <p style={{ fontWeight: 700, color: 'hsl(40 6% 92%)', fontSize: 14 }}>{trader.name}</p>
                        {trader.isVerified && <BadgeCheck size={14} style={{ color: '#60a5fa' }} />}
                      </div>
                      <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>@{trader.username}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, fontWeight: 600, color: risk.color, background: risk.bg }}>{trader.riskLevel}</span>
                </div>

                {/* Return */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: trader.monthlyReturn >= 0 ? '#4ade80' : '#f87171', letterSpacing: '-0.02em' }}>
                      {trader.monthlyReturn >= 0 ? '+' : ''}{trader.monthlyReturn.toFixed(1)}%
                    </p>
                    <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>monthly return · {trader.strategy}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Win Rate',    value: `${trader.winRate.toFixed(0)}%` },
                    { label: 'Total',       value: `${trader.totalReturn >= 0 ? '+' : ''}${trader.totalReturn.toFixed(0)}%` },
                    { label: 'Followers',   value: trader.followers.toLocaleString() },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '0.4rem 0.25rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(40 6% 85%)' }}>{s.value}</p>
                      <p style={{ fontSize: 10, color: 'hsl(240 5% 50%)', marginTop: 1 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                {trader.tags?.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {trader.tags.slice(0, 3).map(t => (
                      <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'hsl(40 6% 70%)' }}>{t}</span>
                    ))}
                  </div>
                )}

                {/* Min amount + CTA */}
                <div className="flex items-center justify-between mt-auto gap-2">
                  <div>
                    <p style={{ fontSize: 10, color: 'hsl(240 5% 50%)' }}>Min. amount</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'hsl(40 6% 88%)' }}>${trader.minAmount.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => setModal(trader)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.55rem 1rem', borderRadius: '0.6rem', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg, #88fc8a 0%, #00ff04 100%)', color: '#050505', border: 'none' }}
                  >
                    <Copy size={13} /> Copy Trader
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Copy modal */}
      {modal && (
        <CopyModal
          trader={modal}
          balance={balance}
          onClose={() => setModal(null)}
          onDeposit={() => { setModal(null); navigate('/dashboard/deposit') }}
        />
      )}
    </div>
  )
}

function CopyModal({ trader, balance, onClose, onDeposit }: {
  trader: CopyTrader
  balance: number
  onClose: () => void
  onDeposit: () => void
}) {
  const [submitted, setSubmitted] = useState(false)
  const insufficient = balance < trader.minAmount

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '1rem' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: 'hsl(260 60% 6%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'hsl(240 5% 55%)', cursor: 'pointer' }}>
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <TraderAvatar trader={trader} size={48} />
          <div>
            <p style={{ fontWeight: 700, color: 'hsl(40 6% 92%)', fontSize: 15 }}>{trader.name}</p>
            <p style={{ fontSize: 12, color: 'hsl(240 5% 55%)' }}>@{trader.username} · {trader.strategy}</p>
          </div>
        </div>

        {trader.description && (
          <p style={{ fontSize: 13, color: 'hsl(240 5% 65%)', marginBottom: 16, lineHeight: 1.5 }}>{trader.description}</p>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Monthly',  value: `${trader.monthlyReturn >= 0 ? '+' : ''}${trader.monthlyReturn.toFixed(1)}%` },
            { label: 'Win Rate', value: `${trader.winRate.toFixed(0)}%` },
            { label: 'Min.',     value: `$${trader.minAmount.toLocaleString()}` },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '0.5rem 0.25rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(40 6% 88%)' }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'hsl(240 5% 50%)', marginTop: 1 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <BadgeCheck size={32} style={{ color: '#4ade80', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'hsl(40 6% 90%)', marginBottom: 4 }}>Copy request received</p>
            <p style={{ fontSize: 12, color: 'hsl(240 5% 55%)', lineHeight: 1.5 }}>
              Your request to copy {trader.name} has been submitted. Our team will activate it on your account shortly.
            </p>
            <button onClick={onClose} style={{ marginTop: 16, width: '100%', padding: '0.65rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'hsl(40 6% 85%)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Done</button>
          </div>
        ) : insufficient ? (
          <>
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '0.6rem', padding: '0.75rem', marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: '#f87171', lineHeight: 1.5 }}>
                Your balance (${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) is below the ${trader.minAmount.toLocaleString()} minimum to copy this trader.
              </p>
            </div>
            <button onClick={onDeposit} style={{ width: '100%', padding: '0.7rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #88fc8a 0%, #00ff04 100%)', color: '#050505', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Deposit Funds
            </button>
          </>
        ) : (
          <button onClick={() => setSubmitted(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.7rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #88fc8a 0%, #00ff04 100%)', color: '#050505', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            <Copy size={14} /> Start Copying
          </button>
        )}
      </div>
    </div>
  )
}
