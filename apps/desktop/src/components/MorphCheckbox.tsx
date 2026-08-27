import { motion } from "framer-motion";
import { Motion } from "@trax/core";

interface MorphCheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: number;
  disabled?: boolean;
}

/**
 * Design-system checkbox: circle outline → accent fill with check draw-in.
 * Spring easing only.
 */
export function MorphCheckbox({ checked, onChange, size = 22, disabled }: MorphCheckboxProps) {
  const r = size / 2 - 2;

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.85 }}
      transition={Motion.spring}
      style={{
        width: size,
        height: size,
        padding: 0,
        background: "transparent",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
      aria-checked={checked}
      role="checkbox"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* track outline */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill={checked ? "var(--accent-color)" : "transparent"}
          stroke={checked ? "var(--accent-color)" : "var(--border-color)"}
          strokeWidth={1.5}
          animate={{ fill: checked ? "var(--accent-color)" : "transparent" }}
          transition={Motion.spring}
        />
        {/* check draw-in */}
        <motion.path
          d={`M ${size * 0.28} ${size * 0.52} L ${size * 0.45} ${size * 0.68} L ${size * 0.74} ${size * 0.34}`}
          fill="transparent"
          stroke="#000000"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            pathLength: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{ ...Motion.spring, stiffness: 500, damping: 35 }}
        />
      </svg>
    </motion.button>
  );
}