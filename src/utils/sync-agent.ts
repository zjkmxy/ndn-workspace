import { Endpoint } from "@ndn/endpoint"
import { SvSync, type SyncNode, type SyncUpdate } from "@ndn/sync"
import { Name, Data, digestSigning, type Interest, type Verifier } from "@ndn/packet"
import { SequenceNum } from "@ndn/naming-convention2"
import { type NamedSigner } from "@ndn/keychain"
import { EventEmitter } from "eventemitter3"
import { Decoder, Encoder } from "@ndn/tlv"
import { fetch, DataProducer, makeChunkSource } from "@ndn/segmented-object"
import { v4 as uuidv4 } from "uuid"
import { concatBuffers } from "@ndn/util";


export interface Storage {
  get(key: string): Promise<Uint8Array | undefined>
  put(key: string, value: Uint8Array): Promise<void>
}

export class InMemoryStorage implements Storage {
  private readonly buffer: { [name: string]: Uint8Array } = {}

  async get(key: string) {
    return this.buffer[key]
  }
  async put(key: string, value: Uint8Array) {
    this.buffer[key] = value
  }
}

export type SyncState = { nodeId: Name, seq: number }[]

export function encodeSyncState(state: SyncState): string {
  const jsonVal = state.map(({ nodeId, seq }) => ({
    id: nodeId.toString(),
    seq: seq
  }))
  return JSON.stringify(jsonVal)
}

export function parseSyncState(jsonVector: string): SyncState {
  try {
    const vector = JSON.parse(jsonVector) as { id: string, seq: number }[]
    if (vector !== null) {
      return vector.map(({ id, seq }) => ({
        nodeId: new Name(id),
        seq: seq,
      }))
    } else {
      return []
    }
  } catch (e) {
    console.error(e)
    return []
  }
}

export function syncStateKey(baseName: Name) {
  return '/8=local' + baseName.toString() + '/8=syncVector'
}

type DeliveryEvents = {
  update: (content: Uint8Array, id: Name, instance: SyncDelivery) => void
}

// SyncDelivery is a SVS Sync instance associated with a storage.
// It handles update notification and production, but does not serve Data packets.
export abstract class SyncDelivery extends EventEmitter<DeliveryEvents> {
  readonly baseName: Name
  readonly syncInst: SvSync
  readonly syncNode: SyncNode

  constructor(
    readonly endpoint: Endpoint,
    readonly syncPrefix: Name,
    readonly signer: NamedSigner<true>,
    readonly verifier: Verifier,
    readonly storage: Storage,
    protected state?: SyncState
  ) {
    super()
    const nodeId = this.signer.name.getPrefix(this.signer.name.length - 2)
    this.baseName = nodeId.append(...syncPrefix.comps)

    // REQUIRE ATOMIC {
    this.syncInst = new SvSync({
      endpoint: endpoint,
      syncPrefix: Name.from(syncPrefix),
      signer: digestSigning,
    })
    this.syncInst.addEventListener("update", update => this.handleSyncUpdate(update))
    // If state is undefined, persistency is not required.
    // TODO: I don't think this will work.
    state?.forEach(({ nodeId, seq }) => {
      this.syncInst.add(nodeId).seqNum = seq
    })
    this.syncNode = this.syncInst.get(nodeId)
    // }
  }

  destroy() {
    this.syncInst.close()
    if (this.state !== undefined) {
      this.storage.put(
        syncStateKey(this.baseName),
        Uint8Array.from(encodeSyncState(this.state), (m) => m.codePointAt(0) || 0))
    }
  }

  protected async setSyncState(nodeId: Name, seq: number) {
    if (this.state !== undefined) {
      const idx = this.state.findIndex(v => { v.nodeId.equals(nodeId) })
      if (idx >= 0) {
        this.state[idx].seq = seq
      } else {
        this.state.push({ nodeId, seq })
      }
      this.storeSyncState()
    }
  }

  protected async storeSyncState() {
    if (this.state !== undefined) {
      this.storage.put(
        syncStateKey(this.baseName),
        Uint8Array.from(encodeSyncState(this.state), (m) => m.codePointAt(0) || 0))
    }
  }

  get seqNum() {
    return this.syncNode.seqNum
  }

  get nodeId() {
    return this.syncNode.id
  }

  abstract handleSyncUpdate(update: SyncUpdate<Name>): Promise<void>

