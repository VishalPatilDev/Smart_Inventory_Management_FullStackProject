// src/pages/StaffDashboard.jsx
// STAFF's home page. Deliberately does NOT show revenue, profit, or
// any financial figures — those are owner/admin-level information.
// STAFF only sees what they need operationally: stock levels and alerts.

import { useFetch } from '../hooks/useFetch'
import { getAllInventory, getLowStockAlerts } from '../api/inventory'
import { StatCard, Card, Badge, LoadingPage, PageHeader } from '../components/ui'
import { formatNumber } from '../utils/format'
import { useAuth } from '../context/AuthContext'

export default function StaffDashboard() {
  const { user } = useAuth()
  const { data: inventory, loading: invLoading } = useFetch(getAllInventory)
  const { data: lowStock, loading: alertsLoading } = useFetch(getLowStockAlerts)

  if (invLoading || alertsLoading) return <LoadingPage />

  const totalProducts = new Set((inventory || []).map(i => i.sku)).size
  const totalUnits = (inventory || []).reduce((sum, i) => sum + i.quantity, 0)
  const outOfStockCount = (inventory || []).filter(i => i.quantity === 0).length

  return (
    <div>
      <PageHeader
        title="My Dashboard"
        sub={`Welcome back, ${user?.email}. Here's the current stock overview.`}
      />

      {/* Stat cards — operational numbers only, no money */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Distinct Products" value={formatNumber(totalProducts)} icon="📦" />
        <StatCard label="Total Units in Stock" value={formatNumber(totalUnits)} icon="📋" color="var(--success)" />
        <StatCard
          label="Out of Stock Items"
          value={formatNumber(outOfStockCount)}
          icon="🚨"
          color={outOfStockCount > 0 ? 'var(--danger)' : 'var(--success)'}
        />
      </div>

      {/* Low stock alerts — the main thing STAFF needs to act on */}
      <Card>
        <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
          Stock Alerts <Badge variant={(lowStock || []).length > 0 ? 'warning' : 'success'}>
            {(lowStock || []).length}
          </Badge>
        </h3>

        {(lowStock || []).length === 0 ? (
          <p style={{ color: 'var(--success)', fontSize: 13 }}>
            ✓ All stock levels are healthy — nothing needs reordering right now.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lowStock.map((alert, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                background: alert.urgency === 'CRITICAL' ? 'var(--danger-light)' : 'var(--warning-light)',
                borderRadius: 'var(--radius)', fontSize: 13
              }}>
                <div>
                  <strong>{alert.productName}</strong>
                  <span style={{ color: 'var(--text-3)', marginLeft: 8 }}>({alert.sku})</span>
                  <span style={{ color: 'var(--text-2)', marginLeft: 8 }}>— {alert.warehouseName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--text-3)', fontSize: 12 }}>
                    Reorder from: {alert.supplierName}
                  </span>
                  <Badge variant={alert.urgency === 'CRITICAL' ? 'danger' : 'warning'}>
                    {alert.urgency}
                  </Badge>
                  <span style={{ fontWeight: 600 }}>{alert.currentQuantity} left</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div style={{
        marginTop: 20, padding: '12px 16px',
        background: 'var(--info-light)', borderRadius: 'var(--radius)',
        fontSize: 13, color: 'var(--info)'
      }}>
        💡 Notice low stock? Let your admin know so they can place a purchase order.
      </div>
    </div>
  )
}