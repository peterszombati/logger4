function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function notNull<TValue>(value: TValue | null): value is TValue {
  return value !== null
}

export type ParsedError = { message: string, stack: string[], cwd: string }

const cwd = process.cwd()

export function parseError(e: Error): ParsedError {
  if (!e.stack) {
    return {
      message: typeof e === 'string' ? e : '',
      stack: [],
      cwd,
    }
  }

  const pattern = new RegExp(escapeRegExp(cwd), 'g')
  const lines: string[] = e.stack.replace(pattern, '%{cwd}').split(/\r?\n/)
  return {
    message: e.message,
    stack: lines
      .map(i => i.match(new RegExp('%{cwd}(\\\\|[a-z]|[A-Z]|[0-9]|\\.|:|_)+(:[0-9]+)(:[0-9]+)', 'g')))
      .filter(notNull)
      .flat(),
    cwd,
  }
}
