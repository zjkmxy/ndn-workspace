// This file is the main file gluing all components and maintain a global context.
// Should be changed to something better if refactor.
import { Endpoint } from "@ndn/endpoint"
import { CertStorage } from './cert-storage'
import { Data, Interest, Name } from '@ndn/packet'
import { PeerJsListener } from './peerjs-transport'
import { NdnAdapter } from "./automerge-ndn-adaptor"
import { DocHandle, AutomergeUrl, Repo } from '@automerge/automerge-repo'
import { fromUtf8, toUtf8 } from '@ndn/util'
import { RootDocType, initRootDoc } from './models'

export const nodeId = '/node-' + Array.from(crypto.getRandomValues(new Uint8Array(4)))
  .map(v => v.toString(16).padStart(2, '0'))
  .join('')
export const syncPrefix = '/example/testAutomerge'
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
export let automergeRepo: Repo
export let rootDocId: AutomergeUrl | null = null
export let rootDoc: DocHandle<RootDocType>
export let docChangeHook: ((docs: RootDocType) => void) | null = null

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
      rootDocId = fromUtf8(data.content) as AutomergeUrl
    } catch (err) {
      console.error(`Unable to fetch document ID: ${err}. New document will be created.`)
      rootDocId = null
    }
  } else {
    rootDocId = null
  }

  // Scene using CRDT and Sync
  const adapter = new NdnAdapter(endpoint, new Name(syncPrefix), certStorage.signer!, certStorage)
  automergeRepo = new Repo({
    network: [adapter],
  })
  // Delay for the network to be ready
  await new Promise(resolve => setTimeout(resolve, 10))
  if (rootDocId) {
    rootDoc = automergeRepo.find(rootDocId)
    console.log(`Loaded document: ${rootDocId}`)
  } else {
    rootDoc = automergeRepo.create()
    rootDoc.change(doc => {
      initRootDoc(doc)
    })
    rootDocId = rootDoc.url
    console.log(`Created document: ${rootDocId}`)
  }

  // Setup hook for changes (either local or remote)
  rootDoc.on('change', (payload) => {
    if (docChangeHook) { docChangeHook(payload.doc) }
  })

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
