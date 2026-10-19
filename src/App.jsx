import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  
  const [products, setProducts] = useState([])
  const [tasks, setTasks] = useState([])
  const [transactions, setTransactions] = useState([])
  
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  
  const [taskTitle, setTaskTitle] = useState('')
  const [assignee, setAssignee] = useState('')

  const [selectedProduct, setSelectedProduct] = useState('')
  const [transQty, setTransQty] = useState('')
  const [transType, setTransType] = useState('صادر')
  const [clientEvent, setClientEvent] = useState('')

  useEffect(() => {
    if (session) {
      fetchProducts()
      fetchTasks()
      fetchTransactions()
    }
  }, [session])

  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) {
      alert('خطأ في البيانات: ' + error.message)
    } else {
      setSession(data.session)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (!error) setProducts(data)
  }

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*')
    if (!error) setTasks(data)
  }

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select('*')
    if (!error) setTransactions(data)
  }

  const addTransaction = async (e) => {
    e.preventDefault()
    const qtyNum = parseInt(transQty)

    const prod = products.find(p => p.name === selectedProduct)
    if (!prod) {
      alert('الرجاء اختيار صنف صحيح')
      return
    }

    let newQuantity = prod.quantity
    if (transType === 'صادر') {
      if (qtyNum > prod.quantity) {
        alert('الكمية المراد إخراجها أكبر من المتبقي في المستودع!')
        return
      }
      newQuantity = prod.quantity - qtyNum
    } else {
      newQuantity = prod.quantity + qtyNum
    }

    const { error: transError } = await supabase.from('transactions').insert([
      { product_name: selectedProduct, quantity: qtyNum, type: transType, client_or_event: clientEvent }
    ])

    if (transError) {
      alert('خطأ في تسجيل الحركة: ' + transError.message)
      return
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('name', selectedProduct)

    if (updateError) {
      alert('خطأ في تحديث كمية المستودع: ' + updateError.message)
    } else {
      setTransQty('')
      setClientEvent('')
      fetchProducts()
      fetchTransactions()
      alert('تم تسجيل الحركة وتحديث المستودع بنجاح!')
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('tasks').insert([
      { title: taskTitle, status: 'قيد التنفيذ', assignee: assignee }
    ])
    if (error) {
      alert('خطأ في إضافة المهمة: ' + error.message)
    } else {
      setTaskTitle('')
      setAssignee('')
      fetchTasks()
    }
  }

  if (session) {
    return (
      <div style={{ fontFamily: 'system-ui', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '20px', direction: 'rtl' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ color: '#1a365d', margin: '0 0 5px 0' }}>مؤسسة الأجاويد</h1>
              <p style={{ color: '#4a5568', margin: 0 }}>مرحباً بك: {session.user.email}</p>
            </div>
            <button onClick={handleLogout} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
              تسجيل الخروج
            </button>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#2b6cb0' }}>إدارة مخزون ومعدات الأجاويد والمتبقي</h2>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '10px', border: '1px solid #cbd5e0' }}>اسم الصنف</th>
                    <th style={{ padding: '10px', border: '1px solid #cbd5e0' }}>المتبقي في المستودع</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => (
                    <tr key={index}>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e0' }}>{p.name}</td>
                      <td style={{ padding: '10px', border: '1px solid #cbd5e0', fontWeight: 'bold', color: p.quantity > 0 ? '#276749' : '#e53e3e' }}>{p.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: '40px', backgroundColor: '#fffaf0', padding: '20px', borderRadius: '8px', border: '1px solid #feebc8' }}>
            <h2 style={{ color: '#c05621' }}>حركة الصادر والوارد (إيجار / فعاليات)</h2>
            <form onSubmit={addTransaction} style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} style={{ padding: '10px', flex: '2', borderRadius: '5px', border: '1px solid #ccc' }} required>
                <option value="">اختر الصنف</option>
                {products.map((p, idx) => (
                  <option key={idx} value={p.name}>{p.name} (المتبقي: {p.quantity})</option>
                ))}
              </select>
              <input type="number" placeholder="الكمية" value={transQty} onChange={(e) => setTransQty(e.target.value)} style={{ padding: '10px', flex: '1', borderRadius: '5px', border: '1px solid #ccc' }} required />
              <select value={transType} onChange={(e) => setTransType(e.target.value)} style={{ padding: '10px', flex: '1', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="صادر">صادر</option>
                <option value="وارد">وارد</option>
              </select>
              <input type="text" placeholder="اسم الفعالية أو العميل" value={clientEvent} onChange={(e) => setClientEvent(e.target.value)} style={{ padding: '10px', flex: '2', borderRadius: '5px', border: '1px solid #ccc' }} required />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#dd6b20', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>تسجيل الحركة</button>
            </form>

            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', backgroundColor: 'white' }}>
                <thead>
                  <tr style={{ backgroundColor: '#feebc8' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>الصنف</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>الكمية</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>النوع</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>الفعالية أو العميل</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{t.product_name}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{t.quantity}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0', color: t.type === 'صادر' ? '#e53e3e' : '#38a169', fontWeight: 'bold' }}>{t.type}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{t.client_or_event}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 style={{ color: '#2b6cb0' }}>توزيع المهام (نظافة، صيانة، أوقات عمل)</h2>
            <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="عنوان المهمة" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} style={{ padding: '10px', flex: '2', borderRadius: '5px', border: '1px solid #ccc' }} required />
              <input type="text" placeholder="المسؤول عن التنفيذ" value={assignee} onChange={(e) => setAssignee(e.target.value)} style={{ padding: '10px', flex: '1', borderRadius: '5px', border: '1px solid #ccc' }} required />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>إضافة مهمة</button>
            </form>

            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>المهمة</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>المسؤول</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{t.title}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{t.assignee}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '80px', fontFamily: 'system-ui', backgroundColor: '#f4f4f9', height: '100vh', paddingTop: '50px', direction: 'rtl' }}>
      <h1 style={{ color: '#1a365d', fontSize: '32px', marginBottom: '10px' }}>مؤسسة الأجاويد</h1>
      <h3 style={{ color: '#4a5568', marginBottom: '30px' }}>نظام إدارة المستودعات والمهام</h3>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '12px', width: '280px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '15px' }} required />
        <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px', width: '280px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '15px' }} required />
        <button type="submit" style={{ padding: '12px', width: '305px', cursor: 'pointer', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold' }}>تسجيل الدخول</button>
      </form>
    </div>
  )
}

export default App