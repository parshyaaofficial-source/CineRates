import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function StarInput({
  value = 0,
  max = 10,
  onChange,
  size = 28,
}: {
  value?: number;
  max?: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const stars = Math.ceil(max / 2);

  const handleRate = (starIndex: number, isHalf: boolean) => {
    const rating = isHalf ? starIndex * 2 - 1 : starIndex * 2;
    onChange?.(rating);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 600);
  };

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {Array.from({ length: stars }, (_, i) => {
        const starNum = i + 1;
        const isFull = (hover || value) >= starNum * 2;
        const isHalf = !isFull && (hover || value) >= starNum * 2 - 1;
        return (
          <div key={i} className="relative cursor-pointer" style={{ width: size, height: size }}>
            <Star
              className="absolute inset-0 text-white/15"
              style={{ width: size, height: size }}
              strokeWidth={1.5}
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: isHalf ? size / 2 : isFull ? size : 0 }}
              onMouseEnter={() => setHover(starNum * 2)}
              onClick={(e) => {
                e.stopPropagation();
                handleRate(starNum, isHalf);
              }}
            >
              <motion.div
                animate={submitted && isFull ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Star
                  className="text-gold fill-gold"
                  style={{ width: size, height: size }}
                  strokeWidth={1.5}
                />
              </motion.div>
            </div>
            <div
              className="absolute inset-0"
              style={{ width: size / 2, left: 0 }}
              onMouseEnter={() => setHover(starNum * 2 - 1)}
              onClick={() => handleRate(starNum, true)}
            />
            <div
              className="absolute inset-0"
              style={{ left: size / 2, width: size / 2 }}
              onMouseEnter={() => setHover(starNum * 2)}
              onClick={() => handleRate(starNum, false)}
            />
          </div>
        );
      })}
      <span className="ml-2 text-sm font-medium text-white/60 tabular-nums">
        {hover || value || 0}/{max}
      </span>
      {submitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="ml-1 text-xs font-semibold text-gold"
        >
          Rated!
        </motion.div>
      )}
    </div>
  );
}
