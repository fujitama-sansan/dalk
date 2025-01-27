import { EntityInput, SqsMessageDefinition } from '../../../../common/interface'
import { AsyncFamilyHandler, AsyncFamilyRead, JotaiUtil } from '../../util/JotaiUtil'
import { SqsMessageDefinitionListAtom } from './SqsMessageDefinitionListAtom'

const emptySqsMessageDefinition: SqsMessageDefinition = {
  id: '',
  name: '',
  queue: null,
  messageClass: '',
  correlationId: '',
  graph: ''
}

const init: AsyncFamilyRead<string, SqsMessageDefinition> = (id) => async (get) => {
  const messages = await get(SqsMessageDefinitionListAtom.atom)
  const item = messages.items.find((i) => i.id === id)
  return item || emptySqsMessageDefinition
}

type ItemAction = {
  type: 'save'
  input: EntityInput<SqsMessageDefinition>
}

const save: AsyncFamilyHandler<string, SqsMessageDefinition, ItemAction> =
  (id) => async (curr, _get, set, action) => {
    if (action.type === 'save') {
      await set(
        SqsMessageDefinitionListAtom.atom,
        SqsMessageDefinitionListAtom.Update(id, action.input)
      )
      return { ...curr, ...action.input }
    }
    return curr
  }

const mainAtom = JotaiUtil.asyncAtomFamilyWithAction(init, save)

export const SQSMessageDefinitionAtom = {
  atom: mainAtom,
  Save: (input: EntityInput<SqsMessageDefinition>): ItemAction => ({ type: 'save', input })
}
