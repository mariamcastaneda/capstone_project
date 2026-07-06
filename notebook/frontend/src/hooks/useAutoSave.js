import { useCallback, useEffect, useRef } from 'react';

/**
 * Debounced auto-save hook.
 * @param {Function} saveFn  - async function to call when dirty
 * @param {number}   delay   - debounce delay in ms (default 3000)
 * @returns {{ markDirty: Function, saveStatus: string }}
 */
export default function useAutoSave(saveFn, delay = 3000) {
  const timerRef  = useRef(null);
  const statusRef = useRef('idle');
  const dirtyRef  = useRef(false);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (!dirtyRef.current) return;
      statusRef.current = 'saving';
      try {
        await saveFn();
        statusRef.current = 'saved';
        dirtyRef.current  = false;
      } catch {
        statusRef.current = 'error';
      }
    }, delay);
  }, [saveFn, delay]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { markDirty, get saveStatus() { return statusRef.current; } };
}
