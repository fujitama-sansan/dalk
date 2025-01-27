import { SqsQueue } from '../../../../common/interface'
import { BackendAtom } from '../../ipc/BackendAtom'
import { AsyncHandler, AsyncRead, JotaiUtil } from '../../util/JotaiUtil'

export type SQSQueuesState = {
  queues: ReadonlyArray<SqsQueue>
  error: string | null
}

export type SQSQueuesAction =
  | {
      type: 'search'
      queuePrefix: string
    }
  | {
      type: 'send'
      queue: SqsQueue
      message: string
    }

const initQueues: AsyncRead<SQSQueuesState> = () =>
  Promise.resolve({
    queues: [],
    error: null
  })

const search: AsyncHandler<SQSQueuesState, SQSQueuesAction> = async (curr, get, _set, action) => {
  if (action.type === 'search') {
    const backend = get(BackendAtom.atom).SqsQueue
    const { queuePrefix } = action

    const result = await backend.listQueues(queuePrefix)
    if (result.success) {
      const queues = result.value
      return { queues, error: null }
    }
    return { ...curr, error: result.error }
  }
  return curr
}

const send: AsyncHandler<SQSQueuesState, SQSQueuesAction> = async (curr, get, _set, action) => {
  if (action.type === 'send') {
    const backend = get(BackendAtom.atom).SqsQueue
    const { queue, message } = action

    const result = await backend.send(queue, message)
    if (result.success) {
      return curr
    }
    return { ...curr, error: result.error }
  }
  return curr
}

const queuesAtom = JotaiUtil.asyncAtomWithAction(
  initQueues,
  JotaiUtil.composeAsyncHandlers({ search, send })
)

export const SqsQueuesAtom = {
  atom: queuesAtom,
  Search: (queuePrefix: string): SQSQueuesAction => ({ type: 'search', queuePrefix }),
  Send: (queue: SqsQueue, message: string): SQSQueuesAction => ({ type: 'send', queue, message })
} as const
