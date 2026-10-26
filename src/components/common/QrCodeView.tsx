import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeViewProps {
  url: string;
  size?: number;
  className?: string;
}

export const QrCodeView: React.FC<QrCodeViewProps> = ({ url, size = 180, className = '' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((qr) => {
        if (isMounted) setDataUrl(qr);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [url, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-400 ${className}`}
      >
        QR Loading...
      </div>
    );
  }

  return (
    <div className={`p-2 bg-white rounded-xl shadow-md inline-block ${className}`}>
      <img
        src={dataUrl}
        alt="Scan to join bluffing game"
        width={size}
        height={size}
        className="rounded-lg"
      />
    </div>
  );
};
