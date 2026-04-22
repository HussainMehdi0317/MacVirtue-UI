import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

// Color scheme that changes every 100 points
const COLOR_SCHEMES = [
  { bg: "#0a0a0f", snake: "#00ff00", food: "#ff3333" }, // Green/Red
  { bg: "#0f0a0a", snake: "#00ffff", food: "#ffaa00" }, // Cyan/Orange
  { bg: "#0a0f0a", snake: "#ff00ff", food: "#00ffff" }, // Magenta/Cyan
  { bg: "#0f0f0a", snake: "#ffff00", food: "#ff0000" }, // Yellow/Red
  { bg: "#0a0a0f", snake: "#00ccff", food: "#ff6600" }  // Light Blue/Orange
];

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const audioContextRef = useRef<AudioContext | null>(null);

  // Get current color scheme based on score
  const getCurrentColorScheme = () => {
    const schemeIndex = Math.floor(score / 100) % COLOR_SCHEMES.length;
    return COLOR_SCHEMES[schemeIndex];
  };

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

    const colors = getCurrentColorScheme();

    // Clear canvas with solid color (no grid)
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head - brighter glow
        ctx.fillStyle = colors.snake;
        ctx.shadowColor = colors.snake;
        ctx.shadowBlur = 15;
      } else {
        // Body
        ctx.fillStyle = colors.snake;
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });

    // Draw food
    ctx.fillStyle = colors.food;
    ctx.shadowColor = colors.food;
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
  }, [snake, food, score]);

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
    <div ref={containerRef} className="w-full h-full flex flex-col bg-gray-900">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 py-3 px-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-center text-green-400">SNAKE</h1>
        <p className="text-gray-400 text-xs text-center">Press W/A/S/D or Arrow Keys to start & move</p>
      </div>

      {/* Main Game Area - Flexible */}
      <div className="flex-1 flex items-center justify-center gap-4 px-4 py-4 overflow-hidden">
        {/* Left Side Score (Fullscreen) */}
        <div className="hidden sm:flex flex-col items-center justify-center text-center min-w-fit">
          <p className="text-gray-400 text-sm">SCORE</p>
          <p className="text-green-400 font-bold text-3xl">{score}</p>
          <p className="text-gray-500 text-xs mt-2">Speed: {Math.floor((INITIAL_SPEED - speed) / 2) + 1}</p>
        </div>

        {/* Canvas Container */}
        <div className="flex-shrink-0 border-4 border-green-400 rounded-lg overflow-hidden shadow-lg">
          <canvas
            ref={canvasRef}
            width={GRID_WIDTH * CELL_SIZE}
            height={GRID_HEIGHT * CELL_SIZE}
            className="bg-gray-950 block"
          />
        </div>

        {/* Right Side - Game Over Message (Fullscreen) */}
        <div className="hidden sm:flex flex-col items-center justify-center text-center min-w-fit">
          {gameOver ? (
            <>
              <p className="text-red-400 text-sm font-bold">GAME</p>
              <p className="text-red-400 text-sm font-bold">OVER</p>
              <p className="text-gray-400 text-xs mt-2">Final: {score}</p>
            </>
          ) : (
            <p className="text-gray-500 text-xs">Ready to Play</p>
          )}
        </div>
      </div>

      {/* Bottom Controls - Fixed */}
      <div className="flex-shrink-0 flex flex-col gap-3 items-center px-4 py-4 border-t border-gray-700">
        {/* Mobile Score Display */}
        <div className="sm:hidden text-center">
          <p className="text-white text-sm">
            Score: <span className="text-green-400 font-bold">{score}</span>
          </p>
          <p className="text-gray-400 text-xs">Speed: {Math.floor((INITIAL_SPEED - speed) / 2) + 1}</p>
        </div>

        {/* Game Over Message (Mobile) */}
        {gameOver && (
          <div className="sm:hidden text-center">
            <p className="text-red-400 text-sm font-bold">GAME OVER!</p>
            <p className="text-gray-400 text-xs">Final Score: {score}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2 flex-wrap justify-center">
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold text-sm rounded-lg transition-colors"
          >
            <Play size={14} />
            {gameOver ? "New" : isPlaying ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-3 py-2 font-bold text-sm rounded-lg transition-colors ${
              soundEnabled
                ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-400 text-xs max-w-xs">
          <p>• Eat food to grow • Avoid walls & yourself • Colors change every 100 points</p>
        </div>
      </div>
    </div>
  );
};
