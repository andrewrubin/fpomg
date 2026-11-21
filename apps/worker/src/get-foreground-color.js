/**
 * Returns either white or black, depending on the perceived brightness of the
 * background color.
 *
 * The algorithm to determine the perceived brightness threshold is taken from
 * http://www.w3.org/TR/AERT#color-contrast
 *
 * @param {Array} bgColorRGB - an array of three colors corresponding to R, G, and B.
 */
const getForegroundColor = (bgColorRGB) => {
  if (!Array.isArray(bgColorRGB) || bgColorRGB.some((x) => isNaN(x))) {
    throw new Error(
      "There was an error calculating the text color based on the background color provided. Please try again."
    );
  }

  const value = Math.round(
    (parseInt(bgColorRGB[0]) * 299 +
      parseInt(bgColorRGB[1]) * 587 +
      parseInt(bgColorRGB[2]) * 114) /
      1000
  );

  return value > 125 ? "#000000" : "#ffffff";
};

export default getForegroundColor;
