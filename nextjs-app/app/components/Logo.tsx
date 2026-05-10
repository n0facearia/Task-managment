"use client";

import { motion, useAnimation } from "framer-motion";

export default function Logo() {
  const tickControls = useAnimation();

  return (
    <motion.div
      className="splash-logo"
      style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      whileHover={{ scale: 1.1 }}
      onHoverStart={() => tickControls.start({ pathLength: 1, opacity: 1 })}
      onHoverEnd={() => tickControls.start({ pathLength: 0, opacity: 0 })}
      transition={{ type: "spring", stiffness: 400, damping: 20, duration: 0.3 }}
    >
      <motion.svg
        viewBox="0 0 28 28"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <motion.path
          d="M7 14 L11 18 L21 8"
          fill="none"
          stroke="black"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={tickControls}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}
