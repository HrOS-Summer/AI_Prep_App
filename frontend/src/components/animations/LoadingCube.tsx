import { motion } from "framer-motion";

const LoadingCube = () => {
  // Define a consistent size for the loader container
  const loaderSize = 64; // 64px, you can adjust this

  // The specific blue brand color
  const BRAND_BLUE = "#6366f1"; 

  return (
    <div 
      className="flex items-center justify-center relative overflow-hidden" 
      style={{ 
        width: `${loaderSize}px`, 
        height: `${loaderSize}px`,
        // Essential for proper centered 3D spin perception
        perspective: "1000px" 
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full"
      >
        {/*
          Outer Round Corners (Square Markers)
          All colors set to BRAND_BLUE
          Action: Enlarge and Squeeze (Scale)
        */}
        <motion.path 
          d="M2 9V7C2 4.23858 4.23858 2 7 2H9" 
          stroke={BRAND_BLUE}
          strokeWidth="2" 
          strokeLinecap="round"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ originX: "2px", originY: "9px" }}
        />
        <motion.path 
          d="M15 2H17C19.7614 2 22 4.23858 22 7V9" 
          stroke={BRAND_BLUE}
          strokeWidth="2" 
          strokeLinecap="round"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2 // subtle staggered effect
          }}
          style={{ originX: "22px", originY: "2px" }}
        />
        <motion.path 
          d="M22 15V17C22 19.7614 19.7614 22 17 22H15" 
          stroke={BRAND_BLUE}
          strokeWidth="2" 
          strokeLinecap="round"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4
          }}
          style={{ originX: "22px", originY: "22px" }}
        />
        <motion.path 
          d="M9 22H7C4.23858 22 2 19.7614 2 17V15" 
          stroke={BRAND_BLUE}
          strokeWidth="2" 
          strokeLinecap="round"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6
          }}
          style={{ originX: "2px", originY: "22px" }}
        />

        {/* Inner 3D Cube
          All colors set to BRAND_BLUE
          Action: Central 3D Spin (RotateY)
        */}
        <motion.g
          initial={{ rotateY: 0 }}
          animate={{
            // Smooth constant rotation for a precise spin
            rotateY: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ 
            originX: "12px", // Dead center of viewBox
            originY: "12px", // Dead center of viewBox
            transformStyle: "preserve-3d", // Required for 3D rotation within group
            display: "inline-block" // Essential for origin clamping
          }}
        >
          {/* Front Face */}
          <path d="M12 6.5L16.5 9V14L12 16.5L7.5 14V9L12 6.5Z" stroke={BRAND_BLUE} strokeWidth="1.5" strokeLinejoin="round"/>
          {/* Top Face lines */}
          <path d="M7.5 9L12 11.5L16.5 9" stroke={BRAND_BLUE} strokeWidth="1.5" strokeLinejoin="round"/>
          {/* Vertical line from top vertex */}
          <path d="M12 11.5V16.5" stroke={BRAND_BLUE} strokeWidth="1.5" strokeLinejoin="round"/>
        </motion.g>
      </svg>
    </div>
  );
};

export default LoadingCube;