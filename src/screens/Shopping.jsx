import { useState } from 'react'
import FormModal from '../components/FormModal'
import Fab from '../components/Fab'

const MARKETPLACES = ['יד2', 'פייסבוק מרקטפלייס', 'מדף', 'אחר']

export default function Shopping({ data, add, update, remove }) {
  const { itemsForSale, shoppingList } = data
  const [modal, setModal] = useState(null)

  const setField = (key, val) => setModal(prev => prev ? { ...prev, fields: { ...prev.fields, [key]: val } } : prev)

  function openAddSale() {
    setModal({ mode: 'add', type: 'sale', fields: { name: '', price: '', marketplace: MARKETPLACES[0] } })
  }
  function openAddShop() {
    setModal({ mode: 'add', type: 'shop', fields: { name: '', budget: '' } })
  }
  function openEditSale(item) {
    setModal({ mode: 'edit', type: 'sale', id: item.id, fields: { name: item.name, price: item.price || '', marketplace: item.marketplace || MARKETPLACES[0] } })
  }
  function openEditShop(item) {
    setModal({ mode: 'edit', type: 'shop', id: item.id, fields: { name: item.name, budget: item.budget || '' } })
  }

  function handleSave() {
    if (!modal) return
    const { name } = modal.fields
    if (!name.trim()) return

    if (modal.type === 'sale') {
      const obj = { name: name.trim(), price: modal.fields.price, marketplace: modal.fields.marketplace }
      if (modal.mode === 'add') add('itemsForSale', { ...obj, sold: false })
      else update('itemsForSale', modal.id, obj)
    } else {
      const obj = { name: name.trim(), budget: modal.fields.budget }
      if (modal.mode === 'add') add('shoppingList', { ...obj, bought: false })
      else update('shoppingList', modal.id, obj)
    }
  }

  const saleItems = [...itemsForSale].sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
  const shopItems = [...shoppingList].sort((a, b) => (a.bought === b.bought ? 0 : a.bought ? 1 : -1))

  const shopTotal = shoppingList.reduce((sum, i) => sum + (Number(i.budget) || 0), 0)
  const shopBoughtTotal = shoppingList.filter(i => i.bought).reduce((sum, i) => sum + (Number(i.budget) || 0), 0)

  const modalTitle = modal?.mode === 'edit'
    ? (modal.type === 'sale' ? 'עריכת פריט למכירה' : 'עריכת פריט')
    : (modal?.type === 'sale' ? 'הוסף פריט למכירה' : 'הוסף פריט לקנייה')

  return (
    <>
      <div className="page-header">
        <h1>🛒 קניות ומכירות</h1>
      </div>

      <div className="card">
        <div className="card-title">פריטים למכירה/מסירה 💰</div>
        {saleItems.length === 0 ? (
          <p className="empty-state">אין פריטים למכירה עדיין</p>
        ) : (
          saleItems.map(item => (
            <div key={item.id} className="shop-item" onClick={() => openEditSale(item)} style={{ cursor: 'pointer' }}>
              <div
                className={`shop-check ${item.sold ? 'done' : ''}`}
                onClick={e => { e.stopPropagation(); update('itemsForSale', item.id, { sold: !item.sold }) }}
              >
                {item.sold && '✓'}
              </div>
              <div className="shop-name" style={{ textDecoration: item.sold ? 'line-through' : 'none', color: item.sold ? 'var(--text-muted)' : 'var(--text)' }}>
                {item.name}
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.marketplace}</div>
              </div>
              {item.price && <div className="shop-price">₪{item.price}</div>}
              <button className="task-delete" onClick={e => { e.stopPropagation(); remove('itemsForSale', item.id) }}>✕</button>
            </div>
          ))
        )}
      </div>

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
            <div key={item.id} className="shop-item" onClick={() => openEditShop(item)} style={{ cursor: 'pointer' }}>
              <div
                className={`shop-check ${item.bought ? 'done' : ''}`}
                onClick={e => { e.stopPropagation(); update('shoppingList', item.id, { bought: !item.bought }) }}
              >
                {item.bought && '✓'}
              </div>
              <div className="shop-name" style={{ textDecoration: item.bought ? 'line-through' : 'none', color: item.bought ? 'var(--text-muted)' : 'var(--text)' }}>
                {item.name}
              </div>
              {item.budget && <div className="shop-price">₪{item.budget}</div>}
              <button className="task-delete" onClick={e => { e.stopPropagation(); remove('shoppingList', item.id) }}>✕</button>
            </div>
          ))
        )}
      </div>

      <Fab actions={[
        { icon: '💰', label: 'פריט למכירה', onClick: openAddSale },
        { icon: '🛍️', label: 'פריט לקנייה', onClick: openAddShop },
      ]} />

      <FormModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        onSave={handleSave}
        title={modalTitle}
        saveLabel={modal?.mode === 'edit' ? 'שמור' : 'הוסף'}
      >
        {modal?.type === 'sale' && (
          <>
            <div className="input-group">
              <input className="input" placeholder="שם הפריט" value={modal.fields.name}
                onChange={e => setField('name', e.target.value)} />
            </div>
            <div className="input-row">
              <input className="input" placeholder="מחיר" value={modal.fields.price} type="number" min="0"
                onChange={e => setField('price', e.target.value)} />
              <select className="input" value={modal.fields.marketplace} onChange={e => setField('marketplace', e.target.value)}>
                {MARKETPLACES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </>
        )}
        {modal?.type === 'shop' && (
          <>
            <div className="input-row">
              <input className="input" placeholder="שם הפריט" value={modal.fields.name}
                onChange={e => setField('name', e.target.value)} />
              <input className="input" placeholder="תקציב ₪" value={modal.fields.budget} type="number" min="0"
                onChange={e => setField('budget', e.target.value)} style={{ maxWidth: 120 }} />
            </div>
          </>
        )}
      </FormModal>
    </>
  )
}
