import { MappingProfile, ControlBinding } from '../types';

export const FACTORY_DEFAULT_PROFILE: MappingProfile = {
  id: 'factory_default',
  name: 'Nexfoot 4-Rotary Dynamic Paging',
  description: 'SW 1~4 노브는 선택된 슬롯의 현재 페이지 파라미터 1~4를 자동 제어하고, 푸시는 슬롯 온오프를 제어합니다.',
  version: '0.0.2',
  bindings: [
    {
      id: 'bind_sw1_push',
      swId: 'sw1',
      type: 'push',
      targetType: 'slot_toggle',
      targetSlotId: 'pre_fx_1',
      midiChannel: 1,
      ccNumber: 21,
      mode: 'push_toggle',
      min: 0,
      max: 127,
      invert: false,
    },
    {
      id: 'bind_sw2_push',
      swId: 'sw2',
      type: 'push',
      targetType: 'slot_toggle',
      targetSlotId: 'pre_fx_2',
      midiChannel: 1,
      ccNumber: 22,
      mode: 'push_toggle',
      min: 0,
      max: 127,
      invert: false,
    },
    {
      id: 'bind_sw3_push',
      swId: 'sw3',
      type: 'push',
      targetType: 'slot_toggle',
      targetSlotId: 'post_fx_1',
      midiChannel: 1,
      ccNumber: 23,
      mode: 'push_toggle',
      min: 0,
      max: 127,
      invert: false,
    },
    {
      id: 'bind_sw4_push',
      swId: 'sw4',
      type: 'push',
      targetType: 'page_nav',
      midiChannel: 1,
      ccNumber: 24,
      mode: 'push_toggle',
      min: 0,
      max: 127,
      invert: false,
    },
    {
      id: 'bind_sw1_rot',
      swId: 'sw1',
      type: 'rotate',
      targetType: 'slot_param',
      targetParamIndex: 0,
      midiChannel: 1,
      ccNumber: 57,
      mode: 'relative',
      min: 0,
      max: 1,
      invert: false,
    },
    {
      id: 'bind_sw2_rot',
      swId: 'sw2',
      type: 'rotate',
      targetType: 'slot_param',
      targetParamIndex: 1,
      midiChannel: 1,
      ccNumber: 58,
      mode: 'relative',
      min: 0,
      max: 1,
      invert: false,
    },
    {
      id: 'bind_sw3_rot',
      swId: 'sw3',
      type: 'rotate',
      targetType: 'slot_param',
      targetParamIndex: 2,
      midiChannel: 1,
      ccNumber: 59,
      mode: 'relative',
      min: 0,
      max: 1,
      invert: false,
    },
    {
      id: 'bind_sw4_rot',
      swId: 'sw4',
      type: 'rotate',
      targetType: 'slot_param',
      targetParamIndex: 3,
      midiChannel: 1,
      ccNumber: 60,
      mode: 'relative',
      min: 0,
      max: 1,
      invert: false,
    },
  ],
};

const STORAGE_KEY_PROFILES = 'nado_cortex_profiles_v2';
const STORAGE_KEY_ACTIVE_ID = 'nado_cortex_active_profile_id_v2';

export class ProfileManager {
  private profiles: MappingProfile[] = [];
  private activeProfileId: string = FACTORY_DEFAULT_PROFILE.id;

  constructor() {
    this.loadFromStorage();
  }

  public getProfiles(): MappingProfile[] {
    return [...this.profiles];
  }

  public getActiveProfile(): MappingProfile {
    const found = this.profiles.find(p => p.id === this.activeProfileId);
    return found || this.profiles[0] || FACTORY_DEFAULT_PROFILE;
  }

  public setActiveProfile(profileId: string): MappingProfile {
    const found = this.profiles.find(p => p.id === profileId);
    if (found) {
      this.activeProfileId = profileId;
      this.saveToStorage();
      return found;
    }
    return this.getActiveProfile();
  }

  public createProfile(name: string, description: string = ''): MappingProfile {
    const newProfile: MappingProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || 'New Profile',
      description,
      version: '0.0.2',
      bindings: JSON.parse(JSON.stringify(FACTORY_DEFAULT_PROFILE.bindings)),
    };
    this.profiles.push(newProfile);
    this.activeProfileId = newProfile.id;
    this.saveToStorage();
    return newProfile;
  }

  public updateProfile(updated: MappingProfile): void {
    const index = this.profiles.findIndex(p => p.id === updated.id);
    if (index !== -1) {
      this.profiles[index] = { ...updated };
      this.saveToStorage();
    }
  }

  public updateBinding(profileId: string, binding: ControlBinding): void {
    const profile = this.profiles.find(p => p.id === profileId);
    if (!profile) return;
    const bIndex = profile.bindings.findIndex(b => b.id === binding.id || (b.swId === binding.swId && b.type === binding.type));
    if (bIndex !== -1) {
      profile.bindings[bIndex] = { ...binding };
    } else {
      profile.bindings.push(binding);
    }
    this.saveToStorage();
  }

  public deleteProfile(profileId: string): boolean {
    if (this.profiles.length <= 1) {
      return false; // Cannot delete last profile
    }
    this.profiles = this.profiles.filter(p => p.id !== profileId);
    if (this.activeProfileId === profileId) {
      this.activeProfileId = this.profiles[0].id;
    }
    this.saveToStorage();
    return true;
  }

  public exportProfileJson(profileId?: string): string {
    const profile = profileId 
      ? this.profiles.find(p => p.id === profileId) || this.getActiveProfile()
      : this.getActiveProfile();
    return JSON.stringify(profile, null, 2);
  }

  public importProfileJson(jsonString: string): { success: boolean; profile?: MappingProfile; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, error: '유효한 JSON 객체가 아닙니다.' };
      }
      if (!data.name || !Array.isArray(data.bindings)) {
        return { success: false, error: '프로필 필수 필드(name, bindings)가 누락되었습니다.' };
      }

      const imported: MappingProfile = {
        id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `${data.name} (Imported)`,
        description: data.description || '',
        version: '0.0.2',
        bindings: data.bindings,
      };

      this.profiles.push(imported);
      this.activeProfileId = imported.id;
      this.saveToStorage();
      return { success: true, profile: imported };
    } catch (e) {
      return { success: false, error: `JSON 파싱 실패: ${(e as Error).message}` };
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        this.profiles = [FACTORY_DEFAULT_PROFILE];
        this.activeProfileId = FACTORY_DEFAULT_PROFILE.id;
        return;
      }

      const stored = window.localStorage.getItem(STORAGE_KEY_PROFILES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.profiles = parsed;
        } else {
          this.profiles = [FACTORY_DEFAULT_PROFILE];
        }
      } else {
        this.profiles = [FACTORY_DEFAULT_PROFILE];
      }

      const activeId = window.localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (activeId && this.profiles.some(p => p.id === activeId)) {
        this.activeProfileId = activeId;
      } else {
        this.activeProfileId = this.profiles[0].id;
      }
    } catch (e) {
      console.warn('Failed to load profiles from localStorage:', e);
      this.profiles = [FACTORY_DEFAULT_PROFILE];
      this.activeProfileId = FACTORY_DEFAULT_PROFILE.id;
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(this.profiles));
      window.localStorage.setItem(STORAGE_KEY_ACTIVE_ID, this.activeProfileId);
    } catch (e) {
      console.warn('Failed to save profiles to localStorage:', e);
    }
  }
}

export const profileManager = new ProfileManager();
