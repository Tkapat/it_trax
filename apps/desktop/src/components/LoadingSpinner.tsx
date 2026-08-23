import { motion } from "framer-motion";

export function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div
        style={{
          width: size,
          height: size,
          border: '3px solid var(--border-color)',
          borderTop: '3px solid var(--accent-color)',
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
