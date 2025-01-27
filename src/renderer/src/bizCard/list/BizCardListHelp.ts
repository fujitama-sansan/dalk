import { HelpContent } from '../../help/HelpContent'

const makeUnread: HelpContent = {
  title: '読み取れなかった名刺にする',
  description: `trn_ncのentryStatusを00101000に更新します。

参照: [2017-07-11 データ化の流れとEntryStatusについて](https://sansan.atlassian.net/wiki/x/MIB_Bw)
`
}

const makeNayosed: HelpContent = {
  title: '名寄せ済みにする',
  description: `trn_ncのidentificationFlagを00001111に更新します。

参照: [identification_flag について](https://sansan.atlassian.net/wiki/x/JYGKnw)
`
}

const makeSelfBizCardSource: HelpContent = {
  title: '自己名刺ソースにする',
  description: `trn_ncのregisterChannelを00010010に更新します。

参照: [1952 登録経路の整理](https://sansan.atlassian.net/wiki/x/RQA8sg)
  `
}

export const BizCardListHelp = {
  makeUnread,
  makeNayosed,
  makeSelfBizCardSource
} as const
