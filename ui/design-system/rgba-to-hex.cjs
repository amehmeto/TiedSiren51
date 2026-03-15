const RGBA_CHANNELS_REGEX = /rgba?\((\d+),\s*(\d+),\s*(\d+)/

/**
 * @param {string} rgba
 * @returns {string}
 */
function rgbaToHex(rgba) {
  const match = rgba.match(RGBA_CHANNELS_REGEX)
  if (!match) return rgba
  const [, r, g, b] = match
  return (
    '#' +
    [r, g, b]
      .map((c) => Number(c).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}

module.exports = { rgbaToHex }
