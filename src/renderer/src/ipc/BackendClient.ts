import type {
  Backend,
  BackendDomain,
  BackendMessage,
  BackendMethodName
} from '../../../common/interface'
import { BackendChannel, fakeBackend } from '../../../common/interface'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func = (...args: any) => any
type Method<D extends BackendDomain, M extends BackendMethodName<D>> = Backend[D][M] & Func
type Args<D extends BackendDomain, M extends BackendMethodName<D>> = Parameters<Method<D, M>>
type Ret<D extends BackendDomain, M extends BackendMethodName<D>> = ReturnType<Method<D, M>>

const send = <D extends BackendDomain, M extends BackendMethodName<D>>(
  domain: D,
  method: M,
  ...args: Args<D, M>
): Ret<D, M> =>
  window.electron.ipcRenderer.invoke(BackendChannel.channelName, {
    domain,
    method,
    args
  } satisfies BackendMessage<D, M>) as Ret<D, M>

const makeSendMethod =
  <D extends BackendDomain, M extends BackendMethodName<D>>(domain: D, method: M) =>
  (...args: Args<D, M>): Ret<D, M> =>
    send(domain, method, ...args)

const buildServiceClient = <D extends BackendDomain>(domain: D, faker: Backend[D]): Backend[D] =>
  Object.keys(faker).reduce((acc, method) => {
    acc[method] = makeSendMethod(domain, method as BackendMethodName<D>)
    return acc
  }, {}) as Backend[D]

const buildClient = (faker: Backend): Backend =>
  Object.keys(faker).reduce((acc, domain) => {
    acc[domain] = buildServiceClient(domain as BackendDomain, faker[domain])
    return acc
  }, {}) as Backend

export const BackendClientFactory = {
  create: (): Backend => buildClient(fakeBackend)
} as const
