// This file is the main file gluing all components and maintain a global context.
// Should be changed to something better if refactor.
import { Endpoint } from "@ndn/endpoint"
import { CertStorage } from './cert-storage'
import { Data, Interest, Name } from '@ndn/packet'
import { PeerJsListener } from './peerjs-transport'
import { fromUtf8, toUtf8 } from '@ndn/util'
import { RootDocType, initRootDoc } from './models'
import { syncedStore, getYjsDoc } from '@syncedstore/core'
import { NdnSvsAdaptor } from "./yjs-ndn-adaptor"
import { v4 as uuidv4 } from "uuid"

export const nodeId = '/node-' + Array.from(crypto.getRandomValues(new Uint8Array(4)))
  .map(v => v.toString(16).padStart(2, '0'))
  .join('')
export const syncPrefix = '/example/testYjs'
const opts: PeerJsListener.Options = {
  host: "localhost",
  port: 8000,
  path: "/aincraft",
  key: "peerjs",
}

export let initialized = false
export let certStorage: CertStorage
export let listener: PeerJsListener
export let endpoint: Endpoint
// TODO: Decouple backend with frontend. Consider Redux?
// TODO: Switch to Yjs
// TODO: Separate CRDT document with data packets. Add data storage to store updates from other peers.
// TODO: Setup persistent storage using IndexDB
export let rootDocId: string = ''
export let rootDoc: ReturnType<typeof syncedStore<RootDocType>>
export let docChangeHook: ((docs: RootDocType) => void) | null = null
export let yjsAdaptor: NdnSvsAdaptor

export const initEvent = (async () => {
  if (initialized) {
    return
  }
  initialized = true

  // Certificates
  certStorage = new CertStorage(new Name(nodeId))
  await certStorage.readyEvent

  // Create a PeerJs listener.
  //
  // A route for "/" prefix is added automatically.
  // You may customize the route prefixes via addRoutes property in the first argument.
  listener = await PeerJsListener.listen(opts)
  await listener.connectToKnownPeers()

  // Construct an Endpoint on the default Forwarder instance.
  endpoint = new Endpoint()

  // Fetch docId and see if we are the first one
  if (listener.faces.length > 0) {
    try {
      const data = await endpoint.consume(syncPrefix + '/docId', {})
      rootDocId = fromUtf8(data.content)
    } catch (err) {
      console.error(`Unable to fetch document ID: ${err}. New document will be created.`)
      rootDocId = ''
    }
  } else {
    rootDocId = ''
  }

  // Root doc using CRDT and Sync
  rootDoc = initRootDoc()
  yjsAdaptor = new NdnSvsAdaptor(
    endpoint,
    new Name(syncPrefix),
    certStorage.signer!,
    certStorage,
    getYjsDoc(rootDoc))

  // Delay for the network to be ready
  if (rootDocId) {
    console.log(`Loaded document: ${rootDocId}`)
  } else {
    rootDocId = uuidv4()
    console.log(`Created document: ${rootDocId}`)
  }

  // Help others know docId
  endpoint.produce(syncPrefix + '/docId', docIdServer, { describe: 'dataHandler' })
})()


async function docIdServer(interest: Interest) {
  const name = interest.name.toString()
  const content = toUtf8(rootDocId || '')
  console.log(`Responded with docId = ${content}`)
  const data = new Data(
    name,
    Data.FreshnessPeriod(60000),
    content,
  )
  return data
}

export function shutdown() {
  listener.closeAll()
}

// TODO: Optimize this: currently changing `documents` will trigger rerendering of `calendar`
// Also, they should be separated into different Yjs/Automerge docs
export function setDocChangeHook(hook: (docs: RootDocType) => void) {
  docChangeHook = hook
}

export function unsetDocChangeHook() {
  docChangeHook = null
}
