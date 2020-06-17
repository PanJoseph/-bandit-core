import {
  Chest,
  Coin as NormalCoin,
  DependentCoin,
  // eslint-disable-next-line camelcase
  DependentMultivariantCoin as unstable_DependentMultivariantCoin,
  MultivariantCoin
} from './cjs/bandit';

const Bandit = {
  Chest,
  NormalCoin,
  DependentCoin,
  unstable_DependentMultivariantCoin,
  MultivariantCoin
};

export default Bandit;
