export interface Playlist {
  name: string;
  songs: Array<{ title: string; url: string }>;
}

export const playlists: Record<string, Playlist[]> = {};
