import {isObject} from './isObject'

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function notNull<TValue>(value: TValue | null): value is TValue {
  return value !== null
}

export type ParsedError = { message: string, stack: string[], cwd: string, params: any }

const cwd = process.cwd()
const pattern1 = new RegExp(escapeRegExp(cwd), 'g')
const pattern2 = new RegExp('({%cwd})(.+?)(?=:[0-9]+:[0-9]+)(:[0-9]+)(:[0-9]+)', 'g')

export function parseError(e: Error): ParsedError {
  if (!e.stack) {
    if (typeof e === 'string') {
      return {
        message: e,
        stack: [],
        cwd,
        params: undefined,
      }
    }
    if (e instanceof Error) {
      return {
        message: e.message,
        stack: [],
        cwd,
        // @ts-ignore
        params: isObject(e.params) ? e.params : undefined
      }
    }
    try {
      return {
        // @ts-ignore
        message: isObject(e) ? '' : JSON.stringify(e),
        stack: [],
        cwd,
        // @ts-ignore
        params: isObject(e) ? e : undefined
      }
    } catch (e) {
      return {
        message: '',
        stack: [],
        cwd,
        // @ts-ignore
        params: isObject(e) ? e : undefined
      }
    }
  }

  const lines: string[] = e.stack.replace(pattern1, '%{cwd}').split(/\r?\n/)
  return {
    message: e.message,
    stack: lines
      .map(i => i.match(pattern2))
      .filter(notNull)
      .flat(),
    cwd,
    // @ts-ignore
    params: isObject(e.params) ? e.params : undefined
  }
}
