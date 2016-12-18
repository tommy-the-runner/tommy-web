function parse(stack) {
  const regexp = /at\s(.*)\s\(eval\sat\scompile\s\((.*)\),\s<anonymous>:(\d+):(\d+)\)/ig

  let match = regexp.exec(stack)

  let matches = []

  while (match !== null) {
    matches.push(match)
    match = regexp.exec(stack)
  }

  return matches.slice(0, -1).map(line => {
    return `at ${line[1]} (eval at <anonymous>:${line[3] - 2}:${line[4]})`
  })
}

module.exports = {
  parse
}
