import React from "react";
import { motion } from "framer-motion";

const BackgroundGlow = () => {
  return (
    <>
      {/* Lime Glow */}
      <motion.div
        className="absolute -top-32 -left-20 w-96 h-96 bg-lime-400/20 blur-[120px] rounded-full"
        animate={{ y: [0, 40, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Blue Glow */}
      <motion.div
        className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-blue-400/20 blur-[140px] rounded-full"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Purple Glow */}
      <motion.div
        className="absolute bottom-0 left-1/4 w-[32rem] h-[32rem] bg-purple-500/20 blur-[160px] rounded-full"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
};

export default BackgroundGlow;
