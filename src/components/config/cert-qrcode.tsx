import { useEffect, useRef } from "react"
import * as qrcode from "qrcode"

export default function CertQrCode({ value }: { value: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (value) {
      qrcode.toCanvas(
        ref.current,
        value,
        {
          errorCorrectionLevel: 'L',
        },
        function (error) {
          if (error) {
            console.error(`Unable to generate QRCode: ${error}`)
          }
        })
    }
  }, [value])

  return (<canvas id="cert-qrcode" ref={ref} />)
}
