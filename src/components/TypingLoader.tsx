import { motion } from "framer-motion";

interface TypingLoaderProps {
  dotColor?: string;
  size?: number;
}

export default function TypingLoader({
  dotColor = "#ffffff",
  size = 6,
}: TypingLoaderProps) {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex items-center gap-1"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          style={{
            width: size,
            height: size,
            backgroundColor: dotColor,
            borderRadius: "50%",
          }}
        />
      ))}
    </motion.div>
  );
}
