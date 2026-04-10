'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string>('')
  const [isScanning, setIsScanning] = useState(false)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    const startScanning = async () => {
      try {
        setIsScanning(true)
        const videoInputDevices = await reader.listVideoInputDevices()
        
        // Prefer back camera on mobile
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        )
        
        const deviceId = backCamera?.deviceId || videoInputDevices[0]?.deviceId

        if (!deviceId) {
          setError('No camera found')
          return
        }

        await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const barcode = result.getText()
              onScan(barcode)
              reader.reset()
            }
          }
        )
      } catch (err) {
        setError('Camera access denied or not available')
        console.error(err)
      }
    }

    startScanning()

    return () => {
      reader.reset()
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-2xl max-h-screen p-4">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-10 bg-white text-black px-6 py-3 rounded-lg font-bold text-lg"
        >
          ✕ Close
        </button>

        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white p-8 rounded-lg text-center">
              <p className="text-red-600 font-semibold text-xl mb-4">{error}</p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-[70vh] rounded-lg"
              autoPlay
              playsInline
            />
            <p className="text-white text-center mt-4 text-lg">
              {isScanning ? 'Point camera at barcode...' : 'Starting camera...'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
