export function compactDisplayValue(value: string, maxCharacters = 88): string {
  const characters = Array.from(value)
  if (characters.length <= maxCharacters) return value
  if (maxCharacters <= 1) return '…'
  return `${characters.slice(0, maxCharacters - 1).join('')}…`
}
