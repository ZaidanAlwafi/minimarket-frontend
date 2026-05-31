import { useEffect } from 'react';

/**
 * Memuat halaman HTML asli dari /public tanpa mengubah tampilan atau skrip —
 * fitur dan localStorage (mm_*) tetap sama seperti sebelumnya.
 */
export default function LegacyFrame({ src, title }) {
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <iframe
      title={title}
      src={src}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
