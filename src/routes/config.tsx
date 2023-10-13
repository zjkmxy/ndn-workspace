import { useEffect, useState } from "react"
import { certStorage, initEvent } from "../utils/main"
import { bytesToBase64, scanQrCode } from "../utils/utils"
import CertImport from "../components/config/cert-import"
import CertQrCode from "../components/config/cert-qrcode"
import CertTable, { CertData } from "../components/config/cert-table"

export default function Config() {
  const [signerName, setSignerValue] = useState("")
  const [qrValue, setQrValue] = useState("")
  const [certFiles, setCertFiles] = useState<FileList>()
  const [certData, setCertData] = useState<CertData[]>([])

  useEffect(() => {
    (async () => {
      await initEvent
      if (!certStorage) {
        console.error('Wrong execution order')
      } else {
        await certStorage.readyEvent
        setSignerValue(certStorage.signer?.name.toString() ?? "")
        const selfCert = certStorage.exportSelfCert()
        setQrValue(bytesToBase64(selfCert))
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      const files = certFiles ?? []
      for (const file of files) {
        const wire = await scanQrCode(file)
        if (wire) {
          certStorage?.importCert(wire)
        }
      }
      
      if(certStorage) {
        const certs = Object.keys(certStorage.storage).map(key => {
          const cert = certStorage!.storage[key]
          return new CertData(cert.name, cert.validity)
        })
        setCertData(certs)
      }
    })()
  }, [certFiles])

  return (
    <div id="config" onPaste={e => setCertFiles(e.clipboardData.files)}>
      <div><h1>Myself: {signerName}</h1></div>
      <CertQrCode value={qrValue} />
      <p></p>
      <CertImport files={certFiles} setFiles={setCertFiles} />
      <p></p>
      <CertTable certs={certData}/>
    </div>
  )
}
