import { describe, it, expect, beforeEach } from 'vitest';
import { ProfileManager, FACTORY_DEFAULT_PROFILE } from '../src/core/ProfileManager';

describe('ProfileManager (TASK-214)', () => {
  let pm: ProfileManager;

  beforeEach(() => {
    pm = new ProfileManager();
  });

  it('should load factory default profile initially', () => {
    const active = pm.getActiveProfile();
    expect(active.id).toBe(FACTORY_DEFAULT_PROFILE.id);
    expect(active.bindings.length).toBeGreaterThan(0);
  });

  it('should create and switch to new custom profile', () => {
    const created = pm.createProfile('My Live Rig', 'Settings for live gig');
    expect(created.name).toBe('My Live Rig');
    expect(pm.getActiveProfile().id).toBe(created.id);
    expect(pm.getProfiles().some((p) => p.id === created.id)).toBe(true);
  });

  it('should export profile to valid JSON', () => {
    const jsonStr = pm.exportProfileJson();
    const parsed = JSON.parse(jsonStr);
    expect(parsed.version).toBe('0.0.2');
    expect(Array.isArray(parsed.bindings)).toBe(true);
  });

  it('should import profile from valid JSON', () => {
    const customJson = JSON.stringify({
      name: 'External Setup',
      description: 'Imported from friend',
      version: '0.0.2',
      bindings: [
        {
          id: 'test_bind',
          swId: 'sw1',
          type: 'push',
          targetType: 'slot_toggle',
          midiChannel: 1,
          ccNumber: 80,
          mode: 'push_toggle',
          min: 0,
          max: 127,
          invert: false,
        },
      ],
    });

    const res = pm.importProfileJson(customJson);
    expect(res.success).toBe(true);
    expect(res.profile?.name).toContain('External Setup');
    expect(pm.getActiveProfile().id).toBe(res.profile?.id);
  });

  it('should reject invalid JSON during import', () => {
    const invalidJson = '{"foo": "bar"}';
    const res = pm.importProfileJson(invalidJson);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
