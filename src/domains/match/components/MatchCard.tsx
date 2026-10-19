import { View } from 'react-native'

import { MATCH_STATUS_LABELS } from '../match.constants'
import { matchTags, toMatchCounterpart } from '../utils/matchView'

import type { Match } from '../types/match.types'
import type { MatchViewerRole } from '../utils/matchView'

import { StatusPill } from '@/core/components/atoms/StatusPill'
import { Text } from '@/core/components/atoms/Text'
import { PressableScale } from '@/core/motion'
import { hoverLift } from '@/core/theme'
import { formatDate } from '@/core/utils/formatDate'

export type MatchCardProps = {
  match: Match
  viewerRole: MatchViewerRole
  /** Görüntüleyenin baş harfleri (üst üste binen ikinci avatar). */
  viewerInitials: string
  onPress: () => void
}

/**
 * MatchCard (b0/b5 · Eşleşmelerim) — üst üste iki avatar, karşı taraf, durum,
 * ilan başlığı ve etiketler (alan · ücret · görüşme · tarih).
 */
export function MatchCard({ match, viewerRole, viewerInitials, onPress }: MatchCardProps) {
  const other = toMatchCounterpart(match, viewerRole)
  const active = match.status === 'ACTIVE'
  const status = MATCH_STATUS_LABELS[match.status]
  const tags = matchTags(match, formatDate(match.createdAt, 'dayMonthShort'))
  const title = match.listing?.title ?? 'İlan'

  return (
    <PressableScale
      testID={`match-card-${match.id}`}
      onPress={onPress}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${other.name}, ${status}. ${title}`}
      className={`gap-3 rounded-2xl border border-border bg-surface p-4 ${hoverLift}`}
    >
      <View className="flex-row items-center gap-3">
        <View className="flex-row" accessibilityElementsHidden>
          <View className="h-[46px] w-[46px] items-center justify-center rounded-full bg-accent">
            <Text className="font-body-heavy text-body-sm text-accent-fg">{other.initials}</Text>
          </View>
          <View className="-ml-3.5 h-[46px] w-[46px] items-center justify-center rounded-full border-[3px] border-surface bg-primary">
            <Text className="font-body-heavy text-label text-primary-fg">{viewerInitials}</Text>
          </View>
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text numberOfLines={1} className="font-body-bold text-base text-fg">
            {other.name}
          </Text>
          <Text numberOfLines={1} className="text-label text-fg-muted">
            {other.subtitle}
          </Text>
        </View>
        <StatusPill label={status} variant={active ? 'soft' : 'neutral'} pulse={active} />
      </View>
      <Text numberOfLines={2} className="font-body-semibold text-body-sm text-fg">
        {title}
      </Text>
      {tags.length > 0 ? (
        <View className="flex-row flex-wrap gap-1.5">
          {tags.map((t) => (
            <View key={t} className="rounded-full bg-bg px-2.5 py-1">
              <Text className="font-body-semibold text-xs text-fg">{t}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </PressableScale>
  )
}