  abstract produce(content: Uint8Array): Promise<void>
}

// At least once delivery (closer to exactly once). Used for Y.Doc updates and large blob.
// This class does not handle segmentation.
export class AtLeastOnceDelivery extends SyncDelivery {
  override async handleSyncUpdate(update: SyncUpdate<Name>) {
    if (this.listenerCount('update') == 0) {
      console.error('Execution order violation at AtLeastOnceDelivery:',
        '"update" callback must be registered before first call')
      // Rollback the update
      this.syncInst.get(update.id).seqNum = update.loSeqNum - 1
      return
    }

    const prefix = update.id.append(...this.syncPrefix.comps)
    let lastHandled = update.loSeqNum - 1
    for (let i = update.loSeqNum; i <= update.hiSeqNum; i++) {
      const name = prefix.append(SequenceNum.create(i))
      try {
        const data = await this.endpoint.consume(name, {
          verifier: this.verifier,
          // retx: 3
        })

        // Put into storage
        this.storage.put(name.toString(), data.content)

        // Callback
        this.emit('update', data.content, update.id, this)

        // Mark as persist
        lastHandled = i
      } catch (error) {
        console.error(`Unable to fetch or verify ${name.toString()} due to: ${error}`)
        break
      }
    }
    // This makes it not exactly once:
    // If the application is down before all messages in the update is handled,
    // some may be redelivered the next time the application starts.
    // Sinc Yjs allows an update to be applied multiple times, this should be fine. 
    this.setSyncState(update.id, lastHandled)
  }

  override async produce(content: Uint8Array) {
    // REQUIRE ATOMIC {
    const seqNum = this.syncNode.seqNum + 1
    this.syncNode.seqNum = seqNum  // This line must be called immediately to prevent race condition
    // }
    const name = this.baseName.append(SequenceNum.create(seqNum))
    const data = new Data(
      name,
      Data.FreshnessPeriod(60000),
      content,
    )
    await this.signer.sign(data)

    const encoder = new Encoder()
    encoder.encode(data)
    this.storage.put(name.toString(), encoder.output)
  }

  static async create(
    endpoint: Endpoint,
    syncPrefix: Name,
    signer: NamedSigner<true>,
    verifier: Verifier,
    storage: Storage,
  ) {
    const nodeId = signer.name.getPrefix(signer.name.length - 2)
    const baseName = nodeId.append(...syncPrefix.comps)
    const encoded = await storage.get(syncStateKey(baseName))
    let syncState: SyncState = []
    if (encoded) {
      syncState = parseSyncState(Array.from(encoded, (x) => String.fromCodePoint(x)).join(""))
    }
    if (syncState.findIndex(v => { v.nodeId.equals(nodeId) }) === -1) {
      syncState = [{ nodeId, seq: 0 }]
    }
    return new AtLeastOnceDelivery(endpoint, syncPrefix, signer, verifier, storage, syncState)
  }
}

// At most once delivery. Used for status and awareness.
// This delivery does not persists anything.
export class AtMostOnceDelivery extends SyncDelivery {
  constructor(
    readonly endpoint: Endpoint,
    readonly syncPrefix: Name,
    readonly signer: NamedSigner<true>,
    readonly verifier: Verifier,
    readonly storage: Storage,
  ) {
    super(endpoint, syncPrefix, signer, verifier, storage, undefined)
  }

  override async handleSyncUpdate(update: SyncUpdate<Name>) {
    const prefix = update.id.append(...this.syncPrefix.comps)
    const name = prefix.append(SequenceNum.create(update.hiSeqNum))
    try {
      const data = await this.endpoint.consume(name, { verifier: this.verifier })

      // Update the storage
      // Note that this will overwrite old data
      this.storage.put(prefix.toString(), data.content)

      // Callback
      this.emit('update', data.content, update.id, this)
    } catch (error) {
      console.error(`Unable to fetch or verify ${name.toString()} due to: ${error}`)
    }
  }

  override async produce(content: Uint8Array) {
    // REQUIRE ATOMIC {
    const seqNum = this.syncNode.seqNum + 1
    this.syncNode.seqNum = seqNum  // This line must be called immediately to prevent race condition
    // }
    const name = this.baseName.append(SequenceNum.create(seqNum))
    const data = new Data(
      name,
      Data.FreshnessPeriod(60000),
      content,
    )
    await this.signer.sign(data)

    const encoder = new Encoder()
    encoder.encode(data)
    this.storage.put(this.baseName.toString(), encoder.output)
  }

