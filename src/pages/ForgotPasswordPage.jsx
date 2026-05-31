import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    const v = email.trim();
    if (!v) {
      window.alert('Mohon masukkan email Anda.');
      return;
    }
    window.alert('Jika email ' + v + ' terdaftar, tautan reset password telah dikirim.');
    navigate('/');
  }

  return (
    <div className="bg-login" style={{ width: '100%', minHeight: '100vh' }}>
      <div className="container">
        <div className="login-container login-split">
          <div className="login-visual">
            <div className="login-visual-header">
              <div className="brand-mark">M</div>
              <div>
                <h2 className="brand-title">Minimarket Pro</h2>
                <p className="brand-tagline">Reset password akun Anda dengan aman.</p>
              </div>
            </div>
            <p className="login-visual-caption">
              Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang password Anda.
            </p>
          </div>

          <div className="login-panel">
            <div className="login-header">
              <h1>Lupa Password</h1>
              <p>Gunakan email akun untuk menerima tautan reset password.</p>
            </div>

            <form className="login-form" onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope" /> Email Terdaftar
                </label>
                <input id="email" type="email" placeholder="Masukkan email Anda" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn-login">
                Kirim Tautan Reset
              </button>
            </form>

            <div className="login-footer">
              <p>
                <Link to="/">
                  <i className="fas fa-arrow-left" /> Kembali ke Login
                </Link>
              </p>
              <p className="login-copy">&copy; 2026 Minimarket Pro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
