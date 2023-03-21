import { ServerMember } from '../../../domain/entities/ServerMember'
import {
  CodeforcesHandleChangeRequest,
  IServerMemberRepository
} from '../../../domain/repositories/IServerMemberRepository'
import { ServerId } from '../../../domain/valueobjects/ServerId'
import { ServerMemberId } from '../../../domain/valueobjects/ServerMemberId'
import { firestore } from './db'
import { FieldValue, Transaction, Timestamp } from '@google-cloud/firestore'
import { CodeforcesHandleChangeRequested } from '../../../domain/events/CodeforcesHandleChangeRequested'
import { CodeforcesHandleVerified } from '../../../domain/events/CodeforcesHandleVerified'

export class ServerMemberRepository implements IServerMemberRepository {
  static SERVER_MEMBER_COLLECTION = 'server_members'
  static HANDLE_IDENTIFY_REQUEST_COLLECTION = 'handle_identify_requests'

  private getDocRef = (serverId: ServerId, memberId: ServerMemberId) =>
    firestore
      .collection(ServerMemberRepository.SERVER_MEMBER_COLLECTION)
      .doc(`${serverId.toString()}-${memberId.toString()}`)

  find: (
    serverId: ServerId,
    memberId: ServerMemberId
  ) => Promise<ServerMember | null> = async (serverId, memberId) => {
    const serverMemberRef = this.getDocRef(serverId, memberId)
    console.info(
      `Retrieving server member ${serverId.toString()}-${memberId.toString()} from firestore!`
    )
    const doc = await serverMemberRef.get()
    const data = doc.data()

    if (!doc.exists || !data) {
      console.info(
        `Server member retrieved ${serverId.toString()}-${memberId.toString()} not found!`
      )
      return null
    }
    console.info(
      `Server member retrieved ${serverId.toString()}-${memberId.toString()} from firestore!`
    )

    return new ServerMember(
      memberId,
      serverId,
      data.codeforces?.handle ?? null,
      data.codeforces?.handle_verified ?? false
    )
  }

  update: (serverMember: ServerMember) => Promise<void> = async (
    serverMember
  ) => {
    await firestore.runTransaction(async (transaction) => {
      const serverMemberRef = this.getDocRef(
        serverMember.getServerId(),
        serverMember.getId()
      )

      transaction.set(
        serverMemberRef,
        {
          codeforces: {
            handle: serverMember.getHandle(),
            handle_verified: serverMember.isHandleVerified()
          }
        },
        { merge: true }
      )
      const events = serverMember.getUnpublishedEvents()
      for (let i = 0; i < events.length; i++) {
        const event = events[i]
        if (event instanceof CodeforcesHandleChangeRequested)
          this.handleCodeforcesHandleChangeRequestedEvent(transaction, event)
        if (event instanceof CodeforcesHandleVerified)
          await this.handleCodeforcesHandleVerifiedEvent(transaction, event)
      }
      serverMember.clearUnpublishedEvents()
    })
  }

  private handleCodeforcesHandleChangeRequestedEvent(
    transaction: Transaction,
    event: CodeforcesHandleChangeRequested
  ) {
    const eventData = JSON.parse(event.toJSONString())
    const eventRef = firestore
      .collection(ServerMemberRepository.HANDLE_IDENTIFY_REQUEST_COLLECTION)
      .doc()
    transaction.set(eventRef, {
      ...eventData,
      timestamp: FieldValue.serverTimestamp(),
      valid: true
    })
  }

  private handleCodeforcesHandleVerifiedEvent: (
    transaction: Transaction,
    event: CodeforcesHandleVerified
  ) => Promise<void> = async (transaction, event) => {
    const requests = await firestore
      .collection(ServerMemberRepository.HANDLE_IDENTIFY_REQUEST_COLLECTION)
      .where('valid', '==', true)
      .where('server_id', '==', event.serverId.toString())
      .where('server_member_id', '==', event.serverMemberId.toString())
      .get()

    requests.forEach((request) => {
      transaction.update(request.ref, {
        valid: false
      })
    })
  }

  findLatestCodeforcesHandleChangeRequest: (
    serverMember: ServerMember
  ) => Promise<CodeforcesHandleChangeRequest | null> = async (serverMember) => {
    const requests = await firestore
      .collection(ServerMemberRepository.HANDLE_IDENTIFY_REQUEST_COLLECTION)
      .where('valid', '==', true)
      .where('server_id', '==', serverMember.getServerId().toString())
      .where('server_member_id', '==', serverMember.getId().toString())
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()

    let request: CodeforcesHandleChangeRequest | null = null

    requests.forEach((snap) => {
      const data = snap.data()
      request = {
        newHandle: data.new_handle,
        problem: data.problem,
        timestamp: (data.timestamp as Timestamp).toDate()
      }
    })

    return request
  }
}
