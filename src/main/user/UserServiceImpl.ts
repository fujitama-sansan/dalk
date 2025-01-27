import { User, UserSearchQuery, UserService } from '../../common/interface/User'
import { Result, resultify } from '../../common/util/Result'
import { DataPrismaAccessor } from '../db/DataPrismaAccessor'
import { DbSettingRepository } from '../db/DbSettingRepository'

export class UserServiceImpl implements UserService {
  constructor(readonly dbSettingRepository: DbSettingRepository) {}

  search(
    dbSettingId: string,
    ucompanyId: string,
    searchQuery: UserSearchQuery
  ): Promise<Result<readonly User[]>> {
    return resultify(async () => {
      const setting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      const prisma = await DataPrismaAccessor.connectByUcompanyId(setting, ucompanyId)
      const { query } = searchQuery
      const users = await prisma.mst_user.findMany({
        select: {
          user_id: true,
          ucompany_id: true,
          user_name: true,
          email: true,
          effective_date_from: true,
          effective_date_to: true,
          login_email: true,
          user_uuids: {
            select: {
              user_uuid: true
            }
          },
          billing_groups: {
            select: {
              billing_group_id: true
            }
          }
        },
        where: {
          ucompany_id: ucompanyId,
          effective_date_from: {
            lte: new Date()
          },
          effective_date_to: {
            gte: new Date()
          },
          delete_flag: '00000000',
          OR: query
            ? [
                {
                  email: {
                    contains: query
                  }
                },
                {
                  user_name: {
                    contains: query
                  }
                },
                {
                  login_email: {
                    contains: query
                  }
                }
              ]
            : undefined
        },
        orderBy: {
          crttimestamp: 'asc'
        },
        take: 100
      })
      return users.map((user) => ({
        userId: user.user_id,
        ucompanyId: user.ucompany_id,
        userName: user.user_name,
        email: user.email,
        effectiveDateFrom: user.effective_date_from,
        effectiveDateTo: user.effective_date_to,
        loginEmail: user.login_email,
        uuid: user.user_uuids[0]?.user_uuid,
        billingGroupIds: user.billing_groups.map((bg) => bg.billing_group_id)
      }))
    })
  }

  get(dbSettingId: string, ucompanyId: string, userId: string): Promise<Result<User>> {
    return resultify(async () => {
      const setting = await this.dbSettingRepository.getOrThrow(dbSettingId)
      const prisma = await DataPrismaAccessor.connectByUcompanyId(setting, ucompanyId)
      const user = await prisma.mst_user.findUniqueOrThrow({
        select: {
          user_id: true,
          ucompany_id: true,
          user_name: true,
          email: true,
          effective_date_from: true,
          effective_date_to: true,
          login_email: true,
          user_uuids: {
            select: {
              user_uuid: true
            }
          },
          billing_groups: {
            select: {
              billing_group_id: true
            }
          }
        },
        where: {
          ucompany_id_user_id: {
            ucompany_id: ucompanyId,
            user_id: userId
          },
          effective_date_from: {
            lte: new Date()
          },
          effective_date_to: {
            gte: new Date()
          },
          delete_flag: '00000000'
        }
      })
      return {
        userId: user.user_id,
        ucompanyId: user.ucompany_id,
        userName: user.user_name,
        email: user.email,
        effectiveDateFrom: user.effective_date_from,
        effectiveDateTo: user.effective_date_to,
        loginEmail: user.login_email,
        uuid: user.user_uuids[0]?.user_uuid,
        billingGroupIds: user.billing_groups.map((bg) => bg.billing_group_id)
      }
    })
  }
}
