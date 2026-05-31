import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi tidak sama.');
      return;
    }
    setLoading(true);
    try {
      await api.registerCustomer({
        name: fullName,
        email,
        phone,
        address,
        password,
      });
      window.alert('Registrasi customer berhasil. Silakan login.');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registrasi gagal.');
    } finally {
      setLoading(false);
    }
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
                <p className="brand-tagline">Daftarkan pelanggan untuk pengalaman belanja yang lebih rapi.</p>
              </div>
            </div>
            <p className="login-visual-caption">
              Halaman ini hanya untuk mendaftar akun customer. Staff (Owner/Admin/Gudang) dibuat oleh Owner di dashboard.
            </p>
          </div>

          <div className="login-panel">
            <div className="login-header">
              <h1>Daftar Customer Baru</h1>
              <p>Isi data di bawah ini untuk membuat akun customer di database.</p>
            </div>

            {error ? (
              <p style={{ color: '#dc2626', marginBottom: 12, fontSize: '0.9rem' }} role="alert">
                {error}
              </p>
            ) : null}

            <form className="login-form" onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">
                  <i className="fas fa-user" /> Nama Lengkap
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope" /> Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Masukkan email aktif"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">
                  <i className="fas fa-phone" /> Nomor Telepon
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">
                  <i className="fas fa-map-marker-alt" /> Alamat
                </label>
                <textarea
                  id="address"
                  rows={3}
                  placeholder="Masukkan alamat lengkap"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">
                  <i className="fas fa-lock" /> Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Buat password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <i className="fas fa-lock" /> Konfirmasi Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Daftar'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Sudah punya akun? <Link to="/">Kembali ke Login</Link>
              </p>
              <p className="login-copy">&copy; 2026 Minimarket Pro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
