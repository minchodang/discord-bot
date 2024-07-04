import { echo } from './echo';
import { handsUp } from './handsup';
import { joke } from './joke';
import { search } from './search';
import { createPoll } from './vote';

const availableCommands = [echo, search, joke, handsUp, createPoll];

export default availableCommands;
