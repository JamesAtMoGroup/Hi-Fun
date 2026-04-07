import { create } from 'zustand';
import type { DatingFilters, Gender, DatingRole } from '@fomo/shared/src/types';

interface DatingFilterState {
  filters: DatingFilters;
  setGenders: (genders: Gender[]) => void;
  setRoles: (roles: DatingRole[]) => void;
  setAgeRange: (min: number, max: number) => void;
  setMaxDistance: (km: number) => void;
  reset: () => void;
}

const DEFAULT_FILTERS: DatingFilters = {
  genders: [],
  roles: [],
  ageRange: { min: 18, max: 99 },
  maxDistance: 25,
};

export const useDatingFilterStore = create<DatingFilterState>((set) => ({
  filters: { ...DEFAULT_FILTERS },

  setGenders: (genders: Gender[]) =>
    set((state) => ({
      filters: { ...state.filters, genders },
    })),

  setRoles: (roles: DatingRole[]) =>
    set((state) => ({
      filters: { ...state.filters, roles },
    })),

  setAgeRange: (min: number, max: number) =>
    set((state) => ({
      filters: { ...state.filters, ageRange: { min, max } },
    })),

  setMaxDistance: (km: number) =>
    set((state) => ({
      filters: { ...state.filters, maxDistance: km },
    })),

  reset: () =>
    set({ filters: { ...DEFAULT_FILTERS } }),
}));
