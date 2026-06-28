// src/pages/Dashboard.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useFetch } from '../hooks/useFetch'
import { getDashboard } from '../api/inventory'
import { StatCard, Card, Badge, LoadingPage, PageHeader } from '../components/ui'
import { formatCurrency, formatNumber } from '../utils/format'

const PIE_COLORS = ['#3b5bdb', '#2f9e44', '#e67700', '#c92a2a', '#7048e8']

export default function Dashboard() {
  const { data, loading } = useFetch(getDashboard)

  if (loading) return <LoadingPage />

  const counts = data?.counts || {}
  const today = data?.todaySales || {}
  const month = data?.thisMonthSales || {}
  const valuation = data?.inventoryValuation || {}
  const topSellers = data?.topSellersThisMonth || []
  const criticalAlerts = data?.criticalStockAlerts || []

  // Format top sellers for bar chart
  const chartData = topSellers.map(p => ({
    name: p.productName.length > 12 ? p.productName.slice(0, 12) + '…' : p.productName,
    revenue: p.totalValue,
    qty: p.totalQuantity
  }))

  // Format warehouse valuation for pie
  const pieData = (valuation.byWarehouse || []).map(w => ({
    name: w.warehouseName,
    value: w.totalCostValue
  }))

  return (
    <div>
      <PageHeader
        title="Dashboard"
        sub={`Good morning! Here's what's happening today.`}
      />

      {/* Critical alerts banner */}
      {criticalAlerts.length > 0 && (
        <div style={{
          background: 'var(--danger-light)', border: '1px solid var(--danger)',
          borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div>
            <strong style={{ color: 'var(--danger)' }}>{criticalAlerts.length} product(s) are out of stock</strong>
            <span style={{ color: 'var(--danger)', fontSize: 13 }}>
              {' '}— {criticalAlerts.map(a => a.productName).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Stat cards row 1 — entity counts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <StatCard label="Total Products"   value={formatNumber(counts.totalProducts)}   icon="📦" />
        <StatCard label="Warehouses"       value={formatNumber(counts.totalWarehouses)}  icon="🏪" color="var(--success)" />
        <StatCard label="Suppliers"        value={formatNumber(counts.totalSuppliers)}   icon="🏭" color="var(--warning)" />
        <StatCard label="Users"            value={formatNumber(counts.totalUsers)}        icon="👥" color="var(--info)" />
      </div>

      {/* Stat cards row 2 — money */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Today's Revenue"
          value={formatCurrency(today.totalRevenue)}
          sub={`${today.ordersPlaced || 0} orders · ${today.unitsSold || 0} units`}
          color="var(--primary)"
        />
        <StatCard
          label="Today's Profit"
          value={formatCurrency(today.totalGrossProfit)}
          sub="gross profit after COGS"
          color="var(--success)"
        />
        <StatCard
          label="Month Revenue"
          value={formatCurrency(month.totalRevenue)}
          sub={`${month.ordersPlaced || 0} orders this month`}
          color="var(--primary)"
        />
        <StatCard
          label="Inventory Value"
          value={formatCurrency(valuation.totalCostValue)}
          sub={`${formatCurrency(valuation.potentialProfit)} potential profit`}
          color="var(--warning)"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Top sellers bar chart */}
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
            Top sellers this month
          </h3>
          {chartData.length === 0
            ? <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No sales data yet</p>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ left: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </Card>

        {/* Inventory value pie chart */}
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
            Stock value by warehouse
          </h3>
          {pieData.length === 0
            ? <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No inventory yet</p>
            : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                  {pieData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-2)' }}>{d.name}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{formatCurrency(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </Card>
      </div>

      {/* Low stock alerts table */}
      {(data?.criticalAlertCount > 0) && (
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
            Stock alerts <Badge variant="danger">{criticalAlerts.length} critical</Badge>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {criticalAlerts.map((alert, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'var(--danger-light)',
                borderRadius: 'var(--radius)', fontSize: 13
              }}>
                <div>
                  <strong>{alert.productName}</strong>
                  <span style={{ color: 'var(--text-3)', marginLeft: 8 }}>({alert.sku})</span>
                  <span style={{ color: 'var(--text-2)', marginLeft: 8 }}>— {alert.warehouseName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Supplier: {alert.supplierName}</span>
                  <Badge variant="danger">{alert.urgency}</Badge>
                  <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{alert.currentQuantity} left</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}