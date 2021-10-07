import {isNodeJS} from './isNodeJS'

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function notNull<TValue>(value: TValue | null): value is TValue {
  return value !== null
}

const cwd = isNodeJS() ? process.cwd() : ''
const pattern1 = new RegExp(escapeRegExp(cwd), 'g')
const pattern2 = new RegExp('(%{cwd})(.+?)(?=:[0-9]+:[0-9]+)(:[0-9]+)(:[0-9]+)', 'g')

export function parseStack(stack: string): string[] {
  return stack.replace(pattern1, '%{cwd}').split(/\r?\n/)
    .map(i => i.match(pattern2))
    .filter(notNull)
    .flat()
}