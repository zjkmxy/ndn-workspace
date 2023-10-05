import moment from 'moment'
import { syncedStore } from "@syncedstore/core";

export type DocType = {
  docId: string,
  text: string
}
export type DocumentsType = { [docId: string]: DocType }

export type RootDocType = {
  documents: DocumentsType,
  calendar: Calendar,
  latex: 'text'
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
    latex: 'text',
  } as RootDocType)
}
