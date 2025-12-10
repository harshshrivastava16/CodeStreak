import React, { useEffect, useState } from "react";

const symbols = ["</>", "{}", "()", "[]", "<>", "≠", "&&", "||", "::", "=>"];

const Loader = () => {
  const [matrix, setMatrix] = useState([]);

  useEffect(() => {
    const rows = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => symbols[Math.floor(Math.random() * symbols.length)])
    );
    setMatrix(rows);

    const interval = setInterval(() => {
      setMatrix((prev) =>
        prev.map((row) =>
          row.map(() => symbols[Math.floor(Math.random() * symbols.length)])
        )
      );
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050506] text-white relative overflow-hidden">

      {/* BACKLIGHT GLOWS */}
      <div className="absolute inset-0 -z-10 blur-[160px] opacity-40 bg-gradient-to-br from-lime-400/20 via-blue-400/20 to-purple-500/20"></div>

      {/* FALLING SYMBOLS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {matrix.map((row, i) => (
          <div
            key={i}
            className="absolute left-0 w-full text-center"
            style={{
              top: `${i * 5}vh`,
              animation: `fall 6s linear ${i * 0.25}s infinite`,
              opacity: 0.5,
            }}
          >
            {row.map((sym, j) => (
              <span
                key={j}
                className="mx-2 text-[18px] text-lime-300/60 drop-shadow-[0_0_6px_rgba(100,255,200,0.5)]"
              >
                {sym}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* HOLOGRAM CONTAINER */}
      <div
        className="
          relative w-48 h-48 flex items-center justify-center
          rounded-3xl bg-white/5 backdrop-blur-xl
          border border-white/10 shadow-[0_0_80px_rgba(80,130,255,0.3)]
          animate-holoFloat
        "
      >
        {/* GLOW CORE */}
        <div className="absolute inset-0 blur-2xl bg-gradient-to-br from-lime-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl"></div>

        {/* HOLOGRAM "CS" */}
        <span
          className="
            text-6xl font-extrabold tracking-wider
            bg-gradient-to-r from-lime-300 via-cyan-300 to-purple-300
            bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(120,200,255,0.4)]
            animate-holoPulse
          "
        >
          CS
        </span>
      </div>

      {/* LOADING TEXT */}
      <p className="absolute bottom-20 text-zinc-400 tracking-widest animate-pulse text-lg">
        Initializing the Matrix…
      </p>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10%); }
          100% { transform: translateY(120%); }
        }

        @keyframes holoPulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        @keyframes holoFloat {
          0% { transform: rotateX(0deg) rotateY(-3deg); }
          50% { transform: rotateX(0deg) rotateY(3deg); }
          100% { transform: rotateX(0deg) rotateY(-3deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
