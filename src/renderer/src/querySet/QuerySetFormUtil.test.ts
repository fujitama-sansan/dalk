import { describe, expect, test } from 'vitest'
import { QuerySetDefinition } from '../../../common/interface'
import { QuerySetFormUtil, QuerySetFormUtil_ForTestOnly } from './QuerySetFormUtil'

describe('QuerySetFormUtil', () => {
  test('toFormData', () => {
    const querySet = {
      id: 'query-set-id-0',
      name: 'name',
      description: 'description',
      threshold: 100,
      maxCount: 100,
      ucompanyIds: '33i 55i',
      queries: [
        {
          id: 'item-0',
          query: 'SELECT * FROM test_table',
          targetParameter: ''
        }
      ]
    } satisfies QuerySetDefinition
    const result = QuerySetFormUtil.toFormData(querySet)
    expect(result).toStrictEqual({
      name: 'name',
      description: 'description',
      threshold: 100,
      maxCount: 100,
      ucompanyIds: '33i 55i',
      queries: [
        {
          id: 'item-0',
          targetParameter: '',
          query: 'SELECT * FROM test_table'
        }
      ]
    })
  })

  test('toInput', () => {
    const formData = {
      name: 'name',
      description: 'description',
      threshold: 100,
      maxCount: 100,
      ucompanyIds: '33i 55i',
      queries: [
        {
          id: 'item-0',
          targetParameter: '',
          query: 'SELECT * FROM test_table'
        }
      ]
    }
    const result = QuerySetFormUtil.toInput(formData)
    expect(result).toStrictEqual({
      name: 'name',
      description: 'description',
      threshold: 100,
      maxCount: 100,
      ucompanyIds: '33i 55i',
      queries: [
        {
          id: 'item-0',
          targetParameter: '',
          query: 'SELECT * FROM test_table'
        }
      ]
    })
  })

  test('collectAllParameterNames', () => {
    const queries = [
      {
        query: 'SELECT * FROM test_table'
      },
      {
        query: 'SELECT * FROM trn_nc WHERE id = @Id'
      },
      {
        query: 'SELECT id FROM trn_nc WHERE ucompany_id = @UcompanyId LIMIT @Limit'
      },
      {
        query: '10'
      }
    ]
    const result = QuerySetFormUtil_ForTestOnly.collectAllParameterNames(queries)
    expect(result).toStrictEqual(new Set(['Id', 'UcompanyId', 'Limit']))
  })

  test('arrange', () => {
    const queries = [
      {
        id: 'item-0',
        query: 'SELECT * FROM test_table WHERE id = @TableId',
        targetParameter: ''
      },
      {
        id: 'item-1',
        query: 'SELECT * FROM trn_nc WHERE id = @Id',
        targetParameter: 'TableId'
      },
      {
        id: 'item-2',
        query: 'SELECT id FROM trn_nc WHERE ucompany_id = @UcompanyId LIMIT @Limit',
        targetParameter: 'Id'
      },
      {
        id: 'item-3',
        query: '10',
        targetParameter: 'Something'
      }
    ]
    const appended: Array<string> = []
    const removed: Array<number> = []
    QuerySetFormUtil.arrange({
      queries,
      append: (items) => {
        items.forEach((item) => {
          appended.push(item.targetParameter)
        })
      },
      remove: (indice) => {
        indice.forEach((index) => {
          removed.push(index)
        })
      }
    })
    expect(appended).toStrictEqual(['Limit'])
    expect(removed).toStrictEqual([3])
  })
})
