import { motion } from "framer-motion";

const SplashScreen = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        color: "white"
      }}
    >
      {/* 1. LOGO ANIMATION */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 style={{ fontSize: "4rem", margin: 0, fontWeight: "800", letterSpacing: "-2px" }}>
          FitTrack
        </h1>
      </motion.div>

      {/* 2. SUBTITLE ANIMATION */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{ fontSize: "1.2rem", marginTop: "10px", opacity: 0.9 }}
      >
        Your personal fitness AI
      </motion.p>

      {/* 3. LOADING BAR */}
      <div style={{ 
        width: "200px", 
        height: "6px", 
        background: "rgba(255,255,255,0.3)", 
        borderRadius: "10px", 
        marginTop: "40px", 
        overflow: "hidden" 
      }}>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          onAnimationComplete={onComplete} // Triggers when bar is full
          style={{ height: "100%", background: "white", borderRadius: "10px" }}
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;