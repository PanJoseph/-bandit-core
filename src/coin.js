import assign from 'object-assign';
import {
  NORMAL,
  MULTIVARIANT,
  DEPENDENT,
  DEPENDENT_MULTIVARIANT,
  VARIANT,
  DEPENDENT_VARIANT
} from './coinTypes';

/**
 * isMultivariant returns true if a coin's type is one of the two multivariant types, false otherwise
 *
 * @param {Object} coin coin to check whether it is multivariant or not
 */
function isMultivariant(coin) {
  return coin.type === MULTIVARIANT || coin.type === DEPENDENT_MULTIVARIANT;
}

/**
 * isDependent returns true if a coin's type is one of the two dependent types, false otherwise
 *
 * @param {Object} coin coin to check whehther it is dependent or not
 */
function isDependent(coin) {
  return coin.type === DEPENDENT || coin.type === DEPENDENT_MULTIVARIANT;
}

/**
 * getVariant returns a coin's variant matching the name passed if the variant exists, null otherwise
 *
 * @param {Object} coin coin to check for variant matching name passed
 * @param {String} name name of variant to search for
 */
function getVariant(coin, name) {
  if (isMultivariant(coin)) {
    return coin.variants.find(v => v.name === name) || null;
  }

  return null;
}

/**
 * getDependent returns a coin's dependent coin config matching the name passed if the dependent exists, null otherwise
 *
 * @param {Object} coin coin to check for dependents matching name passed
 * @param {String} name name of dependent to search for
 */
function getDependent(coin, name) {
  if (isDependent(coin)) {
    if (isMultivariant(coin)) {
      for (let i = 0; i < coin.variants.length; i += 1) {
        const dependents = coin.variants[i].dependsOn;

        if (dependents) {
          const variant = dependents.find(dep => dep.name === name);

          if (variant) return variant;
        }
      }
    } else {
      return coin.dependsOn.find(dependent => dependent.name === name) || null;
    }
  }

  return null;
}

/**
 * createSamplingMapping maps a coin to a form where it can be used in a when creating a sample
 *
 * @param {Object} coin coin to create sampling mapping with
 * @example Normal(Dependent)Coin(name: 'coin1', probability: 10) => [{count: 10, value: 'coin1}]
 * @example MultivariantCoin(variants: [{name: 'variant1', probability: 10}, {name : 'variant2', probability: 20}]) => [{count: 10, value: 'variant1'}, {count: 20, value: 'variant2'}]
 */
function createSamplingMapping(coin) {
  if (isMultivariant(coin)) {
    return coin.variants.map(variant => ({
      count: variant.probability,
      value: variant.name
    }));
  }
  return [{ count: coin.probability, value: coin.name }];
}

/**
 * validateField takes a field and ensures that it is defined and also does an explicit check for probability
 * to be a valid value when it is the field being checked.
 *
 * @param {Any} fieldValue value of the field
 * @param {String} fieldName  name of field
 * @param {Object} testDefinition entire definition that was passed for this field
 */
function validateField(fieldValue, fieldName, testDefinition) {
  if (fieldValue === null || fieldValue === undefined) {
    throw new Error(
      `Required Field ${fieldName} was not a valid value (non-null) in ${JSON.stringify(
        testDefinition
      )}, instead value was ${fieldValue}`
    );
  }

  if (fieldName === 'probability' && (fieldValue < 0 || fieldValue > 100)) {
    throw new Error(
      `The probability of a coin/variant cannot be less than 0 or greater than 100 instead ${fieldValue} was found in the ${JSON.stringify(
        testDefinition
      )} definition`
    );
  }

  return fieldValue;
}

/**
 * Variant reprsents a test variant that is used in Multivariant coins
 *
 * @param {Object} definition the test definition that's used to define the variant
 */
export function Variant(definition) {
  const properties = {
    metadata: definition.metadata || {},
    name: validateField(definition.name, 'name', definition),
    probability: validateField(definition.probability, 'probability', definition),
    type: VARIANT
  };

  return assign({}, properties);
}

/**
 * DependentVariant represents a test variant that may be used in DependentMultivariantCoin
 *
 * @param {Object} definition the test definition that's used to define the variant
 */
