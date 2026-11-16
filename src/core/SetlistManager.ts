export interface SetlistSong {
  id: string;
  title: string;
  artist?: string;
  presetIndex: number; // 0 ~ 63
  bpm?: number;
  memo?: string;
}

const STORAGE_KEY_SETLIST = 'nado_cortex_setlist_v3';
const STORAGE_KEY_SONG_TITLES = 'nado_cortex_song_titles_v3';

export const DEFAULT_SONG_TITLES: Record<number, string> = {
  0: '01: Plexi Lead Crunch',
  1: '02: Hotel California (Intro Clean)',
  2: '03: Master of Puppets (Tight Rhythm)',
  3: '04: Sweet Child O Mine (Slash Lead)',
  4: '05: Comfortably Numb (Mod Delay Solo)',
  5: '06: Back In Black (Rock Rhythm)',
  6: '07: Hysteria (Fuzz Bass & Lead)',
  7: '08: Little Wing (Strat Clean Sparkle)',
};

export const DEFAULT_SETLIST: SetlistSong[] = [
  { id: 'song_1', title: 'Hotel California', artist: 'Eagles', presetIndex: 1, bpm: 75, memo: 'Intro 12-string clean' },
  { id: 'song_2', title: 'Sweet Child O Mine', artist: 'Guns N Roses', presetIndex: 3, bpm: 125, memo: 'Neck pickup lead' },
  { id: 'song_3', title: 'Master of Puppets', artist: 'Metallica', presetIndex: 2, bpm: 212, memo: 'Down-picking crunch' },
  { id: 'song_4', title: 'Comfortably Numb', artist: 'Pink Floyd', presetIndex: 4, bpm: 64, memo: 'Big Muff + Dual Delay' },
];

export class SetlistManager {
  private songTitles: Record<number, string> = { ...DEFAULT_SONG_TITLES };
  private setlist: SetlistSong[] = [...DEFAULT_SETLIST];
  private currentSetlistIndex: number = 0;

  constructor() {
    this.loadFromStorage();
  }

  public getSongTitle(presetIndex: number): string {
    return this.songTitles[presetIndex] || `Preset ${String(presetIndex + 1).padStart(2, '0')}`;
  }

  public setSongTitle(presetIndex: number, title: string): void {
    this.songTitles[presetIndex] = title;
    this.saveToStorage();
  }

  public getAllSongTitles(): Record<number, string> {
    return { ...this.songTitles };
  }

  public getSetlist(): SetlistSong[] {
    return [...this.setlist];
  }

  public getCurrentSetlistIndex(): number {
    return this.currentSetlistIndex;
  }

  public getCurrentSong(): SetlistSong | null {
    return this.setlist[this.currentSetlistIndex] || null;
  }

  public nextSong(): SetlistSong | null {
    if (this.setlist.length === 0) return null;
    this.currentSetlistIndex = (this.currentSetlistIndex + 1) % this.setlist.length;
    return this.getCurrentSong();
  }

  public prevSong(): SetlistSong | null {
    if (this.setlist.length === 0) return null;
    this.currentSetlistIndex = (this.currentSetlistIndex - 1 + this.setlist.length) % this.setlist.length;
    return this.getCurrentSong();
  }

  public selectSong(index: number): SetlistSong | null {
    if (index >= 0 && index < this.setlist.length) {
      this.currentSetlistIndex = index;
      return this.getCurrentSong();
    }
    return null;
  }

  public addSongToSetlist(song: Omit<SetlistSong, 'id'>): SetlistSong {
    const newSong: SetlistSong = {
      ...song,
      id: `song_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    this.setlist.push(newSong);
    this.saveToStorage();
    return newSong;
  }

  public removeSongFromSetlist(index: number): void {
    if (index >= 0 && index < this.setlist.length) {
      this.setlist.splice(index, 1);
      if (this.currentSetlistIndex >= this.setlist.length) {
        this.currentSetlistIndex = Math.max(0, this.setlist.length - 1);
      }
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;

      const storedTitles = window.localStorage.getItem(STORAGE_KEY_SONG_TITLES);
      if (storedTitles) {
        this.songTitles = { ...DEFAULT_SONG_TITLES, ...JSON.parse(storedTitles) };
      }

      const storedSetlist = window.localStorage.getItem(STORAGE_KEY_SETLIST);
      if (storedSetlist) {
        const parsed = JSON.parse(storedSetlist);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.setlist = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load setlist from storage:', e);
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(STORAGE_KEY_SONG_TITLES, JSON.stringify(this.songTitles));
      window.localStorage.setItem(STORAGE_KEY_SETLIST, JSON.stringify(this.setlist));
    } catch (e) {
      console.warn('Failed to save setlist to storage:', e);
    }
  }
}

export const setlistManager = new SetlistManager();
