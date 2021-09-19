function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getStack(e: Error) {
  if (!e.stack) {
    return []
  }
  const pattern = new RegExp(escapeRegExp(process.cwd()), 'g')
  const lines: string[] = e.stack.replace(pattern, '%{cwd}').split(/\r?\n/)
  return lines
    .map(i => i.match(new RegExp('%{cwd}(\\\\|[a-z]|[A-Z]|[0-9]|\\.|:|_)+(:[0-9]+)(:[0-9]+)', 'g')))
    .filter(i => i !== null)
    //@ts-ignore
    .map(i => i[0])
}
