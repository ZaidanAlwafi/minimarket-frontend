import { useEffect, useState } from 'react';
import { productImgUrl } from './productImage.js';

export default function ProductImg({ product, name, size = 400, className = '', alt = '' }) {
  const displayName = name || product?.name || 'Produk';
  const [src, setSrc] = useState(() => productImgUrl(displayName, size, product));

  useEffect(() => {
    const url = productImgUrl(displayName, size, product);
    setSrc(url);
  }, [displayName, size, product?.id, product?.image, product?.name]);

  const handleError = () => {
    const label = encodeURIComponent(String(displayName).slice(0, 20));
    setSrc(`https://via.placeholder.com/${size}x${size}/e2e8f0/475569?text=${label}`);
  };

  return (
    <img
      src={src}
      alt={alt || displayName}
      className={className}
      loading="lazy"
      onError={handleError}
    />
  );
}
