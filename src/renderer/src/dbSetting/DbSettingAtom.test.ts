// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { useAtom } from 'jotai'
import { describe, expect, test } from 'vitest'
import { DbSettingUpdateInput } from '../../../common/interface'
import { TestWrapper } from '../testlib/TestWrapper'
import { DbSettingAtom } from './DbSettingAtom'

describe('DbSettingAtom', () => {
  test('create', async () => {
    const { result } = renderHook(() => useAtom(DbSettingAtom.listAtom), {
      wrapper: TestWrapper
    })
    await waitFor(() => result.current[0].items.length > 0)
    let [state, dispatch] = result.current
    expect(state.items.length).toBe(2)
    await act(async () => {
      await dispatch(DbSettingAtom.Create())
    })
    ;[state, dispatch] = result.current
    expect(state.items.length).toBe(4)
  })

  test('remove', async () => {
    const { result } = renderHook(() => useAtom(DbSettingAtom.listAtom), {
      wrapper: TestWrapper
    })
    await waitFor(() => result.current[0].items.length > 0)
    let [state, dispatch] = result.current
    expect(state.items.length).toBe(2)
    await act(async () => {
      await dispatch(DbSettingAtom.Remove(state.items[0].id))
    })
    ;[state, dispatch] = result.current
    expect(state.items.length).toBe(1)
  })

  test('update', async () => {
    const { result } = renderHook(() => useAtom(DbSettingAtom.listAtom), {
      wrapper: TestWrapper
    })
    await waitFor(() => result.current[0].items.length > 0)
    let [state, dispatch] = result.current
    expect(state.items.length).toBe(2)
    await act(async () => {
      await dispatch({
        type: 'updateList',
        id: state.items[0].id,
        setting: {
          name: 'test-updated',
          host: '',
          port: 0,
          user: '',
          password: '',
          staging: false
        } satisfies DbSettingUpdateInput
      })
    })
    ;[state, dispatch] = result.current
    expect(state.items[0].name).toBe('test-updated')
  })

  test('init', async () => {
    const { result } = renderHook(() => useAtom(DbSettingAtom.listAtom), {
      wrapper: TestWrapper
    })
    await waitFor(() => result.current[0].items.length > 0)
    const [state] = result.current
    expect(state.items.length).toBe(2)
  })
})
