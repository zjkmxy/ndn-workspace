/* eslint-disable @typescript-eslint/ban-ts-comment */
import CodeMirror from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/language'
import { stex } from '@codemirror/legacy-modes/mode/stex'
import * as Y from 'yjs'
// @ts-ignore
import { yCollab } from 'y-codemirror.next'
import { Container } from '@mui/material'
// There is an error in y-codemirror.next's package.json.

export default function LatexDoc({ doc }: {
  doc: Y.Text
}) {
  return (
    <Container maxWidth={false}>
      <CodeMirror
        value={doc.toString()}
        extensions={[
          StreamLanguage.define(stex),
          yCollab(doc, null)
        ]} />
    </Container>
  )
}
