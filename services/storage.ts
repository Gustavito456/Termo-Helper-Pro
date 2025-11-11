
import { StoredState } from '../types';

const STORAGE_KEY = 'termoHelperState';

export const saveState = (state: StoredState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error("Could not save state to localStorage", error);
  }
};

export const loadState = (): StoredState | undefined => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Could not load state from localStorage", error);
    return undefined;
  }
};