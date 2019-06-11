import assign from 'object-assign';
import cloneDeep from 'lodash.clonedeep';

import { Coin, DependentCoin, DependentMultivariantCoin, MultivariantCoin } from './coin';
import Graph from './graph';
import { createSample, pickSample, shuffle } from './stat';
import { flattenDeep } from './utils';
import { DEPENDENT, DEPENDENT_MULTIVARIANT } from './coinTypes';
import applyCurrencyConverters from './applyCurrencyConverter';

function getCoin(coins, name) {
  for (let i = 0; i < coins.length; i += 1) {
    const coin = coins[i];

    if (coin.name === name) {
      return coin;
    }

    if (coin.isMultivariant()) {
      const variant = coin.getVariant(name);
      if (variant) return variant;
    }
  }

  return null;
}

function createNodeMap(coins) {
  const dependentCoin = coins.filter(coin => coin.isDependent());
  const nodeMap = dependentCoin.map(coin => {
    switch (coin.type) {
      case DEPENDENT:
        return {
          name: coin.name,
          children: coin.dependsOn.map(child => getCoin(coins, child.name)),
          details: {
            dependsOn: coin.dependsOn || [],
            metadata: coin.metadata || {},
            probability: coin.probability,
            type: coin.type
          }
        };
      case DEPENDENT_MULTIVARIANT:
        return coin.variants.map(variant => ({
          name: variant.name,
          children: variant.dependsOn
            ? variant.dependsOn.map(child => getCoin(coins, child.name))
            : [],
          details: {
            dependsOn: variant.dependsOn || [],
            metadata: coin.metadata || {},
            probability: variant.probability,
            type: coin.type
          }
        }));
      default:
        return null;
    }
  });

  return flattenDeep(nodeMap);
}

function createNodeGraph(coins) {
  const nodeMap = createNodeMap(coins);
  const nodeGraph = new Graph();

  nodeMap.forEach(node => {
    nodeGraph.addNode(node.name, node.details);
    node.children.forEach(child => {
      if (child) {
        nodeGraph.addNode(child.name);
        nodeGraph.addEdge(node.name, child.name);
      }
    });
  });

  return nodeGraph;
}

function createMultivariantMapping(coin) {
  return coin.variants.map(variant => ({
    count: variant.probability,
    value: variant.name
  }));
}

function createRegularMapping(coin) {
  return [{ count: coin.probability, value: coin.name }];
}

function flip(coins) {
  return coins.map(coin => {
    if (coin.isMultivariant()) {
      return pickSample(shuffle(createSample(createMultivariantMapping(coin), 100)));
    }

    return pickSample(shuffle(createSample(createRegularMapping(coin), 100)));
  });
}

function setPickingOrder(sample) {
  const order = cloneDeep(sample);

  order.sort((a, b) => {
    if (!a.isDependent() && b.isDependent()) {
      return -1;
    }

    if (a.isDependent() && !b.isDependent()) {
      return 1;
    }

    if (a.isDependent() && b.isDependent()) {
      if (a.getDependent(b.name)) return 1;
      if (b.getDependent(a.name)) return -1;
    }

    return 0;
  });

  return order;
}

function isDependentActive(sample, dependent) {
  const index = sample.indexOf(dependent.name);
  let isActive = index > -1;

  const activeDependent = dependent.dependsOn
    .filter(dep => sample.indexOf(dep.name) > -1 && dep.active)
    .reduce((a, b) => (a.priority < b.priority ? a : b), { priority: Infinity });

  const inactiveDependent = dependent.dependsOn
    .filter(dep => sample.indexOf(dep.name) === -1 && !dep.active)
    .reduce((a, b) => (a.priority < b.priority ? a : b), { priority: Infinity });

  const highestPriorityDependent = [activeDependent, inactiveDependent].reduce(
    (a, b) => (a.priority < b.priority ? a : b),
    { priority: Infinity }
  );

  if (highestPriorityDependent.priority !== Infinity) {
    isActive = highestPriorityDependent.behavior;
  }

  if (isActive && index <= -1) {
    sample.push(dependent.name);
  } else if (!isActive && index > -1) {
    sample[index] = false; // eslint-disable-line no-param-reassign
  }

  return isActive;
}

function mix(coins, converters) {
  const orderedCoins = setPickingOrder(coins);
  const sample = flip(orderedCoins);
  const finalMix = {};

  const coinIsActive = samp => coin => {
    if (coin.isMultivariant()) {
      return assign({}, coin, {
        variants: coin.variants.map(variant =>
          assign({}, variant, {
            active: variant.dependsOn
              ? isDependentActive(samp, variant)
              : samp.indexOf(variant.name) > -1,
            metadata: variant.metadata || coin.metadata,
            type: coin.type
          })
        )
      });
    }

    if (coin.isDependent()) {
      return assign({}, coin, { active: isDependentActive(samp, coin) });
    }

    return assign({}, coin, { active: samp.indexOf(coin.name) > -1 });
  };

  const convertedCoins = applyCurrencyConverters(orderedCoins, ...converters, coinIsActive(sample));

  for (let i = 0; i < convertedCoins.length; i += 1) {
    const coin = convertedCoins[i];

    if (coin.isMultivariant()) {
      coin.variants.forEach(variant => {
        finalMix[variant.name] = assign({}, variant);
      });
    } else {
      finalMix[coin.name] = assign({}, coin);
    }
  }

  return finalMix;
}

function Chest(testDefinitions) {
  const properties = {
    coins: testDefinitions.map(testDefinition => {
      switch (testDefinition.type) {
        case 'dependent':
          return DependentCoin(testDefinition);
        case 'dependentMultivariant':
          return DependentMultivariantCoin(testDefinition);
        case 'multivariant':
          return MultivariantCoin(testDefinition);
        case 'normal':
          return Coin(testDefinition);
        default:
          throw new Error(
            `The type on the test with the following test definition ${testDefinition} is invalid`
          );
      }
    })
  };

  const funcs = {
    createNodeGraph: () => createNodeGraph(properties.coins),
    flipCoins: () => flip(properties.coins),
    getCoin: name => getCoin(properties.coins, name),
    mixCoins: (...converters) => mix(properties.coins, converters)
  };

  const nodeGraph = createNodeGraph(properties.coins);
  const circularCheck = nodeGraph.isCircular();

  if (circularCheck.isCircular) {
    throw new Error(
      `The ${
        circularCheck.node
      } test has a dependency or is dependent on a test with a circular dependency in its configuration.`
    );
  }

  return assign({}, properties, funcs);
}

export default Chest;
