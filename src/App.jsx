import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// قاموس التربجمة (عربي / أوردو)
const t = {
  ar: {
    title: "مؤسسة الأجاويد",
    subtitle: "نظام إدارة المستودعات والمهام",
    welcome: "مرحباً بك:",
    logout: "تسجيل الخروج",
    inventoryTitle: "إدارة مخزون ومعدات الأجاويد والمتبقي",
    productName: "اسم الصنف",
    remaining: "المتبقي في المستودع",
    transTitle: "حركة الصادر والوارد (إيجار / فعاليات)",
    selectProduct: "اختر الصنف",
    quantity: "الكمية",
    type: "النوع",
    outgoing: "صادر",
    incoming: "وارد",
    clientEvent: "اسم الفعالية أو العميل",
    addMovement: "تسجيل الحركة",
    movementTableProd: "الصنف",
    movementTableQty: "الكمية",
    movementTableType: "النوع",
    movementTableClient: "الفعالية أو العميل",
    tasksTitle: "توزيع المهام (نظافة، صيانة، أوقات عمل)",
    taskTitlePlaceholder: "عنوان المهمة",
    assignedPlaceholder: "المسؤول عن التنفيذ",
    addTaskBtn: "إضافة مهمة",
    taskCol: "المهمة",
    assignedCol: "المسؤول",
    statusCol: "الحالة",
    actionCol: "الإجراء",
    completeBtn: "إنجاز",
    completedStatus: "تم التنفيذ",
    inProgressStatus: "قيد التنفيذ",
    loginEmail: "البريد الإلكتروني",
    loginPassword: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    langToggle: "اردو"
  },
  ur: {
    title: "الاجاوید ادارہ",
    subtitle: "گودام اور ٹاسک مینجمنٹ سسٹم",
    welcome: "خوش آمدید:",
    logout: "لاگ آؤٹ",
    inventoryTitle: "الاجاوید اسٹاک اور سامان کا انتظام",
    productName: "آئٹم کا نام",
    remaining: "گودام میں باقی",
    transTitle: "آؤٹ گوئنگ اور ان کمنگ موومੈਂٹ (کرایہ / تقریبات)",
    selectProduct: "آئٹم منتخب کریں",
    quantity: "مقدار",
    type: "قسم",
    outgoing: "آؤٹ گوئنگ (صادر)",
    incoming: "ان کمنگ (وارد)",
    clientEvent: "تقریب یا کسٹمر کا نام",
    addMovement: "حرکت درج کریں",
    movementTableProd: "آئٹم",
    movementTableQty: "مقدار",
    movementTableType: "قسم",
    movementTableClient: "تقریب یا کسٹمر",
    tasksTitle: "ٹاسک کی تقسیم (صفائی، دیکھ بھال، اوقات کار)",
    taskTitlePlaceholder: "ٹاسک کا عنوان",
    assignedPlaceholder: "ذمہ دار شخص",
    addTaskBtn: "ٹاسک شامل کریں",
    taskCol: "ٹاسک",
    assignedCol: "ذمہ دار",
    statusCol: "حالت",
    actionCol: "کارروائی",
    completeBtn: "مکمل",
    completedStatus: "مکمل ہو گیا",
    inProgressStatus: "جاری ہے",
    loginEmail: "ای میل ایڈریس",
    loginPassword: "پاس ورڈ",
    loginBtn: "لاگ ان کریں",
    langToggle: "العربية"
  }
}

