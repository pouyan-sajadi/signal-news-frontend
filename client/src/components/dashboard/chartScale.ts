const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
export const count = new Intl.NumberFormat('en')
export const compactCount = (value: number) => compact.format(value)

export function chartScale(largest: number) {
  const target = Math.max(largest / 4, 1)
  const power = 10 ** Math.floor(Math.log10(target))
  const step = [1, 2, 2.5, 5, 10].find(unit => unit * power >= target)! * power
  const intervals = Math.max(1, Math.ceil(largest / step))
  return { max: intervals * step, ticks: Array.from({ length: intervals + 1 }, (_, index) => index * step) }
}
