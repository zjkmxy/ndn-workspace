/* eslint-disable @typescript-eslint/ban-ts-comment */
import CodeMirror from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/language'
import { stex } from '@codemirror/legacy-modes/mode/stex'
import { Button } from '@mui/material'
import { useState } from 'react'
import { rootDoc } from '../utils/main'
// @ts-ignore
import { yCollab } from 'y-codemirror.next'
// There is an error in y-codemirror.next's package.json.

export default function Latex() {
  const [pdfUrl, setPdfUrl] = useState('')

  // TODO: How to handle initEvent?

  // NOTE: compiling LaTeX requires local LaTeX server running at 6175
  const onClick = () => {
    (async () => {
      const formData = new FormData();
      formData.append("file", new File([rootDoc.latex.toString()], 'input.tex', {
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
        height="400px"
        value={rootDoc.latex.toString()}
        extensions={[
          StreamLanguage.define(stex),
          yCollab(rootDoc.latex, null)
        ]} />
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
