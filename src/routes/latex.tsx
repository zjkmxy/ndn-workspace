import CodeMirror from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/language'
import { stex } from '@codemirror/legacy-modes/mode/stex'
import { Button } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { rootDoc, setDocChangeHook, unsetDocChangeHook, initEvent } from '../utils/main'

export default function Latex() {
  const [pdfUrl, setPdfUrl] = useState('')
  const [editorValue, setEditorValue] = useState('')

  const loadDocument = useCallback(() => {
    rootDoc.doc()
      .then(docs => {
        setEditorValue(docs?.latex || '')
      })
      .catch((err) => console.log(err))
  }, [])

  useEffect(() => {
    initEvent.then(() => loadDocument())
  }, [loadDocument])

  useEffect(() => {
    setDocChangeHook(docs => {
      setEditorValue(docs.latex)
    })
    return () => unsetDocChangeHook()
  }, [])

  const updateDocument = useCallback((val: string) => {
    if (val && rootDoc) {
      rootDoc.change(docs => {
        docs.latex = val
      })
    }
    setEditorValue(val)
  }, [])

  // NOTE: compiling LaTeX requires local LaTeX server running at 6175
  const onClick = () => {
    (async () => {
      const formData = new FormData();
      formData.append("file", new File([editorValue], 'input.tex', {
        type: 'application/octet-stream',
      }));
      const response = await fetch('http://localhost:6175/single-shot', {
        method: 'POST',
        body: formData,
      })
      const val = await response.json()
      const reqId: string = val.id
      const status: string = val.status
      if (status === 'success' && reqId) {
        setPdfUrl(`http://localhost:6175/result/${reqId}`)
      } else {
        console.log(status)
      }
    })()
  }

  return (
    <>
      <CodeMirror
        value={editorValue}
        height="400px"
        extensions={[StreamLanguage.define(stex)]}
        onChange={updateDocument} />
      <p></p>
      <Button variant="contained" onClick={onClick}>
        Compile
      </Button>
      <p></p>
      {pdfUrl
        ? (<embed src={pdfUrl} width="100%" height="400px" type="application/pdf" />)
        : ''}
    </>
  )
}
