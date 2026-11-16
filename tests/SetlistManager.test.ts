import { describe, it, expect, beforeEach } from 'vitest';
import { SetlistManager, DEFAULT_SETLIST } from '../src/core/SetlistManager';

describe('SetlistManager (TASK-310)', () => {
  let sm: SetlistManager;

  beforeEach(() => {
    sm = new SetlistManager();
  });

  it('should get default song titles and custom titles', () => {
    const title0 = sm.getSongTitle(0);
    expect(title0).toContain('Plexi Lead Crunch');

    sm.setSongTitle(0, 'My Solo Lead');
    expect(sm.getSongTitle(0)).toBe('My Solo Lead');
  });

  it('should navigate setlist songs sequentially', () => {
    const firstSong = sm.getCurrentSong();
    expect(firstSong?.title).toBe(DEFAULT_SETLIST[0].title);

    const nextSong = sm.nextSong();
    expect(nextSong?.title).toBe(DEFAULT_SETLIST[1].title);
    expect(sm.getCurrentSetlistIndex()).toBe(1);

    const prevSong = sm.prevSong();
    expect(prevSong?.title).toBe(DEFAULT_SETLIST[0].title);
  });

  it('should add and remove songs from setlist', () => {
    const initialLen = sm.getSetlist().length;

    const added = sm.addSongToSetlist({
      title: 'Thunderstruck',
      artist: 'AC/DC',
      presetIndex: 5,
      bpm: 133,
    });

    expect(added.title).toBe('Thunderstruck');
    expect(sm.getSetlist().length).toBe(initialLen + 1);

    sm.removeSongFromSetlist(sm.getSetlist().length - 1);
    expect(sm.getSetlist().length).toBe(initialLen);
  });
});
