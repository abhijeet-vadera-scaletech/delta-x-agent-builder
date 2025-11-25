import { motion } from "framer-motion";
import { ReactNode } from "react";
import Sidebar from "./SidebarModern";
import TopBar from "./TopBarModern";
import { GlassCard } from "./GlassCard";
import { AnimationType } from "./AnimatedIcon";
import { Icon } from "phosphor-react";

interface LayoutProps {
  children: ReactNode;
  headerIcon?: Icon;
  animationType?: AnimationType;
}

export default function Layout({
  children,
  headerIcon,
  animationType,
}: LayoutProps) {
  return (
    <div className="overflow-hidden">
      {/* Sidebar with Glass Effect */}
      <motion.div
        className="fixed left-0 top-0 h-screen w-72 p-4 z-40"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
          opacity: { duration: 0.3 },
        }}
      >
        <GlassCard hover={false} noPadding className="h-full overflow-hidden">
          <Sidebar />
        </GlassCard>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 relative">
        <div className="fixed top-0 left-0 w-full h-[150px] bg-gradient-to-b from-white to-transparent dark:from-gray-900 dark:to-transparent z-10"></div>
        {/* Top Bar with Glass Effect */}
        <motion.div
          className="sticky top-0 z-30 p-4 pb-0"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <GlassCard hover={false} noPadding className="h-full">
            <TopBar headerIcon={headerIcon} animationType={animationType} />
          </GlassCard>
        </motion.div>

        {/* Page Content with Card Container */}
        <motion.main
          className="p-4 lg:p-6 relative z-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Content Container */}
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </motion.main>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Gradient Orbs with Continuous Animation */}
        <motion.div
          className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl"
          initial={{ x: 0, y: 0 }}
          animate={{
            scale: [1, 1.1, 1, 0.9, 1],
            opacity: [0.7, 0.6, 0.7, 0.5, 0.7],
            x: [0, -400, -800, -400, 200, 400, 0],
            y: [0, 300, 600, 800, 600, 300, 0],
          }}
          transition={{
            duration: 25,
            delay: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl"
          initial={{ x: 0, y: 0 }}
          animate={{
            scale: [1, 1.2, 1.1, 1, 1.2],
            opacity: [0.6, 0.7, 0.5, 0.6, 0.6],
            x: [0, 500, 900, 700, 300, 100, 0],
            y: [0, -400, -700, -900, -600, -300, 0],
          }}
          transition={{
            duration: 30,
            delay: 0.7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-600/10 rounded-full blur-3xl"
          initial={{ x: 0, y: 0 }}
          animate={{
            scale: [1, 1.15, 1.05, 1, 1.15],
            opacity: [0.5, 0.6, 0.4, 0.5, 0.5],
            x: [0, -500, -700, 0, 700, 500, 0],
            y: [0, 400, 0, -400, 0, 400, 0],
            rotate: [0, 60, 120, 180, 240, 300, 360],
          }}
          transition={{
            duration: 35,
            delay: 0.9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
