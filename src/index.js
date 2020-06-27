import Chest from './chest';
import {
  Coin as NormalCoin,
  DependentCoin,
  // eslint-disable-next-line camelcase
  DependentMultivariantCoin as unstable_DependentMultivariantCoin,
  MultivariantCoin
} from './coin';

const Bandit = {
  Chest,
  NormalCoin,
  DependentCoin,
  unstable_DependentMultivariantCoin,
  MultivariantCoin
};

export default Bandit;
