import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BeeSwarm } from "./components/BeeSwarm";

const fonts = [
  "Playfair Display",
  "Unbounded",
  "Chakra Petch",
  "Cormorant Garamond",
  "Archivo Black",
  "Caveat",
  "Michroma",
  "Zilla Slab",
  "Syne",
  "Darker Grotesque",
];

// App

function App() {
  const [fontIndex, setFontIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFontIndex((prev) => (prev + 1) % fonts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center justify-center h-dvh w-screen bg-black overflow-hidden">
      <BeeSwarm />
      <div
        className="absolute z-10 text-7xl md:text-9xl overflow-y-clip"
        style={{
          lineHeight: "1.2",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={fontIndex}
            className="text-white block whitespace-nowrap"
            style={{
              fontFamily: `'${fonts[fontIndex]}', sans-serif`,
              lineHeight: "inherit",
            }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            beelet
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
