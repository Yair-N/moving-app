import { useState } from 'react'

const MARKETPLACES = ['יד2', 'פייסבוק מרקטפלייס', 'מדף', 'אחר']

export default function Shopping({ data, add, update, remove }) {
  const { itemsForSale, shoppingList } = data

  // Items for sale/giveaway
  const [saleName, setSaleName] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [saleMkt, setSaleMkt] = useState(MARKETPLACES[0])

  // Shopping list
  const [shopName, setShopName] = useState('')
  const [shopBudget, setShopBudget] = useState('')

  function addSaleItem(e) {
    e.preventDefault()
    if (!saleName.trim()) return
    add('itemsForSale', { name: saleName.trim(), price: salePrice, marketplace: saleMkt, sold: false })
    setSaleName(''); setSalePrice(''); setSaleMkt(MARKETPLACES[0])
  }

  function addShopItem(e) {
    e.preventDefault()
    if (!shopName.trim()) return
    add('shoppingList', { name: shopName.trim(), budget: shopBudget, bought: false })
    setShopName(''); setShopBudget('')
  }

  const saleItems = [...itemsForSale].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
  const shopItems = [...shoppingList].sort((a, b) => (a.bought === b.bought ? 0 : a.bought ? 1 : -1))

  const shopTotal = shoppingList.reduce((sum, i) => sum + (Number(i.budget) || 0), 0)
  const shopBoughtTotal = shoppingList.filter(i => i.bought).reduce((sum, i) => sum + (Number(i.budget) || 0), 0)

  return (
    <>
      <div className="page-header">
        <h1>🛒 קניות ומכירות</h1>
      </div>

      {/* Items for sale */}
      <div className="card">
        <div className="card-title">פריטים למכירה/מסירה 💰</div>
        {saleItems.length === 0 ? (
          <p className="empty-state">אין פריטים למכירה עדיין</p>
        ) : (
          saleItems.map(item => (
            <div key={item.id} className="shop-item">
              <div
                className={`shop-check ${item.sold ? 'done' : ''}`}
                onClick={() => update('itemsForSale', item.id, { sold: !item.sold })}
              >
                {item.sold && '✓'}
              </div>
              <div className="shop-name" style={{ textDecoration: item.sold ? 'line-through' : 'none', color: item.sold ? 'var(--text-muted)' : 'var(--text)' }}>
                {item.name}
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.marketplace}</div>
              </div>
              {item.price && <div className="shop-price">₪{item.price}</div>}
              <button className="task-delete" onClick={() => remove('itemsForSale', item.id)}>✕</button>
            </div>
          ))
        )}

        <div className="section-divider" style={{ marginTop: 12 }}>הוסף פריט</div>
        <form onSubmit={addSaleItem}>
          <div className="input-group">
            <input className="input" placeholder="שם הפריט" value={saleName}
              onChange={e => setSaleName(e.target.value)} />
          </div>
          <div className="input-row">
            <input className="input" placeholder="מחיר" value={salePrice} type="number" min="0"
              onChange={e => setSalePrice(e.target.value)} />
            <select className="input" value={saleMkt} onChange={e => setSaleMkt(e.target.value)}>
              {MARKETPLACES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-secondary">הוסף</button>
        </form>
      </div>

      {/* Shopping list */}
      <div className="card">
        <div className="card-title">רשימת קניות לבית 🛍️</div>

        {shopTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            <span>קנינו: ₪{shopBoughtTotal.toLocaleString()}</span>
            <span>סה"כ: ₪{shopTotal.toLocaleString()}</span>
          </div>
        )}

        {shopItems.length === 0 ? (
          <p className="empty-state">רשימת הקניות ריקה</p>
        ) : (
          shopItems.map(item => (
            <div key={item.id} className="shop-item">
              <div
                className={`shop-check ${item.bought ? 'done' : ''}`}
                onClick={() => update('shoppingList', item.id, { bought: !item.bought })}
              >
                {item.bought && '✓'}
              </div>
              <div className="shop-name" style={{ textDecoration: item.bought ? 'line-through' : 'none', color: item.bought ? 'var(--text-muted)' : 'var(--text)' }}>
                {item.name}
              </div>
              {item.budget && <div className="shop-price">₪{item.budget}</div>}
              <button className="task-delete" onClick={() => remove('shoppingList', item.id)}>✕</button>
            </div>
          ))
        )}

        <div className="section-divider" style={{ marginTop: 12 }}>הוסף פריט</div>
        <form onSubmit={addShopItem}>
          <div className="input-row">
            <input className="input" placeholder="שם הפריט" value={shopName}
              onChange={e => setShopName(e.target.value)} />
            <input className="input" placeholder="תקציב ₪" value={shopBudget} type="number" min="0"
              onChange={e => setShopBudget(e.target.value)} style={{ maxWidth: 120 }} />
          </div>
          <button type="submit" className="btn btn-primary">הוסף</button>
        </form>
      </div>
    </>
  )
}
