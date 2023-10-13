import * as Y from 'yjs'
import AppTools from '../components/project/app-tools'
import FileList from '../components/project/file-list'
import { initEvent, rootDoc } from '../utils/main'
import LatexDoc from '../components/project/latex-doc'
import NewItemModal from '../components/project/new-item-modal'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { ProjFileDesc, exportAsZip, latexFileAt } from '../utils/models'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useState } from 'react'

type ModalState = '' | 'folder' | 'doc' | 'upload'

export default function LatexProject({ rootUri }: {
  rootUri: string
}) {
  const navigate = useNavigate()
  const path = useLoaderData() as string ?? ''
  const pathNames = path ? path.split('/') : []
  const pathUri = path ? `${rootUri}/${path}` : rootUri
  const [item, setItem] = useState<ProjFileDesc>()
  const [modalState, setModalState] = useState<ModalState>('')

  // TODO: Refresh after folder change. Note that useSyncedStore may cause unnecessary rerenser. Need investigate.
  // TODO: Make modal logic correct
  // TODO: Use UndoManager to handle Undo

  const content = useMemo(() => {
    if (item !== undefined) {
      if (item?.kind === 'folder') {
        return (<FileList
          pathUri={pathUri}
          folder={item}
        />)
      } else if (item?.kind === 'doc') {
        return (<LatexDoc
          doc={item.text}
        />)
      } else {
        console.log(rootDoc)
        return (<Typography variant='button' color='error'>
          Not implemented for kind {item?.kind}
        </Typography>)
      }
    }
  }, [item, pathUri])

  const loadDocument = useCallback(() => {
    const pathNames = path ? path.split('/') : []
    initEvent.then(() => {
      setItem(latexFileAt(rootDoc.latex, pathNames))
    })
  }, [path])

  useEffect(() => {
    loadDocument()
  }, [loadDocument])

  const createItem = (name: string) => {
    if (name !== '' && item?.kind === 'folder') {
      if (modalState === 'folder') {
        const to = pathUri + '/' + name
        if (item.items.findIndex(obj => obj.name === name) == -1) {
          item.items.push({
            kind: 'folder',
            name: name,
            items: []
          })
          navigate(to)
        }
      } else if (modalState === 'doc') {
        // Cannot do this because there are .bib, .sty, etc.
        // const newName = name.endsWith('.tex') ? name : name + '.tex'
        const to = pathUri + '/' + name
        if (item.items.findIndex(obj => obj.name === name) == -1) {
          item.items.push({
            kind: 'doc',
            name: name,
            text: new Y.Text(),
          })
          navigate(to)
        }
      }
    }
    setModalState('')
  }

  const onExportZip = () => {
    const zip = exportAsZip(rootDoc.latex)
    zip.generateAsync({ type: "base64" }).then(b64File => {
      (window as Window).location = "data:application/zip;base64," + b64File
    })
  }

  const onCompile = () => {
    (async () => {
      const zip = exportAsZip(rootDoc.latex)
      const blobFile = await zip.generateAsync({ type: "blob" })
      const formData = new FormData();
      formData.append("file", new File([blobFile], 'upload.zip', {
        type: 'application/octet-stream',
      }));
      const response = await fetch('http://localhost:6175/zip', {
        method: 'POST',
        body: formData,
      })
      const val = await response.json()
      const reqId: string = val.id
      const status: string = val.status
      if (status === 'success' && reqId) {
        window.open(`http://localhost:6175/result/${reqId}`, "_blank", "noreferrer")
      } else {
        console.log(status)
      }
    })()
  }

  return (
    <>
      <NewItemModal
        visible={modalState === 'folder' || modalState === 'doc'}
        title={modalState === 'folder' ? 'New folder' : 'New .tex file'}
        onCancel={() => setModalState('')}
        onSubmit={createItem}
      />
      <AppTools
        rootPath={rootUri}
        pathNames={pathNames}
        onCompile={onCompile}
        menuItems={[
          { name: 'New folder', onClick: () => setModalState('folder') },
          { name: 'New tex', onClick: () => setModalState('doc') },
          { name: 'divider' },
          { name: 'Download as zip', onClick: onExportZip },
        ]} />
      {content}
    </>
  )
}