  static async create(
    endpoint: Endpoint,
    syncPrefix: Name,
    signer: NamedSigner<true>,
    verifier: Verifier,
    storage: Storage,
  ) {
    return new AtMostOnceDelivery(endpoint, syncPrefix, signer, verifier, storage)
  }
}

export type ChannelType = 'update' | 'blob' | 'status'

export class SyncAgent {
  private _ready = false
  readonly listeners: { [key: string]: (content: Uint8Array, id: Name) => void } = {}

  private constructor(
    readonly nodeId: string,
    readonly appPrefix: Name,
    readonly persistStorage: Storage,
    readonly tempStorage: Storage,
    readonly endpoint: Endpoint,
    readonly signer: NamedSigner<true>,
    readonly verifier: Verifier,
    readonly atLeastOnce: AtLeastOnceDelivery,
    // readonly atLeastOnce: undefined,
    // readonly atMostOnce: AtMostOnceDelivery
    readonly atMostOnce: undefined
  ) {
    atLeastOnce.on('update', (content, id) => this.onUpdate(content, id))
    // atMostOnce.on('update', (content, id) => this.onUpdate(content, id))

    // Serve stored packets
    // TODO: Design a better namespace
    // TODO: Make sure this producer does not conflict with the certificate storage's
    // @ndn/repo/DataStore may be a better choice, but needs more time to write code
    endpoint.produce(appPrefix, interest => {
      return this.serve(interest)
    }, { describe: 'SyncAgent.serve' })
  }

  public destroy() {
    this.atLeastOnce.destroy()
    // this.atMostOnce.destroy()
  }

  public get ready() {
    return this._ready
  }

  public set ready(value : boolean) {
    this._ready = value
    if (value) {
      this.atLeastOnce.produce(new Uint8Array(0))  // Trigger the initial Sync interest
    }
  }
  

  private parseInnerData(content: Uint8Array) {
    try {
      const decoder = new Decoder(content)
      const data = Data.decodeFrom(decoder)
      // We use Data for convenient binary encoding. Currently it is not a fully functional Data packet
      // name = [channel, topic, uuid]
      if (data.name.length !== 3) {
        console.error(`Malformed encapsulated packet: ${data.name}`)
        return undefined
      }
      const channelText = data.name.get(0)!.text
      if (!['update', 'blob', 'status'].find(x => x === channelText)) {
        console.error(`Malformed encapsulated packet: ${data.name}`)
        return undefined
      }
      const channel = channelText as ChannelType
      const topic = data.name.get(1)!.text
      return {
        channel: channel,
        topic: topic,
        content: data.content
      }
    } catch (e) {
      console.error(`Unable to decode encapsulated packet: ${e}`)
      return undefined
    }
  }

  private makeInnerData(channel: ChannelType, topic: string, content: Uint8Array) {
    const data = new Data(
      new Name([channel, topic, uuidv4()]),
      content
    )
    const encoder = new Encoder()
    encoder.encode(data)
    return encoder.output
  }

  private onUpdate(wire: Uint8Array, id: Name) {
    if(!this._ready) {
      console.error('FATAL: NOT READY YET')
    }
    if (wire.length <= 0) {
      // The dummy update to trigger SVS
      return
    }

    // Current version does not remember the state of delivered updates
    // So it is required to register callbacks of all docs before a real update arrives
    const inner = this.parseInnerData(wire)
    if (!inner) {
      // Invalid inner data
      return
    }
    const { channel, topic, content } = inner

    if (channel === 'blob') {
      // Handle segmentation for blob
      this.fetchBlob(content, id)
    }
    // Notify the listener
    const listener = this.listeners[`${channel}.${topic}`]
    if (listener) {
      listener(content, id)
    } else if (channel === 'update') {
      console.error('Execution order violation at SyncAgent:',
        'listeners for update channel must be registered before the first update arrives')
    }
  }

