import { LocalPrismaAccessor } from '../localDb/LocalPrismaAccessor'

export type UserSettingKeys<T extends object> = Record<keyof T, string>

const getValues = async <T extends object>(
  userSettingKeys: UserSettingKeys<T>,
  defaultValues: T
): Promise<T> => {
  const db = LocalPrismaAccessor.connect()
  const records = await db.userSetting.findMany({
    where: {
      key: {
        in: Object.values(userSettingKeys)
      }
    }
  })
  return records.reduce((acc, r) => {
    if (r.value) {
      const key = Object.entries(userSettingKeys).find((ent) => ent[1] === r.key)?.[0]
      if (key) {
        return {
          ...acc,
          [key]: typeof defaultValues[key] === 'number' ? parseInt(r.value) : r.value
        }
      }
    }
    return acc
  }, defaultValues)
}

const get = async (key: string): Promise<string | null> => {
  const db = LocalPrismaAccessor.connect()
  const record = await db.userSetting.findUnique({
    where: {
      key
    }
  })
  return record?.value ?? null
}

const setValues = async <T extends object>(
  userSettingKeys: UserSettingKeys<T>,
  values: T
): Promise<void> => {
  const db = LocalPrismaAccessor.connect()
  for (const ent of Object.entries(values)) {
    const key = userSettingKeys[ent[0]]
    const value = ent[1] === null ? null : String(ent[1])
    await db.userSetting.upsert({
      where: {
        key
      },
      update: {
        value
      },
      create: {
        key,
        value
      }
    })
  }
}

const set = async (key: string, value: string | null): Promise<void> => {
  const db = LocalPrismaAccessor.connect()
  await db.userSetting.upsert({
    where: {
      key
    },
    update: {
      value
    },
    create: {
      key,
      value
    }
  })
}

export const UserSettingAccessor = {
  get,
  getValues,
  set,
  setValues
} as const
