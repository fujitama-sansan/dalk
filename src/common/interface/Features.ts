import { notImpl } from '../util/Nop'
import { Result } from '../util/Result'
import { User } from './User'

export const AllFeatures = {
  Company: {
    label: '企業DB'
  },
  'Company/Export': {
    label: '企業DBダウンロード'
  },
  CompanyResearch: {
    label: '会社リサーチ'
  },
  'Integration/TDB/TDBIndex': {
    label: 'TDBインデックス'
  },
  'Integration/TDB/LayoutSansan': {
    label: 'TDBライセンス'
  },
  Contact: {
    label: 'コンタクト'
  },
  'Deal/Core': {
    label: '案件管理'
  },
  'Integration/TDB/TransactionVolumeRank': {
    label: '取引先'
  },
  'Integration/Diamond/ViewCompanies': {
    label: 'DCD会社情報'
  },
  'Integration/Diamond/ViewOfficers': {
    label: 'DCD役員情報'
  },
  'Integration/Diamond/ViewOfficersAndManagers': {
    label: 'DCD管理職情報'
  },
  'Integration/Diamond/Download': {
    label: 'DCDダウンロード'
  },
  Technographics: {
    label: 'テクノグラフィックス'
  },
  'BulkEmailDelivery/MailJobApproval': {
    label: 'メール配信承認機能'
  },
  'RiskAssessment/Refinitiv': {
    label: 'Refinitiv'
  },
  'BizCard/SelfBizCardSource': {
    label: '名刺メーカー'
  },
  'BizCard/SelfBizCard/Supply': {
    label: '名刺メーカー：サプライ'
  },
  'BizCard/SelfBizCard/Order': {
    label: '名刺メーカー：注文'
  },
  'BizCard/SelfBizCard/ApprovalRequest': {
    label: '名刺メーカー：承認'
  },
  ExternalRelation: {
    label: '拠点DB'
  },
  'ExternalRelation/Mail/Gmail': {
    label: 'スマート接点管理／メール取込機能(Gmail)'
  },
  'ExternalRelation/Mail/Microsoft365': {
    label: 'スマート接点管理／メール取込機能(Microsoft365)'
  },
  'BizCardInbox/Gmail': {
    label: 'メール署名取り込み機能(Gmail)'
  },
  'BizCardInbox/Microsoft365': {
    label: 'メール署名取り込み機能(Microsoft365)'
  },
  'Integration/MicrosoftTeams/Calendar': {
    label: 'Teamsカレンダー連携'
  },
  'Integration/Microsoft365/Outlook': {
    label: 'Outlook連携'
  },
  DirectMail: {
    label: 'DM送付'
  },
  'Security/CustomLoginSessionTimeout': {
    label: 'ログイン状態保持期間'
  },
  'Security/IPAddressRestriction': {
    label: 'IPアドレス制限'
  },
  'Security/Mfa': {
    label: '2要素認証'
  },
  'Security/PasswordPolicy': {
    label: 'パスワードポリシー設定'
  },
  'Security/Saml2Authentication': {
    label: 'SAML認証'
  },
  'Security/SmartphoneApplicationRestriction': {
    label: 'スマホアプリ端末制限(アプリ)'
  },
  'Security/SmartphoneWebRestriction': {
    label: 'スマホアプリ端末制限(Web)'
  }
} as const

export type FeatureName = keyof typeof AllFeatures

export type FeatureDef = Readonly<{
  label: string
}>

export type FeatureAvailability = 'NotAvailable' | 'Available' | 'Activated'

export type FeatureEntry = Readonly<{
  name: FeatureName
  commonAvailable: boolean
  mstAvailable: boolean
  commonActivated: boolean
  mstActivated: boolean
}>

export interface FeatureService {
  getAll(
    dbSettingId: string,
    ucompanyId: string,
    billingGroupId: string
  ): Promise<Result<ReadonlyArray<FeatureEntry>>>
  makeAvailable(
    dbSettingId: string,
    ucompanyId: string,
    operatorUser: User,
    billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>>
  makeUnavailable(
    dbSettingId: string,
    ucompanyId: string,
    operatorUser: User,
    billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>>
  activate(
    dbSettingId: string,
    ucompanyId: string,
    operatorUser: User,
    billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>>
  deactivate(
    dbSettingId: string,
    ucompanyId: string,
    operatorUser: User,
    billingGroupId: string,
    featureName: FeatureName
  ): Promise<Result<boolean>>
}

export const fakeFeatureService: FeatureService = {
  getAll: notImpl,
  makeAvailable: notImpl,
  makeUnavailable: notImpl,
  activate: notImpl,
  deactivate: notImpl
} as const