function App() {
  const [lang, setLang] = useState('ar') // اللغة الافتراضية عربية
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  
  const [products, setProducts] = useState([])
  const [tasks, setTasks] = useState([])
  const [transactions, setTransactions] = useState([])
  
  const [taskTitle, setTaskTitle] = useState('')
  const [assigned_to, setAssignedTo] = useState('')

  const [selectedProduct, setSelectedProduct] = useState('')
  const [transQty, setTransQty] = useState('')
  const [transType, setTransType] = useState('صادر')
  const [clientEvent, setClientEvent] = useState('')

  const dict = t[lang] // القاموس الحالي بناءً على اللغة المحددة

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
    const initialStatus = lang === 'ur' ? 'جاری ہے' : 'قيد التنفيذ'
    const { error } = await supabase.from('tasks').insert([
      { title: taskTitle, status: initialStatus, assigned_to: assigned_to }
    ])
    if (error) {
      alert('خطأ في إضافة المهمة: ' + error.message)
    } else {
      setTaskTitle('')
      setAssignedTo('')
      fetchTasks()
    }
  }

  const updateTaskStatus = async (id) => {
    const newStatus = lang === 'ur' ? 'مکمل ہو گیا' : 'تم التنفيذ'
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('خطأ في تحديث حالة المهمة: ' + error.message)
    } else {
      fetchTasks()
    }
  }

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'ur' : 'ar')
  }

  if (session) {
    return (
      <div style={{ fontFamily: 'system-ui', backgroundColor: '#f4f4f9', minHeight: '100vh', padding: '20px', direction: lang === 'ur' ? 'rtl' : 'rtl' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}>
          
          {/* رأس الصفحة وزر تغيير اللغة */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ color: '#1a365d', margin: '0 0 5px 0' }}>{dict.title}</h1>
              <p style={{ color: '#4a5568', margin: 0 }}>{dict.welcome} {session.user.email}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={toggleLanguage} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
                {dict.langToggle}
              </button>
              <button onClick={handleLogout} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
                {dict.logout}
              </button>
            </div>
          </div>

          {/* قسم المخزون */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ color: '#2b6cb0' }}>{dict.inventoryTitle}</h2>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '10px', border: '1px solid #cbd5e0' }}>{dict.productName}</th>
                    <th style={{ padding: '10px', border: '1px solid #cbd5e0' }}>{dict.remaining}</th>
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

          {/* قسم حركات الصادر والوارد */}
          <div style={{ marginBottom: '40px', backgroundColor: '#fffaf0', padding: '20px', borderRadius: '8px', border: '1px solid #feebc8' }}>
            <h2 style={{ color: '#c05621' }}>{dict.transTitle}</h2>
            <form onSubmit={addTransaction} style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} style={{ padding: '10px', flex: '2', borderRadius: '5px', border: '1px solid #ccc' }} required>
                <option value="">{dict.selectProduct}</option>
                {products.map((p, idx) => (
                  <option key={idx} value={p.name}>{p.name}</option>
                ))}
              </select>
              <input type="number" placeholder={dict.quantity} value={transQty} onChange={(e) => setTransQty(e.target.value)} style={{ padding: '10px', flex: '1', borderRadius: '5px', border: '1px solid #ccc' }} required />
              <select value={transType} onChange={(e) => setTransType(e.target.value)} style={{ padding: '10px', flex: '1', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="صادر">{dict.outgoing}</option>
                <option value="وارد">{dict.incoming}</option>
              </select>
              <input type="text" placeholder={dict.clientEvent} value={clientEvent} onChange={(e) => setClientEvent(e.target.value)} style={{ padding: '10px', flex: '2', borderRadius: '5px', border: '1px solid #ccc' }} required />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#dd6b20', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>{dict.addMovement}</button>
            </form>

            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', backgroundColor: 'white' }}>
                <thead>
                  <tr style={{ backgroundColor: '#feebc8' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{dict.movementTableProd}</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{dict.movementTableQty}</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{dict.movementTableType}</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{dict.movementTableClient}</th>
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

          {/* قسم توزيع المهام */}
          <div>
            <h2 style={{ color: '#2b6cb0' }}>{dict.tasksTitle}</h2>
            <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <input type="text" placeholder={dict.taskTitlePlaceholder} value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} style={{ padding: '10px', flex: '2', borderRadius: '5px', border: '1px solid #ccc' }} required />
              <input type="text" placeholder={dict.assignedPlaceholder} value={assigned_to} onChange={(e) => setAssignedTo(e.target.value)} style={{ padding: '10px', flex: '1', borderRadius: '5px', border: '1px solid #ccc' }} required />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>{dict.addTaskBtn}</button>
            </form>

            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ backgroundColor: '#edf2f7' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{dict.taskCol}</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{dict.assignedCol}</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{dict.statusCol}</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{dict.actionCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{t.title}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0' }}>{t.assigned_to}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0', color: t.status.includes('تم') || t.status.includes('مکمل') ? '#276749' : '#d69e2e', fontWeight: 'bold' }}>{t.status}</td>
                      <td style={{ padding: '8px', border: '1px solid #cbd5e0' }}>
                        <button 
                          onClick={() => updateTaskStatus(t.id)}
                          style={{ background: '#28a745', color: '#fff', padding: '5px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          {dict.completeBtn}
                        </button>
                      </td>
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
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <button onClick={toggleLanguage} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          {dict.langToggle}
        </button>
      </div>
      <h1 style={{ color: '#1a365d', fontSize: '32px', marginBottom: '10px' }}>{dict.title}</h1>
      <h3 style={{ color: '#4a5568', marginBottom: '30px' }}>{dict.subtitle}</h3>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <input type="email" placeholder={dict.loginEmail} value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '12px', width: '280px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '15px' }} required />
        <input type="password" placeholder={dict.loginPassword} value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px', width: '280px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '15px' }} required />
        <button type="submit" style={{ padding: '12px', width: '305px', cursor: 'pointer', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold' }}>{dict.loginBtn}</button>
      </form>
    </div>
  )
}

export default App