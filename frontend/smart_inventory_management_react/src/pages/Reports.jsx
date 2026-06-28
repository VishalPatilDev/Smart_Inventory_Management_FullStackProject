// src/pages/Reports.jsx
import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useFetch } from '../hooks/useFetch'
import { getSalesReport, getPurchaseReport, getInventoryValuation, getLowStockAlerts } from '../api/inventory'
import { Card, Badge, PageHeader, LoadingPage, Button, Input } from '../components/ui'
import { formatCurrency, formatNumber, formatDate, monthStart, today } from '../utils/format'

export default function Reports() {
  const [from, setFrom] = useState(monthStart())
  const [to, setTo] = useState(today())
  const [applied, setApplied] = useState({ from: monthStart(), to: today() })

  const { data: sales, loading: salesLoading } = useFetch(
    () => getSalesReport(applied.from, applied.to), [applied.from, applied.to]
  )
  const { data: purchases } = useFetch(
    () => getPurchaseReport(applied.from, applied.to), [applied.from, applied.to]
  )
  const { data: valuation } = useFetch(getInventoryValuation)
  const { data: lowStock } = useFetch(getLowStockAlerts)

  const applyRange = () => setApplied({ from, to })

  // Combine sales + purchase items for comparison chart
  const comparisonData = (sales?.items || []).map(item => {
    const purchaseRow = (purchases?.items || []).find(p => p.sku === item.sku)
    return {
      name: item.productName.slice(0, 10),
      revenue: item.revenueGenerated,
      cost: item.costOfGoods,
      profit: item.grossProfit,
      purchased: purchaseRow?.totalAmountSpent || 0
    }
  })

  return (
    <div>
      <PageHeader title="Reports" sub="Business intelligence across your inventory" />

      {/* Date range selector */}
      <Card style={{ marginBottom: 20, padding: '14px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 13, fontWeight: 500 }}>From</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 160 }} />
          <label style={{ fontSize: 13, fontWeight: 500 }}>To</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 160 }} />
          <Button onClick={applyRange}>Apply</Button>
          <span style={{ color: 'var(--text-3)', fontSize: 12 }}>
            {formatDate(applied.from)} — {formatDate(applied.to)}
          </span>
        </div>
      </Card>

      {salesLoading ? <LoadingPage /> : (
        <>
          {/* Summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total Revenue', value: formatCurrency(sales?.totalRevenue), color: 'var(--primary)' },
              { label: 'Gross Profit', value: formatCurrency(sales?.totalGrossProfit), color: 'var(--success)' },
              { label: 'Cost of Goods', value: formatCurrency(sales?.totalCostOfGoods), color: 'var(--warning)' },
              { label: 'Orders Placed', value: sales?.totalOrdersPlaced || 0, color: 'var(--info)' },
            ].map((s) => (
              <Card key={s.label}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              </Card>
            ))}
          </div>

          {/* Sales vs Cost bar chart */}
          <Card style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Revenue vs Cost by Product</h3>
            {comparisonData.length === 0
              ? <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No sales in this period</p>
              : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[3,3,0,0]} />
                    <Bar dataKey="cost" name="Cost" fill="var(--warning)" radius={[3,3,0,0]} />
                    <Bar dataKey="profit" name="Profit" fill="var(--success)" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            }
          </Card>

          {/* Sales items table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <Card>
              <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Sales by Product</h3>
              {(sales?.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.productName}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{item.totalQuantitySold} units sold</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(item.revenueGenerated)}</div>
                    <div style={{ fontSize: 11, color: 'var(--success)' }}>profit: {formatCurrency(item.grossProfit)}</div>
                  </div>
                </div>
              ))}
              {(sales?.items || []).length === 0 && <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No sales data</p>}
            </Card>

            {/* Low stock alerts */}
            <Card>
              <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>
                Low Stock Alerts <Badge variant={lowStock?.length > 0 ? 'warning' : 'success'}>{lowStock?.length || 0}</Badge>
              </h3>
              {(lowStock || []).length === 0
                ? <p style={{ color: 'var(--success)', fontSize: 13 }}>✓ All stock levels are healthy</p>
                : (lowStock || []).map((alert, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>{alert.productName}</span>
                        <span style={{ color: 'var(--text-3)', fontSize: 11, marginLeft: 6 }}>{alert.warehouseName}</span>
                      </div>
                      <Badge variant={alert.urgency === 'CRITICAL' ? 'danger' : 'warning'}>{alert.urgency}</Badge>
                    </div>
                    <div style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 2 }}>
                      {alert.currentQuantity} in stock · threshold {alert.reorderThreshold} · order from {alert.supplierName}
                    </div>
                  </div>
                ))
              }
            </Card>
          </div>

          {/* Warehouse valuation */}
          <Card>
            <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Inventory Valuation by Warehouse</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {(valuation || []).map((wh, i) => (
                <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 14 }}>
                  <div style={{ fontWeight: 600, marginBottom: 10 }}>{wh.warehouseName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-3)' }}>Stock Cost Value</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(wh.totalCostValue)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-3)' }}>Potential Revenue</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(wh.totalSaleValue)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-3)' }}>Potential Profit</span>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(wh.totalPotentialProfit)}</span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
                    {wh.totalProducts} products · {formatNumber(wh.totalUnits)} total units
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}