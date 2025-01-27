import { BackendEventConst, QuerySetExecutionService } from '../../../../common/interface'
import { Result } from '../../../../common/util/Result'
import { MockBackendEventApi } from '../MockBackendEventApi'
import { MockIdGenerator } from './MockIdGenerator'
import { MockUtil } from './MockUtil'

export class MockQuerySetExecutionService implements QuerySetExecutionService {
  private readonly util: MockUtil
  private readonly idGenerator = new MockIdGenerator('QuerySetExecution')
  private executingId: string | null = null

  constructor(waitMs: number) {
    this.util = new MockUtil('QuerySetExecution', waitMs)
  }

  async execute(): Promise<Result<string>> {
    const executionId = this.idGenerator.generate()
    this.executingId = executionId
    const util = this.util
    const currentExecutionId = (): string | null => this.executingId
    ;(async function (): Promise<void> {
      await util.prepend('execute')
      MockBackendEventApi.instance.dispatch({
        type: BackendEventConst.types.QueryExecution,
        executionId,
        event: 'start'
      })

      const data = new Array(200).fill('').map((_, i) => ({
        ucompanyId: `test_company${i + 1}`,
        time: ((i + 1) % 4) * 1000
      }))
      await util.wait(500)
      MockBackendEventApi.instance.dispatch({
        type: BackendEventConst.types.QueryExecution,
        executionId,
        event: 'companiesFound',
        companyCount: data.length
      })

      let successCount = 0
      for (const d of data) {
        await util.wait(100)
        if (currentExecutionId() !== executionId) {
          return
        }
        MockBackendEventApi.instance.dispatch({
          type: BackendEventConst.types.QueryExecution,
          executionId,
          event: 'ucompanySuccess',
          ucompanyId: d.ucompanyId,
          time: d.time,
          successCount: ++successCount,
          result: []
        })
      }
      await util.wait(100)
      MockBackendEventApi.instance.dispatch({
        type: BackendEventConst.types.QueryExecution,
        executionId,
        event: 'end'
      })
    })().then()

    return this.util.resultify(executionId)
  }

  async stop(): Promise<Result<void>> {
    await this.util.prepend('stop')
    this.executingId = null
    return this.util.resultify(undefined)
  }
}
