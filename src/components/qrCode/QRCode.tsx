import './QRCode.scss';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling, { type Options } from 'qr-code-styling';
import logo from '@/assets/logo.png';


type QRCodeProps = {
  value?: string;
  size?: number;
}

export type QRCodeRef = {
  download: (fileType?: 'png' | 'jpeg' | 'webp', fileName?: string) => void;
  getCanvas: () => HTMLCanvasElement | null;
  getBase64: (fileType?: 'png' | 'jpeg' | 'webp') => Promise<string>;
}

const QRCode = forwardRef<QRCodeRef, QRCodeProps>(({ 
  value = "", 
  size = 200 
}, ref) => {
  const qrRef = useRef<HTMLAnchorElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  
  useImperativeHandle(ref, () => ({
    download: (fileType = 'png', fileName = 'qr-code') => {
      qrCodeRef.current?.download({
        extension: fileType,
        name: fileName
      });
    },
    getCanvas: () => {
      if (!qrRef.current) return null;
      return qrRef.current.querySelector('canvas');
    },
    getBase64: async (fileType = 'png') => {
      if (!qrCodeRef.current) {
        throw new Error('QR Code not initialized');
      }
      
      try {
        const data = await qrCodeRef.current.getRawData(fileType);
        // Convert Blob or Buffer to base64 string if needed
        if (data instanceof Blob) {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(data);
          });
        } else if (typeof data === 'string') {
          return data;
        }
        return '';
      } catch (error) {
        console.error('Error getting raw data:', error);
        return '';
      }
    }
  }));

  useEffect(() => {
    if (!qrRef.current) return;
    
    qrCodeRef.current = new QRCodeStyling({
      width: size,
      height: size,
      type: "canvas",
      data: value,
      image: logo,
      imageOptions: {
        margin: 2,
        crossOrigin: "anonymous",
        width: 0.2,
        height: 0.2
      },
      dotsOptions: {
        color: "#000", // primary-main
        type: "classy-rounded"
      },
      backgroundOptions: {
        color: "#FFFFFF"
      },
      cornersSquareOptions: {
        color: "#000", // primary-light
        type: "extra-rounded"
      },
      cornersDotOptions: {
        color: "#000", // primary-dark
        type: "dot"
      },
    } as Options);
    
    qrRef.current.innerHTML = '';
    qrCodeRef.current.append(qrRef.current);
  }, [value, size]);

  return (
    <a ref={qrRef} href={value} className="qr-code-container" target="_blank" rel="noopener noreferrer">
    </a>
  );
});

export default QRCode;