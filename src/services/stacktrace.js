function parse(stack) {
  const regexp = /at\s(.*)\s\(eval\sat\scompile\s\((.*)\),\s<anonymous>:(\d+):(\d+)\)/ig

  let match = regexp.exec(stack)

  let matches = []

  while (match != null) {
    matches.push(match)
    match = regexp.exec(stack)
  }

  return matches.map(match => {
    return `at ${match[1]} (eval at <anonymous>:${match[3] - 2}:${match[4]})`
  })
}

module.exports = {
  parse
}
