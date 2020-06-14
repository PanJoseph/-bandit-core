import Chest from './src/chest';
import {
  Coin as NormalCoin,
  DependentCoin,
  DependentMultivariantCoin,
  MultivariantCoin
} from './src/coin';

const Bandit = {
  Chest,
  NormalCoin,
  DependentCoin,
  DependentMultivariantCoin,
  MultivariantCoin
};

export default Bandit;
