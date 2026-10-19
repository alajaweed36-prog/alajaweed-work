import { useState } from 'react'
import { supabase } from './supabase'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    
    if (error) {
      alert('خطأ في البيانات: ' + error.message)
    } else {
      alert('تم تسجيل الدخول بنجاح يا هندسة!')
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'system-ui', backgroundColor: '#f4f4f9', height: '100vh', paddingTop: '50px' }}>
      <h1 style={{ color: '#333' }}>نظام Warehouse Pro</h1>
      <h3 style={{ color: '#666', marginBottom: '30px' }}>تسجيل دخول الموظفين</h3>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '12px', width: '280px', borderRadius: '5px', border: '1px solid #ccc' }}
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '12px', width: '280px', borderRadius: '5px', border: '1px solid #ccc' }}
          required
        />
        <button type="submit" style={{ padding: '12px', width: '305px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold' }}>
          دخول
        </button>
      </form>
    </div>
  )
}

export default App