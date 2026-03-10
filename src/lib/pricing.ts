export interface SeasonalRate {
  start: Date
  end: Date
  price: number
}

export function resolveSuitePrice({
  basePrice,
  seasonalRates,
  date,
}: {
  basePrice: number
  seasonalRates: SeasonalRate[]
  date: Date
}) {
  const override = seasonalRates.find(
    (r) => date >= r.start && date <= r.end
  )

  return override ? override.price : basePrice
}
