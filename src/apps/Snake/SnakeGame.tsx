import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

// Color scheme that changes every 100 points - interpolate between colors
const COLOR_SCHEMES = [
  { bg: "#0a0a0f", snake: "#00ff00", food: "#ff3333", name: "Green/Red" },      // 0-99
  { bg: "#0f0a0a", snake: "#00ffff", food: "#ffaa00", name: "Cyan/Orange" },    // 100-199
  { bg: "#0a0f0a", snake: "#ff00ff", food: "#00ffff", name: "Magenta/Cyan" },   // 200-299
  { bg: "#0f0f0a", snake: "#ffff00", food: "#ff0000", name: "Yellow/Red" },     // 300-399
  { bg: "#0a0a0f", snake: "#00ccff", food: "#ff6600", name: "Light Blue/Orange" } // 400+
];

// Interpolate between two hex colors
const interpolateColor = (color1: string, color2: string, t: number): string => {
  const hex2rgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };
  
  const rgb2hex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };
  
  const [r1, g1, b1] = hex2rgb(color1);
  const [r2, g2, b2] = hex2rgb(color2);
  
  return rgb2hex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
};

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }    
  ]);

  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>("UP");
  const [nextDirection, setNextDirection] = useState<Direction>("UP");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentColors, setCurrentColors] = useState(COLOR_SCHEMES[0]);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Update colors smoothly based on score
  useEffect(() => {
    const schemeIndex = Math.floor(score / 100) % COLOR_SCHEMES.length;
    const nextSchemeIndex = (schemeIndex + 1) % COLOR_SCHEMES.length;
    const scoreInScheme = score % 100;
    const transitionProgress = scoreInScheme / 100;
    
    const currentScheme = COLOR_SCHEMES[schemeIndex];
    const nextScheme = COLOR_SCHEMES[nextSchemeIndex];
    
    setCurrentColors({
      bg: interpolateColor(currentScheme.bg, nextScheme.bg, transitionProgress),
      snake: interpolateColor(currentScheme.snake, nextScheme.snake, transitionProgress),
      food: interpolateColor(currentScheme.food, nextScheme.food, transitionProgress),
      name: currentScheme.name
    });
  }, [score]);

  // Generate random food position
  const generateFood = (): Position => {
    return {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT)
    };
  };

  // Play sound effect
  const playSound = (frequency: number, duration: number) => {
    if (!soundEnabled) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  };

  // Handle keyboard input - auto-start on movement key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      let isMovementKey = false;

      switch (key) {
        case "ARROWUP":
        case "W":
          if (direction !== "DOWN") setNextDirection("UP");
          isMovementKey = true;
          break;
        case "ARROWDOWN":
        case "S":
          if (direction !== "UP") setNextDirection("DOWN");
          isMovementKey = true;
          break;
        case "ARROWLEFT":
        case "A":
          if (direction !== "RIGHT") setNextDirection("LEFT");
          isMovementKey = true;
          break;
        case "ARROWRIGHT":
        case "D":
          if (direction !== "LEFT") setNextDirection("RIGHT");
          isMovementKey = true;
          break;
      }

      // Auto-start game if not playing and movement key pressed
      if (isMovementKey && !isPlaying && !gameOver) {
        setIsPlaying(true);
        e.preventDefault();
      } else if (isMovementKey && isPlaying) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, gameOver, direction]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        setDirection(nextDirection);

        const head = prevSnake[0];
        let newHead: Position = { ...head };

        switch (nextDirection) {
          case "UP":
            newHead.y -= 1;
            break;
          case "DOWN":
            newHead.y += 1;
            break;
          case "LEFT":
            newHead.x -= 1;
            break;
          case "RIGHT":
            newHead.x += 1;
            break;
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_WIDTH || newHead.y < 0 || newHead.y >= GRID_HEIGHT) {
          setGameOver(true);
          setIsPlaying(false);
          playSound(200, 300);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          setIsPlaying(false);
          playSound(200, 300);
          return prevSnake;
        }

        let newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          playSound(600, 100);
          setScore((s) => s + 10);
          setSpeed((s) => Math.max(50, s - 2));
          setFood(generateFood());
        } else {
          newSnake = newSnake.slice(0, -1);
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, food, speed, nextDirection]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with smooth color
    ctx.fillStyle = currentColors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head - brighter glow
        ctx.fillStyle = currentColors.snake;
        ctx.shadowColor = currentColors.snake;
        ctx.shadowBlur = 15;
      } else {
        // Body
        ctx.fillStyle = currentColors.snake;
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });

    // Draw food
    ctx.fillStyle = currentColors.food;
    ctx.shadowColor = currentColors.food;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowColor = "transparent";
  }, [snake, food, currentColors]);

  const handleStart = () => {
    if (gameOver) {
      setSnake([
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
      ]);
      setFood(generateFood());
      setDirection("UP");
      setNextDirection("UP");
      setScore(0);
      setSpeed(INITIAL_SPEED);
      setGameOver(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ]);
    setFood(generateFood());
    setDirection("UP");
    setNextDirection("UP");
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
    setIsPlaying(false);
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-gray-900 min-h-0">
      {/* Header - Compact and Fixed */}
      <div className="flex-shrink-0 py-2 px-3 border-b border-gray-700 bg-gray-950">
        <h1 className="text-xl font-bold text-center text-green-400 leading-tight">SNAKE</h1>
        <p className="text-gray-400 text-[10px] text-center leading-tight">Press W/A/S/D or ↑/↓/←/→</p>
      </div>

      {/* Main Game Area - Takes remaining space */}
      <div className="flex-1 flex items-center justify-center gap-2 px-2 py-2 overflow-hidden min-h-0">
        {/* Canvas Container - Responsive size */}
        <div className="flex-shrink-0 border-3 border-green-400 rounded-lg overflow-hidden shadow-lg">
          <canvas
            ref={canvasRef}
            width={GRID_WIDTH * CELL_SIZE}
            height={GRID_HEIGHT * CELL_SIZE}
            className="bg-gray-950 block w-full h-full"
            style={{
              imageRendering: "crisp-edges"
            }}
          />
        </div>

        {/* Side Info - Hidden on small screens */}
        <div className="hidden lg:flex flex-col gap-2 min-w-fit">
          {/* Score */}
          <div className="text-center">
            <p className="text-gray-500 text-xs">SCORE</p>
            <p className="text-green-400 font-bold text-lg">{score}</p>
            <p className="text-gray-600 text-xs">Speed: {Math.floor((INITIAL_SPEED - speed) / 2) + 1}</p>
          </div>

          {/* Game Over */}
          {gameOver && (
            <div className="text-center border-t border-gray-700 pt-2">
              <p className="text-red-400 text-xs font-bold">GAME OVER</p>
              <p className="text-gray-400 text-xs">Final: {score}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls - Compact and Fixed */}
      <div className="flex-shrink-0 flex flex-col gap-2 items-center px-2 py-2 border-t border-gray-700 bg-gray-950">
        {/* Score on mobile/tablet */}
        <div className="lg:hidden text-center text-xs">
          <p className="text-white">
            Score: <span className="text-green-400 font-bold">{score}</span> | Speed: {Math.floor((INITIAL_SPEED - speed) / 2) + 1}
          </p>
          {gameOver && <p className="text-red-400 text-xs mt-1">Game Over! Final: {score}</p>}
        </div>

        {/* Control Buttons - Compact */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          <button
            onClick={handleStart}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-black font-bold text-xs rounded transition-colors"
            title={gameOver ? "Start new game" : isPlaying ? "Pause" : "Start"}
          >
            <Play size={12} />
            <span className="hidden sm:inline">{gameOver ? "New" : isPlaying ? "Pause" : "Start"}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded transition-colors"
            title="Reset game"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1 px-2.5 py-1.5 font-bold text-xs rounded transition-colors ${
              soundEnabled
                ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
};
