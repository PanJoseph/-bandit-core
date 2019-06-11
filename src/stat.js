/**
 * Creates an array of maxSize items with the sample filled appropriately
 * Array returned will always be of max size no matter what
 *
 * @param {Array} values Array of object to be used to add to sample { count: number, value: any }
 * @param {number} maxSize Max number of items in array to be returned
 */
function createSample(values, maxSize) {
  let counter = 0;
  const filledSample = values.reduce((acc, curr) => {
    acc.fill(curr.value, counter, counter + curr.count);
    counter += curr.count;
    return acc;
  }, new Array(maxSize));

  return counter < maxSize - 1 ? filledSample.fill(false, counter, maxSize) : filledSample;
}

/**
 * Picks a random value from an array
 *
 * @param {Array} arr Array to select random value from
 * @return {?} Random value selected from array
 */
function pickSample(arr) {
  return arr[Math.floor(Math.random() * (arr.length - 1))];
}

/**
 * Shuffles an array randomly out of place, implements Fisher-Yates shuffle algorithm
 *
 * @param {Array} arr Array to be shuffled
 * @return Shuffled array
 */
function shuffle(arr) {
  const len = arr.length;
  const shuffled = len ? arr.slice() : arr;

  if (len) {
    for (let i = len - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }
  return shuffled;
}

export { createSample, pickSample, shuffle };
