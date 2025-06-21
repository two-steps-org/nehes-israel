import { useCallback, useEffect, useState } from 'react';
import { prefix } from '@/lib/utils';

const getFullKey = (key: string) => `${prefix}__${key}`;

export function useLocalStorage<T = any>(key: string, defaultValue?: T) {
  const fullKey = getFullKey(key);
  const [value, setValue] = useState<T>(() => {
    // Check if we're in the browser (not SSR)
    if (typeof window === 'undefined') {
      return defaultValue as T;
    }

    const item = localStorage.getItem(fullKey);

    if (item) {
      try {
        return JSON.parse(item);
      } catch (_error) {
        return item;
      }
    }

    return defaultValue as T;
  });

  useEffect(() => {
    // Only update localStorage when we're in the browser
    if (typeof window !== 'undefined') {
      localStorage.setItem(fullKey, JSON.stringify(value));
    }
  }, [fullKey, value]);

  const deleteValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(fullKey);
    }
  }, [fullKey]);

  return [value, setValue, deleteValue] as [T, React.Dispatch<React.SetStateAction<T>>, () => void];
}
