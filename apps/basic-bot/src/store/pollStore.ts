import { Vote } from '../commands/vote';

export interface Poll {
  pollId: string;
  question: string;
  options: string[];
  votes: Vote[];
  isActive: boolean;
}

export const polls: Poll[] = [];

export function addPoll(poll: Poll) {
  polls.push(poll);
}

export function findPoll(pollId: string) {
  return polls.find((p) => p.pollId === pollId);
}
