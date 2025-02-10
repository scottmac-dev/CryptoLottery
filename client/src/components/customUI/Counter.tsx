
import { useEffect, useState } from "react";
import { motion } from "motion/react"

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
}

export const Counter = ({ from = 0, to, duration = 2 }: CounterProps) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start = from;
    const increment = (to - from) / (duration * 60); // Assuming 60fps
    const interval = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(interval);
      } else {
        setCount(Math.round(start));
      }
    }, 1000 / 60);
    
    return () => clearInterval(interval);
  }, [from, to, duration]);

  return (
    <motion.span
      className="text-3xl font-bold text-primary"
      animate={{ opacity: [0, 1] }}
      transition={{ duration: 0.5 }}
    >
      {count}
    </motion.span>
  );
};
