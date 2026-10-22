// e.g. pluralise(1, 'day') is '1 day' and pluralise(15, 'day') is '15 days'
export function pluralise(count: number, word: string): string {
  if (count === 1) {
    return `${count} ${word}`
  }

  return `${count} ${word}s`
}
