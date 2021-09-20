function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function notNull<TValue>(value: TValue | null): value is TValue {
  return value !== null
}

export type ParsedError = { message: string, stack: string[], cwd: string }

const cwd = process.cwd()
const pattern1 = new RegExp(escapeRegExp(cwd), 'g')
const pattern2 = new RegExp('%{cwd}(\\\\|[a-z]|[A-Z]|[0-9]|\\.|:|_)+(:[0-9]+)(:[0-9]+)', 'g')

export function parseError(e: Error): ParsedError {
  if (!e.stack) {
    return {
      message: typeof e === 'string' ? e : '',
      stack: [],
      cwd,
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
  }
}
