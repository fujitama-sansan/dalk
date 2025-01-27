type SuccessResult = Readonly<{
  success: true
  ucompanyId: string
  time: number
}>

type ErrorResult = Readonly<{
  success: false
  ucompanyId: string
  errorMessage: string
}>

export type ResultData = SuccessResult | ErrorResult

type LineChartPoint = {
  ucompanyId: string
  time: number
}

export type LineChartData = LineChartPoint[]

const makeChartData = (
  results: ReadonlyArray<ResultData>,
  threshold: number,
  maxCount: number
): LineChartData => {
  return (results.filter((data) => data.success && data.time > threshold) as SuccessResult[])
    .sort((a, b) => b.time - a.time)
    .slice(0, maxCount)
}

export type Statistics = Readonly<{
  average: number
  maximum: number
  totalCount: number
  successCount: number
  errorCount: number
  percentile99: number
  percentile95: number
}>

const makeStatistics = (results: ReadonlyArray<ResultData>): Statistics => {
  const successTimes = results
    .filter((data) => data.success)
    .map((data) => data.time)
    .sort((a, b) => a - b)
  const totalCount = results.length
  const successCount = successTimes.length
  const errorCount = totalCount - successCount
  const average = successTimes.reduce((acc, time) => acc + time, 0) / successCount
  const maximum = successTimes[successCount - 1]
  const percentile99 = successTimes[Math.floor(successCount * 0.99)]
  const percentile95 = successTimes[Math.floor(successCount * 0.95)]
  return {
    average,
    maximum,
    totalCount,
    successCount,
    errorCount,
    percentile99,
    percentile95
  }
}

export const ExecutionResultUtil = {
  makeChartData,
  makeStatistics
}
