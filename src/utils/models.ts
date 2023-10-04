import moment from 'moment'

export type DocType = {
  docId: string,
  text: string
}
export type DocumentsType = { [docId: string]: DocType }

export type RootDocType = {
  documents: DocumentsType,
  calendar: Calendar,
  latex: string
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

  export function update(origin: CalEvent, update: Update): CalEvent {
    return {
      id: origin.id,
      title: update.title || origin.title,
      start: update.start || origin.start,
      end: update.end || origin.end,
    }
  }

  export function startMoment(event: CalEvent) {
    return moment(event.start)
  }

  export function endMoment(event: CalEvent) {
    return moment(event.start)
  }

  export function startWeek(event: CalEvent) {
    return moment(event.start).week()
  }

  export function endWeek(event: CalEvent) {
    return moment(event.end).week()
  }
}

export function initRootDoc(rootDoc: RootDocType) {
  rootDoc.documents = {}
  rootDoc.calendar = {}
  rootDoc.latex = ''
}
