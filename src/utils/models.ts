import moment from 'moment'
import { syncedStore } from "@syncedstore/core"
import * as Y from 'yjs'
import JSZip from 'jszip'

export type ProjFolder = {
  kind: 'folder'
  name: string
  items: ProjFileDesc[]
}

export type ProjDoc = {
  kind: 'doc'
  name: string
  text: Y.Text
}

export type ProjBlob = {
  kind: 'blob'
  name: string
  version: number
}

export type ProjFileDesc = ProjFolder | ProjDoc | ProjBlob

export type DocType = {
  docId: string,
  text: string
}
export type DocumentsType = { [docId: string]: DocType }

export type RootDocType = {
  documents: DocumentsType,
  calendar: Calendar,
  latex: {
    root: ProjFolder
  }
}

export type Calendar = { [time: string]: CalEvent[] }

// TODO: Use a better data model. Do not couple with frontend.
export type CalEvent = {
  id: string,
  title: string,
  start: number,
  end: number,
}

export namespace CalEvent {
  export type Update = {
    title: string | undefined,
    start: number | undefined,
    end: number | undefined,
  }

  export function update(origin: CalEvent, update: Update) {
    if (update.title) {
      origin.title = update.title
    }
    if (update.start) {
      origin.start = update.start
    }
    if (update.end) {
      origin.end = update.end
    }
  }

  export function startMoment(event: CalEvent) {
    return moment(event.start)
  }

  export function endMoment(event: CalEvent) {
    return moment(event.end)
  }

  export function startWeek(event: CalEvent) {
    return moment(event.start).week()
  }

  export function endWeek(event: CalEvent) {
    return moment(event.end).week()
  }
}

export function initRootDoc() {
  return syncedStore({
    documents: {},
    calendar: {},
    latex: {},
  } as RootDocType)
}

export function latexFileAt(root: Partial<{ root: ProjFolder }>, pathNames: string[]) {
  return pathNames.reduce<ProjFileDesc | undefined>((prev, current) => {
    if (current === '') {
      // Handle extra '/' like 'a//b' and empty path ''
      // 'a//b'.split('/') === ['a', '', 'b']
      // ''.split('/') === ['']
      return prev
    } else if (prev?.kind === 'folder') {
      return prev.items.find(item => item.name === current)
    } else {
      return undefined
    }
  }, root.root)
}

export function exportAsZip(root: Partial<{ root: ProjFolder }>) {
  const zip = new JSZip()
  const examine = (path: string, items: ProjFileDesc[]) => {
    items.forEach(item => {
      const fullName = path + item.name
      if (item.kind === 'folder') {
        examine(fullName + '/', item.items)
      } else if (item.kind === 'doc') {
        zip.file(fullName, item.text.toString())
      } else if (item.kind === 'blob') {
        console.error('TODO: blob files are not implemented yet')
      }
    })
  }
  if (root.root) {
    examine('', root.root?.items)
  }
  return zip
}
