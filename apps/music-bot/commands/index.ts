import { addSongToPlaylist } from './addSongToPlaylist';
import { createPlaylist } from './createPlaylist';
import { searchAndPlayMusic } from './playMusic';
import { playPlaylist } from './playPlaylist';
import { searchMusic } from './searchMusic';

const availableCommands = [
  searchMusic,
  searchAndPlayMusic,
  createPlaylist,
  addSongToPlaylist,
  playPlaylist,
];

export default availableCommands;
