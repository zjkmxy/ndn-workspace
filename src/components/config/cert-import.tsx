import { useEffect, useRef } from "react"

export default function CertImport({ files, setFiles }:
  {
    files: FileList | undefined,
    setFiles: React.Dispatch<React.SetStateAction<FileList | undefined>>
  }) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.files = files || null
    }
  }, [files])

  return (
    <>
      <label>
        QRCode to import:
        <input name='certQrInput' type="file" accept="image/*"
          onChange={(e) => setFiles(e.target.files || undefined)}
          ref={inputRef} />
      </label>
    </>
  )
}