  private async fetchBlob(nameWire: Uint8Array, id: Name) {
    let blobName: Name

    try {
      const decoder = new Decoder(nameWire)
      blobName = Name.decodeFrom(decoder)
      if (!blobName.isPrefixOf(id)) {
        throw new Error('Blob name does not start with node ID')
      }
    } catch (e) {
      console.error(`Invalid blob name ${nameWire}: ${e}`)
      return
    }

    const buffers: Uint8Array[] = []
    try {
      const result = fetch(blobName, { verifier: this.verifier })
      for await (const segment of result) {
        // Cache packets
        // TODO: Check with NDNts maintainer if there is a way to obtain the raw segment wire
        const encoder = new Encoder()
        encoder.encode(segment)
        this.persistStorage.put(segment.name.toString(), encoder.output)

        // Reassemble
        buffers.push(segment.content)
      }
    } catch (e) {
      console.error(`Unable to fetch ${blobName}: ${e}`)
      return
    }
    const blob = concatBuffers(buffers)

    // Save blob
    await this.persistStorage.put(blobName.toString(), blob)
  }

  public register(channel: ChannelType, topic: string, handler: (content: Uint8Array, id: Name) => void) {
    this.listeners[`${channel}.${topic}`] = handler
  }

  public unregister(channel: ChannelType, topic: string /*, handler: (content: Uint8Array, id: Name) => void*/) {
    delete this.listeners[`${channel}.${topic}`]
  }

  // getBlob returns either a blob or a segment
  public getBlob(name: Name) {
    return this.persistStorage.get(name.toString())
  }

  // publishBlob segments and produce a blob object
  // Please make sure the blob's name does not conflict with internal packets' names
  public async publishBlob(topic: string, blobContent: Uint8Array, name?: Name) {
    // Put original content
    if (name === undefined) {
      name = new Name([...this.appPrefix.comps, 'blob', uuidv4()])
    }
    await this.persistStorage.put(name.toString(), blobContent)

    // Put segmented packets
    const producer = DataProducer.create(makeChunkSource(blobContent), name, { signer: this.signer })
    for await (const segment of producer.listData()) {
      // TODO: Check with NDNts maintainer if there is a way to obtain the raw segment wire
      // Or maybe the problem disappers after shifting to @ndn/repo/DataStore.
      const encoder = new Encoder()
      encoder.encode(segment)
      this.persistStorage.put(segment.name.toString(), encoder.output)
    }

    // Publish encoded name
    const encoder = new Encoder()
    name.encodeTo(encoder)
    await this.atLeastOnce.produce(this.makeInnerData('blob', topic, encoder.output))
  }

  public publishUpdate(topic: string, content: Uint8Array) {
    if(content.length > 6000) {
      console.error(`Too large update for topic ${topic}: ${content.length}. Please use the blob channel.`)
    }
    return this.atLeastOnce.produce(this.makeInnerData('update', topic, content))
  }

  public publishStatus() {
    throw new Error('Not implemented')
  }

  public getStatus() {
    throw new Error('Not implemented')
  }

  async serve(interest: Interest) {
    const key = interest.name.toString()
    let wire = await this.persistStorage.get(key)
    if (wire === undefined) {
      wire = await this.tempStorage.get(key)
      if (wire === undefined) {
        console.warn(`A remote peer is fetching a non-existing object: ${key}`)
        return undefined
      }
    }
    try {
      const parser = new Decoder(wire)
      const data = Data.decodeFrom(parser)
      return data
    } catch(e) {
      console.error(`Data in storage is not decodable: ${key}`)
      return undefined
    }
  }

  static async create(
    persistStorage: Storage,
    endpoint: Endpoint,
    signer: NamedSigner<true>,
    verifier: Verifier,
  ) {
    const tempStorage = new InMemoryStorage()
    // Note: we need the signer name to be /[appPrefix]/<nodeId>/KEY/<keyID>
    const appPrefix = signer.name.getPrefix(signer.name.length - 3)
    const nodeId = signer.name.get(signer.name.length - 2)!.text
    const leastSyncPrefix = appPrefix.append('least')
    // const atMostOnce = await AtMostOnceDelivery.create(endpoint, mostSyncPrefix, signer, verifier, tempStorage)
    const atLeastOnce = await AtLeastOnceDelivery.create(endpoint, leastSyncPrefix, signer, verifier, persistStorage)
    return new SyncAgent(
      nodeId,
      appPrefix,
      persistStorage,
      tempStorage,
      endpoint,
      signer,
      verifier,
      atLeastOnce,
      /*atMostOnce*/ undefined
    )
  }
}
