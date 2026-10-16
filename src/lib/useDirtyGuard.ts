/**
 * Thesis Snippet 4.1: Dirty-State Detection
 * Prevents accidental loss of assessment information when navigating away.
 */

import { useEffect } from 'react';

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useDirtyGuard<FormState>(
  currentState: FormState,
  savedState: FormState
) {
  const isDirty = !deepEqual(currentState, savedState);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return {
    isDirty,
    saveDisabled: !isDirty,
  };
}
