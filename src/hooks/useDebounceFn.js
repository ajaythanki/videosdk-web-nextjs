import { useRef, useMemo } from 'react';
import _ from 'lodash';

export function useDebounceFn(fn, wait) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const debounced = useMemo(() => _.debounce((...args) => fnRef.current(...args), wait), [wait]);
  return {
    run: debounced,
    cancel: debounced.cancel,
    flush: debounced.flush
  };
}

export function useThrottleFn(fn, wait) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const debounced = useMemo(() => _.throttle((...args) => fnRef.current(...args), wait), [wait]);
  return {
    run: debounced,
    cancel: debounced.cancel,
    flush: debounced.flush
  };
}
