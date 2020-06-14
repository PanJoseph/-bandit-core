import assign from 'object-assign';

import { Coin, DependentCoin, DependentMultivariantCoin, MultivariantCoin } from './coin';
import Graph from './graph';
import { createSample, pickSample, shuffle } from './stat';
import { flattenDeep } from './utils';
import { DEPENDENT, DEPENDENT_MULTIVARIANT } from './coinTypes';
import applyCurrencyConverters from './applyCurrencyConverter';

/**
 * getCoin searches a list of coins for a coin by and returns that coin if found or null otherwise
 *
 * @param {Array} coins list to search for coin
 * @param {String} name name of coin to search coins for
 */
function getCoin(coins, name) {
  for (let i = 0; i < coins.length; i += 1) {
    const coin = coins[i];

    if (coin.name === name) {
      return coin;
    }

    if (coin.isMultivariant) {
      const variant = coin.getVariant(name);
      if (variant) return variant;
    }
  }

  return null;
}

/**
 * createNodeMapping taken an array of coins and creates a node mapping that can be transformed into a node graph
 *
 * @param {Array} coins coins to transform into a node mapping
 */
function createNodeMapping(coins) {
  const nodeMap = [];
  coins.forEach(coin => {
    switch (coin.type) {
      case DEPENDENT:
        nodeMap.push({
          name: coin.name,
          children: coin.dependsOn.map(child => getCoin(coins, child.name)),
          details: {
            dependsOn: coin.dependsOn || [],
            metadata: coin.metadata || {},
            probability: coin.probability,
            type: coin.type
          }
        });
        break;
      case DEPENDENT_MULTIVARIANT:
        nodeMap.push(
          coin.variants.map(variant => ({
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
          }))
        );
        break;
      default:
        break;
    }
  });

  return flattenDeep(nodeMap);
}

/**
 * createNodeGraph takes a list of coins and creates a graph where vertices are dependent
 * coins and edges point to coins vertex is dependent on
 *
 * @param {Array} coins coins list to create dependent node mapping with
 */
function createNodeGraph(coins) {
  const nodeGraph = new Graph();

  createNodeMapping(coins).forEach(node => {
    nodeGraph.addNode(node.name, node.details);
    node.children.forEach(child => {
      nodeGraph.addNode(child.name);
      nodeGraph.addEdge(node.name, child.name);
    });
  });

  return nodeGraph;
}

/**
 * flip takes a chest of coins and "flips" them to set their value whether the test the coin represents is on or off
 *
 * @param {Array} coins list of coins to flip and select values for
 */
function flip(coins) {
  return coins.map(coin => pickSample(shuffle(createSample(coin.createMapping(), 100))));
}

/**
 * setPickingOrder sorts a list of coins into an order at which they can be flipped in a single pass
 * This sort orders the coins in such a way that coins will always be flipped before an coins that are dependent on them
 *
 * @param {Array} coins list of coins to sort
 */
function setPickingOrder(coins) {
  return [...coins].sort((a, b) => {
    if (!a.isDependent && b.isDependent) {
      return -1;
    }

    if (a.isDependent && !b.isDependent) {
      return 1;
    }

    if (a.isDependent && b.isDependent) {
      if (a.getDependent(b.name)) return 1;
      if (b.getDependent(a.name)) return -1;
    }

    return 0;
  });
}

/**
 * isDependentActive determines whether or not a dependent coin should be active in a sample of flipped coins
 *
 * @param {Array} sample random sample to use for check whether dependent coin needs to be active in
 * @param {Object} dependent dependent coin to check if the test it represents is active or not
 */
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

/**
 * mix takes a chest of coins and does the work to set all the coins in the chest to active or inactive
 * mix will flip all the coins, handle any forced dependencies & apply any currency converters passed
 *
 * @param {Array} coins chest of coins to mix
 * @param {Array} converters currency converters to apply to each coin once they have been sampled and flipped, the converters should be ordered from last to first applied
 */
function mix(coins, converters) {
  const orderedCoins = setPickingOrder(coins);
  const sample = flip(orderedCoins);
  const finalMix = {};

  const coinIsActive = samp => coin => {
    if (coin.isMultivariant) {
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

    if (coin.isDependent) {
      return assign({}, coin, { active: isDependentActive(samp, coin) });
    }

    return assign({}, coin, { active: samp.indexOf(coin.name) > -1 });
  };

  const convertedCoins = applyCurrencyConverters(orderedCoins, ...converters, coinIsActive(sample));

  convertedCoins.forEach(coin => {
    if (coin.isMultivariant) {
      coin.variants.forEach(variant => {
        finalMix[variant.name] = assign({}, variant);
      });
    } else {
      finalMix[coin.name] = assign({}, coin);
    }
  });

  return finalMix;
}

function checkChestNamespace(coin, testDefinition, namespace) {
  if (coin.isMultivariant) {
    coin.variants.forEach(variant => {
      if (namespace[variant.name] === true) {
        throw new Error(
          `The name ${variant.name} on the test with the following test definition ${JSON.stringify(
            testDefinition
          )} is already in use`
        );
      }
      // eslint-disable-next-line no-param-reassign
      namespace[variant.name] = true;
    });
  } else {
    if (namespace[coin.name] === true) {
      throw new Error(
        `The name ${coin.name} on the test with the following test definition ${JSON.stringify(
          testDefinition
        )} is already in use`
      );
    }
    // eslint-disable-next-line no-param-reassign
    namespace[coin.name] = true;
  }
}

/**
 * Chests represent a set of tests in coin form
 * @param {Array} testDefinitions list of test definitions to transform into coins that will fill this chest
 */
function Chest(testDefinitions) {
  const chestNamespace = {};
  const properties = {
    coins: testDefinitions.map(testDefinition => {
      let coin;
      switch (testDefinition.type) {
        case 'dependent':
          coin = DependentCoin(testDefinition);
          break;
        case 'dependentMultivariant':
          coin = DependentMultivariantCoin(testDefinition);
          break;
        case 'multivariant':
          coin = MultivariantCoin(testDefinition);
          break;
        case 'normal':
          coin = Coin(testDefinition);
          break;
        default:
          throw new Error(
            `The type on the test with the following test definition ${JSON.stringify(
              testDefinition
            )} is invalid`
          );
      }
      checkChestNamespace(coin, testDefinition, chestNamespace);
      return coin;
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
      `The ${circularCheck.node} test has a dependency or is dependent on a test with a circular dependency in its configuration.`
    );
  }

  return assign({}, properties, funcs);
}

export default Chest;