export function DependentVariant(definition) {
  const properties = {
    dependsOn: definition.dependsOn || [],
    metadata: definition.metadata || {},
    name: validateField(definition.name, 'name', definition),
    probability: validateField(definition.probability, 'probability', definition),
    type: DEPENDENT_VARIANT
  };

  return assign({}, properties);
}

/**
 * Coin represents the simplest form of a test (A/Control test)
 *
 * @param {Object} definition the test definition that's used to define the test
 */
export function Coin(definition) {
  const properties = {
    metadata: definition.metadata || {},
    name: validateField(definition.name, 'name', definition),
    probability: validateField(definition.probability, 'probability', definition),
    type: NORMAL
  };

  const funcs = {
    getDependent: name => getDependent(properties, name),
    getVariant: name => getVariant(properties, name),
    isMultivariant: isMultivariant(properties),
    isDependent: isDependent(properties),
    createSamplingMapping: () => createSamplingMapping(properties)
  };

  return assign({}, properties, funcs);
}
/**
 * DependentCoin represents a test whose outcome can depend on another test's outcome
 *
 * @param {Object} definition the test definition that's used to define the test
 */
export function DependentCoin(definition) {
  const properties = {
    dependsOn: definition.dependsOn || [],
    metadata: definition.metadata || {},
    name: validateField(definition.name, 'name', definition),
    probability: validateField(definition.probability, 'probability', definition),
    type: DEPENDENT
  };

  const funcs = {
    getDependent: name => getDependent(properties, name),
    getVariant: name => getVariant(properties, name),
    isMultivariant: isMultivariant(properties),
    isDependent: isDependent(properties),
    createSamplingMapping: () => createSamplingMapping(properties)
  };

  return assign({}, properties, funcs);
}

/**
 * DependentMultivariantCoin represents a test that can have multiple variants (A/B/C/D/Control) and those variants can be dependent on other tests
 *
 * @param {Object} definition the test definition that's used to define the test
 */
export function DependentMultivariantCoin(definition) {
  const properties = {
    metadata: definition.metadata || {},
    name: validateField(definition.name, 'name', definition),
    type: DEPENDENT_MULTIVARIANT,
    variants: definition.variants.map(variant =>
      variant.dependsOn
        ? {
            dependsOn: variant.dependsOn,
            metadata: variant.metadata || {},
            name: validateField(variant.name, 'name', definition),
            probability: validateField(variant.probability, 'probability', definition),
            type: DEPENDENT_VARIANT
          }
        : {
            metadata: variant.metadata || {},
            name: validateField(variant.name, 'name', definition),
            probability: validateField(variant.probability, 'probability', definition),
            type: VARIANT
          }
    )
  };

  const funcs = {
    getDependent: name => getDependent(properties, name),
    getVariant: name => getVariant(properties, name),
    isMultivariant: isMultivariant(properties),
    isDependent: isDependent(properties),
    createSamplingMapping: () => createSamplingMapping(properties)
  };

  return assign({}, properties, funcs);
}

/**
 * MultivariantCoin represents a test that can have multiple variants (A/B/C/D/Control)
 *
 * @param {Object} definition the test definition that's used to define the test
 */
export function MultivariantCoin(definition) {
  const properties = {
    metadata: definition.metadata || {},
    name: validateField(definition.name, 'name', definition),
    type: MULTIVARIANT,
    variants: definition.variants.map(variant => ({
      metadata: variant.metadata || {},
      name: validateField(variant.name, 'name', definition),
      probability: validateField(variant.probability, 'probability', definition),
      type: VARIANT
    }))
  };

  const funcs = {
    getDependent: name => getDependent(properties, name),
    getVariant: name => getVariant(properties, name),
    isMultivariant: isMultivariant(properties),
    isDependent: isDependent(properties),
    createSamplingMapping: () => createSamplingMapping(properties)
  };

  return assign({}, properties, funcs);
}

export default {
  Coin,
  DependentCoin,
  DependentMultivariantCoin,
  MultivariantCoin,
  Variant,
  DependentVariant
};
