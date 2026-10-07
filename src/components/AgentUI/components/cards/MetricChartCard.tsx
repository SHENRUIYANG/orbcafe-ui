'use client'

import type { FC } from 'react'
import { CMetricChartCard, type MetricChartDatum } from '../../../MetricChart'
import type { AgentUICardHooks, MetricChartCardTypeContent } from '../cardTypes'

interface MetricChartCardProps extends MetricChartCardTypeContent {
  messageId?: string
  cardHooks?: AgentUICardHooks
}

const MetricChartCard: FC<MetricChartCardProps> = ({
  messageId,
  cardHooks,
  valueSuffix,
  secondaryValueSuffix,
  ...cardData
}) => {
  const emit = (action: 'action' | 'show-data', payload: unknown) => {
    cardHooks?.onCardEvent?.({
      messageId,
      cardType: 'metric-chart-card',
      action,
      title: cardData.title,
      payload,
      rawData: cardData
    })
  }

  const formatValue = (value: number, suffix?: string) => `${value.toLocaleString()}${suffix ?? ''}`

  return (
    <CMetricChartCard
      {...cardData}
      valueFormatter={(value) => formatValue(value, valueSuffix)}
      secondaryValueFormatter={(value) => formatValue(value, secondaryValueSuffix)}
      onChartTypeChange={(chartType) => emit('action', { chartType })}
      onItemClick={(item: MetricChartDatum) => emit('action', { item })}
      onDataDetails={(item, source) => emit('show-data', { item, source })}
    />
  )
}

export default MetricChartCard
