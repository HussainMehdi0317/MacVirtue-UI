import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key.toUpperCase()) {
        case "ARROWUP":
        case "W":
          if (direction !== "DOWN") setNextDirection("UP");
          e.preventDefault();
          break;
        case "ARROWDOWN":
        case "S":
          if (direction !== "UP") setNextDirection("DOWN");
          e.preventDefault();
          break;
        case "ARROWLEFT":
        case "A":
          if (direction !== "RIGHT") setNextDirection("LEFT");
          e.preventDefault();
          break;
        case "ARROWRIGHT":
        case "D":
          if (direction !== "LEFT") setNextDirection("RIGHT");
          e.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, direction]);

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

    // Clear canvas
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#2a2a4e";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        ctx.fillStyle = "#00ff00";
        ctx.shadowColor = "#00ff00";
        ctx.shadowBlur = 10;
      } else {
        // Body
        ctx.fillStyle = "#00cc00";
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });

    // Draw food
    ctx.fillStyle = "#ff3333";
    ctx.shadowColor = "#ff3333";
    ctx.shadowBlur = 8;
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
  }, [snake, food]);

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
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4 gap-4">
      {/* Game Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-400 mb-2">SNAKE</h1>
        <p className="text-gray-400 text-sm">Use Arrow Keys or WASD to move</p>
      </div>

      {/* Canvas */}
      <div className="border-4 border-green-400 rounded-lg overflow-hidden shadow-lg">
        <canvas
          ref={canvasRef}
          width={GRID_WIDTH * CELL_SIZE}
          height={GRID_HEIGHT * CELL_SIZE}
          className="bg-gray-950"
        />
      </div>

      {/* Score Display */}
      <div className="text-center">
        <p className="text-white text-lg">
          Score: <span className="text-green-400 font-bold text-2xl">{score}</span>
        </p>
        <p className="text-gray-400 text-sm">Speed: {Math.floor((INITIAL_SPEED - speed) / 2) + 1}</p>
      </div>

      {/* Game Over Message */}
      {gameOver && (
        <div className="text-center">
          <p className="text-red-400 text-xl font-bold">GAME OVER!</p>
          <p className="text-gray-400">Final Score: {score}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleStart}
          className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-colors"
        >
          <Play size={16} />
          {gameOver ? "New Game" : isPlaying ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-colors ${
            soundEnabled
              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-400 text-xs max-w-xs">
        <p>• Eat the red food to grow</p>
        <p>• Don't hit the walls or yourself</p>
        <p>• Speed increases as you score</p>
      </div>
    </div>
  );
};
