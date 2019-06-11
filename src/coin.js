import assign from 'object-assign';

import { deepFreeze } from './utils';
import {
  NORMAL,
  MULTIVARIANT,
  DEPENDENT,
  DEPENDENT_MULTIVARIANT,
  VARIANT,
  DEPENDENT_VARIANT
} from './coinTypes';

function isMultivariant(coin) {
  return coin.type === MULTIVARIANT || coin.type === DEPENDENT_MULTIVARIANT;
}

function isDependent(coin) {
  return coin.type === DEPENDENT || coin.type === DEPENDENT_MULTIVARIANT;
}

function getVariant(coin, name) {
  return coin.variants.find(variant => variant.name === name) || null;
}

function getDependent(coin, name) {
  if (isMultivariant(coin)) {
    for (let i = 0; i < coin.variants.length; i += 1) {
      const dependents = coin.variants[i].dependsOn;

      if (dependents) {
        const variant = dependents.find(match => match.name === name);

        if (variant) return variant;
      }
    }
  } else {
    return coin.dependsOn.find(dependent => dependent.name === name) || null;
  }

  return null;
}

export function Variant(definition) {
  const properties = {
    metadata: definition.metadata,
    name: definition.name,
    probability: definition.probability,
    type: VARIANT
  };

  return assign({}, properties);
}

export function DependentVariant(definition) {
  const properties = {
    dependsOn: definition.dependsOn,
    metadata: definition.metadata,
    name: definition.name,
    probability: definition.probability,
    type: DEPENDENT_VARIANT
  };

  return assign({}, properties);
}

export function Coin(definition) {
  const properties = {
    metadata: definition.metadata || {},
    name: definition.name,
    probability: definition.probability,
    type: NORMAL
  };

  const funcs = {
    isMultivariant: () => isMultivariant(properties),
    isDependent: () => isDependent(properties)
  };

  const exclusions = ['metadata'];

  return deepFreeze(assign({}, properties, funcs), exclusions);
}

export function DependentCoin(definition) {
  const properties = {
    dependsOn: definition.dependsOn || [],
    metadata: definition.metadata || {},
    name: definition.name,
    probability: definition.probability,
    type: DEPENDENT
  };

  const funcs = {
    getDependent: name => getDependent(properties, name),
    isMultivariant: () => isMultivariant(properties),
    isDependent: () => isDependent(properties)
  };

  const exclusions = ['metadata'];

  return deepFreeze(assign({}, properties, funcs), exclusions);
}

export function DependentMultivariantCoin(definition) {
  const properties = {
    metadata: definition.metadata || {},
    type: DEPENDENT_MULTIVARIANT,
    variants: definition.variants.map(variant =>
      variant.dependsOn
        ? {
            dependsOn: variant.dependsOn,
            metadata: variant.metadata || {},
            name: variant.name,
            probability: variant.probability,
            type: DEPENDENT_VARIANT
          }
        : {
            metadata: variant.metadata || {},
            name: variant.name,
            probability: variant.probability,
            type: VARIANT
          }
    )
  };

  const funcs = {
    getDependent: name => getDependent(properties, name),
    getVariant: name => getVariant(properties, name),
    isMultivariant: () => isMultivariant(properties),
    isDependent: () => isDependent(properties)
  };

  const exclusions = ['metadata'];

  return deepFreeze(assign({}, properties, funcs), exclusions);
}

export function MultivariantCoin(definition) {
  const properties = {
    metadata: definition.metadata || {},
    type: MULTIVARIANT,
    variants: definition.variants.map(variant => ({
      metadata: variant.metadata || {},
      name: variant.name,
      probability: variant.probability,
      type: VARIANT
    }))
  };

  const funcs = {
    getVariant: name => getVariant(properties, name),
    isMultivariant: () => isMultivariant(properties),
    isDependent: () => isDependent(properties)
  };

  const exclusions = ['metadata'];

  return deepFreeze(assign({}, properties, funcs), exclusions);
}

export default { Coin, DependentCoin, DependentMultivariantCoin, MultivariantCoin };
