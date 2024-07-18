import { echo } from './echo';
import { handsUp } from './handsup';
import { joke } from './joke';
import { notice } from './notice';
import { poll2 } from './pollTest';
import { search } from './search';
import { createPoll } from './vote';

const availableCommands = [
  echo,
  search,
  joke,
  handsUp,
  createPoll,
  poll2,
  notice,
];

export default availableCommands;
