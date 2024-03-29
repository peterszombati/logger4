import {Listener} from '../../modules/Listener'
import {Writable} from 'stream'
import {ParsedError, parseError} from '../../utils/parseError'

export interface Logger4InterfaceV2 {
  debug: (log: string, ...params: any[]) => void
  info: (log: string, ...params: any[]) => void
  custom: (tag: string, log: string, ...params: any[]) => void
  error: (error: Error, ...params: any[]) => void
  warn: (log: string, ...params: any[]) => void
  success: (log: string, ...params: any[]) => void
  track: (...params: any[]) => void
  onStream: (tag: string, stream: Writable) => void
  print: (tag: string, log: string) => void
}

type Streams = Record<string, {
  id: number
  streams: Record<string, Writable>
}>

export type Logger4V2Constructor = {
  log?: (code: ParsedError, tag: string, log: string, ...params: any[]) => string
  error?: (code: ParsedError, error: ParsedError, ...params: any[]) => string
}

export class Logger4V2 extends Listener implements Logger4InterfaceV2 {
  streams: Streams = {}
  params = {
    log: (code: ParsedError, tag: string, log: string, ...params: any[]) => {
      return `${new Date().toISOString()};${tag};${code.stack[1]};${log}${params.length > 0 ? ';' + JSON.stringify({params}) : ''}`
    },
    error: (code: ParsedError, error: ParsedError, ...params: any[]) => {
      return `${new Date().toISOString()};error;${code.stack[1]};${error.message};${JSON.stringify({
        stack: error.stack,
        params: error.params
      })}${params.length > 0 ? ';' + JSON.stringify({params}) : ''}`
    },
  }

  constructor(params: Logger4V2Constructor = {}) {
    super()
    if (params.log) {
      this.params.log = params.log
    }
    if (params.error) {
      this.params.error = params.error
    }
  }

  private push(tag: string, log: string) {
    if (this.streams[tag]) {
      for (const [id, writable] of Object.entries(this.streams[tag].streams)) {
        writable.write(log)
      }
    }
  }

  private log(code: ParsedError, tag: string, log: string, ...params: any[]) {
    this.push(tag, this.params.log(code, tag, log, ...params))
    try {
      this.callListener(`onLog_${tag}`, [code, tag, log, ...params])
    } catch (e) {
      console.error(this.params.error(code, e))
    }
  }

  track(...params: any) {
    return this.push('track', `${new Date().toISOString()};${JSON.stringify(parseError(new Error('')).stack.slice(1,3))};${params.length > 0 ? JSON.stringify(params) : ''}`)
  }

  debug(log: string, ...params: any[]) {
    return this.log(parseError(new Error('')), 'debug', log, ...params)
  }

  info(log: string, ...params: any[]) {
    return this.log(parseError(new Error('')), 'info', log, ...params)
  }

  custom(tag: string, log: string, ...params: any[]) {
    return this.log(parseError(new Error('')), tag, log, ...params)
  }

  error(error: Error, ...params: any[]) {
    const code = parseError(new Error(''))
    const e = parseError(error)
    this.push('error', this.params.error(code, e, ...params))
    try {
      this.callListener('onError', [code, e, ...params])
    } catch (e) {
      console.error(this.params.error(code, e))
    }
  }

  warn(log: string, ...params: any[]) {
    return this.log(parseError(new Error('')), 'warn', log, ...params)
  }

  success(log: string, ...params: any[]) {
    return this.log(parseError(new Error('')), 'success', log, ...params)
  }

  onLog(tag: string, callback: (code: ParsedError, tag: string, log: string, ...params: any[]) => void) {
    return this.addListener(`onLog_${tag}`, callback)
  }

  onError(callback: (code: ParsedError, error: ParsedError, ...params: any[]) => void) {
    return this.addListener('onError', callback)
  }

  print(tag: string, log: string) {
    if (this.streams[tag]) {
      for (const [id, writable] of Object.entries(this.streams[tag].streams)) {
        writable.write(log)
      }
    }
  }

  onStream(tag: string, writable: Writable) {
    if (!this.streams[tag]) {
      this.streams[tag] = {
        id: -1,
        streams: {},
      }
    }
    this.streams[tag].id += 1
    const id = this.streams[tag].id
    this.streams[tag].streams['_' + id] = writable
    writable.on('error', (e) => {
      if (this.streams[tag].streams['_' + id]) {
        console.error(e)
      }
    })
    writable.once('finish', () => {
      if (this.streams[tag].streams['_' + id]) {
        delete this.streams[tag].streams['_' + id]
      }
    })
  }
}

