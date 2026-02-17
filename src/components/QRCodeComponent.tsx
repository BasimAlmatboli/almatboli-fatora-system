import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
  value: string;
  size?: number;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ value, size = 100 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, [value, size]);

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} className="border border-gray-300 rounded"></canvas>
    </div>
  );
};

export default QRCodeComponent;