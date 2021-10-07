import {isObject} from './isObject'
import {parseStack} from './parseStack'
import {isNodeJS} from './isNodeJS'

export type ParsedError = { message: string, stack: string[], cwd: string, params: any }

const cwd = isNodeJS() ? process.cwd() : ''

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

  return {
    message: e.message,
    stack: parseStack(e.stack),
    cwd,
    // @ts-ignore
    params: isObject(e.params) ? e.params : undefined
  }
}
