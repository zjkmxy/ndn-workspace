import { Endpoint } from "@ndn/endpoint"
import { SvSync, type SyncNode, type SyncUpdate } from "@ndn/sync"
import { Name, Data, digestSigning, type Interest, type Verifier } from "@ndn/packet"
import { SequenceNum } from "@ndn/naming-convention2"
import { type NamedSigner } from "@ndn/keychain"
import * as Y from 'yjs'

export class NdnSvsAdaptor {
  private readonly nodeId: Name
  private readonly baseName: Name
  private readonly syncInst: SvSync
  private readonly syncNode: SyncNode
  private pktStorage: { [name: string]: Data } = {}


  constructor(
    private readonly endpoint: Endpoint,
    private readonly syncPrefix: Name,
    private readonly signer: NamedSigner<true>,
    private readonly verifier: Verifier,
    public readonly doc: Y.Doc,
  ) {
    this.nodeId = this.signer.name.getPrefix(this.signer.name.length - 2)
    this.baseName = this.nodeId.append(...syncPrefix.comps)

    // Data handler
    endpoint.produce(this.baseName,
      async (interest: Interest) => {
        const name = interest.name.toString()
        return this.pktStorage[name]
      },
      { describe: 'NdnAdapter.dataHandler' })

    // SVS instance
    this.syncInst = new SvSync({
      endpoint: endpoint,
      syncPrefix: Name.from(syncPrefix),
      signer: digestSigning,
    })
    this.syncInst.addEventListener("update", update => this.handleSyncUpdate(update))
    this.syncNode = this.syncInst.add(this.nodeId)

    doc.on('update', this.docUpdateHandler.bind(this))
    this.produce(new Uint8Array(0))  // Dummy production to announce peerId and trigger the sync start
  }

  private docUpdateHandler(update: Uint8Array, origin: undefined) {
    if (origin !== this) {
      this.produce(update)  // No need to await
      // console.debug(`Produced update`)
    }
  }

  private async produce(content: Uint8Array) {
    const seqNum = this.syncNode.seqNum + 1
    const name = this.baseName.append(SequenceNum.create(seqNum))
    const data = new Data(
      name,
      Data.FreshnessPeriod(60000),
      content,
    )
    await this.signer.sign(data)
    this.pktStorage[name.toString()] = data
    this.syncNode.seqNum = seqNum
  }

  private async handleSyncUpdate(update: SyncUpdate<Name>) {
    const prefix = update.id.append(...this.syncPrefix.comps)
    for (let i = update.loSeqNum; i <= update.hiSeqNum; i++) {
      const data = await this.endpoint.consume(prefix.append(SequenceNum.create(i)))
      try {
        // TODO: fix this
        // Currently we have to disable verification because the sync starts receiving packets
        // before the user has a chance to import certificates, and those packets cannot be validated.
        // To fix this, either:
        // - Trigger a re-sync whenever the user inputs a certificate. This is not how Sync is designed.
        //   SVS's implementation design assumes the certificates of all peers are known at the time it starts.
        // - Add a start button
        // await this.verifier.verify(data)
      } catch (error) {
        console.error(`Unable to verify ${data.name.toString()} due to: ${error}`)
        continue
      }

      if(data.content.length == 0){
        // Dummy update
        continue
      }

      // Apply patch
      Y.applyUpdate(this.doc, data.content, this)
    }
  }
}
