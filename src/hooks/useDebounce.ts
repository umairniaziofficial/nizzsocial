import { useEffect, useState } from "react";

// https://codesandbox.io/s/react-query--ted8o?file=/src/use.js
export default function use<T>(value: T, delay: number): T {
  // State and setters for d value
  const [dValue, setdValue] = useState<T>(value);

  useEffect(() => {
    // Update d value after delay
    const handler = setTimeout(() => {
      setdValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent d value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return dValue;
}
