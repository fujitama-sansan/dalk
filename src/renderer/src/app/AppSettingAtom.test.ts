// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { useAtom } from 'jotai'
import { describe, expect, test } from 'vitest'
import { User } from '../../../common/interface'
import { TestWrapper } from '../testlib/TestWrapper'
import { AppSettingAtom } from './AppSettingAtom'

describe('AppSettingAtom', () => {
  test('init', async () => {
    const { result } = renderHook(() => useAtom(AppSettingAtom.atom), {
      wrapper: TestWrapper
    })
    await waitFor(() => !!result.current[0].ucompany)
    const [state] = result.current
    expect(state.ucompany?.ucompanyName).toBe('Test Company-1')
    expect(state.operatorUser?.userName).toBe('ユーザー 3太郎')
  })

  test('setDbSettingId', async () => {
    const { result } = renderHook(() => useAtom(AppSettingAtom.atom), {
      wrapper: TestWrapper
    })
    await waitFor(() => !!result.current[0].ucompany)
    let [state, dispatch] = result.current
    console.log('start selctDbSetting')
    await dispatch(AppSettingAtom.SelectDbSetting('2'))
    await waitFor(() => !result.current[0].ucompany)
    ;[state, dispatch] = result.current
    console.log({ state })
    expect(state.ucompany).toBeNull()
    expect(state.operatorUser).toBeNull()
  })

  test('setUcompanyId', async () => {
    const { result } = renderHook(() => useAtom(AppSettingAtom.atom), {
      wrapper: TestWrapper
    })
    await waitFor(() => !!result.current[0].ucompany)
    let [state, dispatch] = result.current
    await dispatch(AppSettingAtom.SetUcompanyId('test_company_2'))
    await waitFor(() => result.current[0].ucompany?.ucompanyId === 'test_company_2')
    ;[state, dispatch] = result.current
    expect(state.data).toStrictEqual({
      dbSettingId: 'dbSetting-id-1',
      ucompanyId: 'test_company_2',
      userId: null
    })
    expect(state.ucompany).toStrictEqual({
      ucompanyId: 'test_company_2',
      ucompanyName: 'Test Company-test_company_2'
    })
    expect(state.operatorUser).toBeNull()
  })

  test('selectUser', async () => {
    const { result } = renderHook(() => useAtom(AppSettingAtom.atom), {
      wrapper: TestWrapper
    })
    await waitFor(() => !!result.current[0].ucompany)
    let [state, dispatch] = result.current
    await dispatch(AppSettingAtom.SetUcompanyId('test_company_2'))
    await waitFor(() => result.current[0].ucompany?.ucompanyId === 'test_company_2')
    await dispatch(
      AppSettingAtom.SelectUser({
        userId: 'u-2',
        ucompanyId: 'test_company_2',
        userName: 'user-2',
        email: 'test2@example.com',
        effectiveDateFrom: new Date('2021-01-01T00:00:00.000Z'),
        effectiveDateTo: new Date('2099-12-31T23:59:59.000Z'),
        loginEmail: 'test2@example.com',
        billingGroupIds: [],
        uuid: ''
      })
    )
    await waitFor(() => result.current[0].operatorUser?.userId === 'u-2')
    ;[state, dispatch] = result.current
    expect(state.data).toStrictEqual({
      dbSettingId: 'dbSetting-id-1',
      ucompanyId: 'test_company_2',
      userId: 'u-2'
    })
    expect(state.ucompany).toStrictEqual({
      ucompanyId: 'test_company_2',
      ucompanyName: 'Test Company-test_company_2'
    })
    expect(state.operatorUser).toStrictEqual<User>({
      userId: 'u-2',
      ucompanyId: 'test_company_2',
      userName: 'user-2',
      email: 'test2@example.com',
      effectiveDateFrom: new Date('2021-01-01T00:00:00.000Z'),
      effectiveDateTo: new Date('2099-12-31T23:59:59.000Z'),
      loginEmail: 'test2@example.com',
      billingGroupIds: [],
      uuid: ''
    })
  })
})
