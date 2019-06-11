import Chest from './src/chest';
import Graph from './src/graph';
import {
  Coin as NormalCoin,
  DependentCoin,
  DependentMultivariantCoin,
  MultivariantCoin
} from './src/coin';

const Bandit = {
  Chest,
  Graph,
  NormalCoin,
  DependentCoin,
  DependentMultivariantCoin,
  MultivariantCoin
};

export default Bandit;
