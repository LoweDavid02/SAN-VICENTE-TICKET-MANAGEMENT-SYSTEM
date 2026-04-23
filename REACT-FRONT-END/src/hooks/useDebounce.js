/**
 * useDebounce — delays updating a value until after a pause in changes.
 * Use for search inputs, filter inputs, and any value that triggers API calls.
 *
 * @param {*} value — the value to debounce
 * @param {number} delay — milliseconds to wait (default 300ms)
 * @returns debounced value
 */

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
