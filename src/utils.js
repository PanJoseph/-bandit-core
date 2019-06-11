import cloneDeep from 'lodash.clonedeep';

/**
 * Recursively freeze object ignoring keys listed in the exceptions array
 *
 * @param {object} object Object to be deep frozen
 * @param {array} exceptions Array of keys to be ignored when freezing
 * @return {object} a copy of the object deep frozen.
 */
function deepFreeze(object, exceptions = []) {
  if (!Object.isFrozen(object)) {
    const props = Object.getOwnPropertyNames(object);
    const objCopy = Array.isArray(object) ? [] : {};

    for (let idx = 0; idx < props.length; idx += 1) {
      const prop = props[idx];
      const value = object[prop];

      if (exceptions.indexOf(prop) === -1) {
        objCopy[prop] = value && typeof value === 'object' ? deepFreeze(value, exceptions) : value; // eslint-disable-line no-param-reassign
      } else {
        objCopy[prop] = cloneDeep(value);
      }
    }

    return Object.freeze(objCopy);
  }

  return object;
}

/**
 * Recursively flatten an array of arrays into a single array
 *
 * @param {array} arr Array to be flatten
 * @return {array} a copy of the array flattened into one array
 */
function flattenDeep(arr) {
  return arr.reduce(
    (acc, val) => (Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val)),
    []
  );
}

export { deepFreeze, flattenDeep };
