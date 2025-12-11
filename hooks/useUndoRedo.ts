import { useState, useCallback, useRef, useEffect } from 'react';

export function useUndoRedo<T>(initialState: T, delay: number = 800) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  // Ref to track if we are currently in a "typing session" (debouncing)
  const isTyping = useRef(false);
  // Holds the state at the beginning of the typing session
  const startStateRef = useRef<T>(initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep track of latest present for internal logic
  const presentRef = useRef<T>(initialState);
  useEffect(() => {
    presentRef.current = present;
  }, [present]);

  const undo = useCallback(() => {
    // If we are in the middle of a typing session, 'undo' reverts to the start of that session (discard draft)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      isTyping.current = false;
      setPresent(startStateRef.current);
      return;
    }

    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture(f => [present, ...f]);
    setPresent(previous);
    setPast(newPast);
    startStateRef.current = previous;
  }, [past, present]);

  const redo = useCallback(() => {
    // If we are typing, redo usually doesn't make sense unless we commit first, 
    // but typically redo is only valid if we are NOT typing (future is cleared on type).
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      isTyping.current = false;
    }

    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast(p => [...p, present]);
    setPresent(next);
    setFuture(newFuture);
    startStateRef.current = next;
  }, [future, present]);

  const setData = useCallback((value: T | ((prev: T) => T)) => {
    setPresent(prev => {
      const newState = typeof value === 'function' ? (value as Function)(prev) : value;

      if (!isTyping.current) {
        isTyping.current = true;
        // startStateRef.current holds the stable state before this new batch of changes
      }

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        // Commit the change to history
        setPast(p => [...p, startStateRef.current]);
        setFuture([]); 
        startStateRef.current = newState; // Update start state to the committed state
        isTyping.current = false;
        timerRef.current = null;
      }, delay);

      return newState;
    });
  }, [delay]);

  // Force a commit immediately (useful for big state changes like AI generation)
  const commitNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      setPast(p => [...p, startStateRef.current]);
      setFuture([]);
      startStateRef.current = presentRef.current;
      isTyping.current = false;
      timerRef.current = null;
    }
  }, []);

  return {
    data: present,
    setData,
    undo,
    redo,
    commitNow,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
}