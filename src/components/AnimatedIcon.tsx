import { motion } from "framer-motion";
import { ReactNode } from "react";

export type AnimationType =
  | "shake"
  | "rotate"
  | "flip"
  | "fly"
  | "pulse"
  | "wobble";

interface AnimatedIconProps {
  icon: ReactNode;
  size?: number;
  animationType?: AnimationType;
}

const animationVariants = {
  shake: {
    animate: {
      scale: [1, 1.5, 1],
      x: [-5, 5, -5, 5, -5, 5, 0],
      y: [-5, 5, -5, 5, -5, 5, 0],
    },
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: "easeInOut",
      x: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 3,
      },
      y: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 3,
      },
    },
  },
  rotate: {
    animate: {
      rotate: 360,
    },
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  },
  flip: {
    animate: {
      rotateY: [0, 180, 360],
      scale: [1, 1.1, 1],
    },
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  fly: {
    animate: {
      y: [-20, 20, -20],
      x: [0, 30, 0],
      rotate: [0, 5, -5, 0],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  pulse: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.8, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  wobble: {
    animate: {
      scale: [1, 1.2, 1],
      y: [-20, 20, -20],
      x: [0, 30, 0],
      rotate: [0, 5, -5, 0],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function AnimatedIcon({
  icon,
  size = 128,
  animationType = "shake",
}: AnimatedIconProps) {
  const animation = animationVariants[animationType];

  return (
    <motion.div
      animate={animation.animate}
      transition={animation.transition}
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {icon}
    </motion.div>
  );
}
