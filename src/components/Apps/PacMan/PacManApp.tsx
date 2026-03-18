import React from "react";
import { motion } from "framer-motion";
import { useWindowStore } from "../../../state/useWindowStore";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface Position {
  x: number;
  y: number;
}

interface Ghost {
  id: number;
  pos: Position;
  color: string;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const LEVELS = 10;

// Helper function to check if a position is a wall
const isWall = (pos: Position): boolean => {
  // Border walls
  if (pos.x === 0 || pos.x === GRID_SIZE - 1) return true;
  if (pos.y === 0 || pos.y === GRID_SIZE - 1) return true;

  // Vertical walls (with gaps for escape)
  if (pos.x === 5 && pos.y >= 2 && pos.y <= 17 && pos.y !== 10) return true;
  if (pos.x === 14 && pos.y >= 2 && pos.y <= 17 && pos.y !== 10) return true;

  // Horizontal walls (with gaps for escape)
  if (pos.y === 5 && pos.x >= 2 && pos.x <= 17 && pos.x !== 9) return true;
  if (pos.y === 14 && pos.x >= 2 && pos.x <= 17 && pos.x !== 9) return true;

  // Cross walls in center (with gaps)
  if (pos.x === 9 && pos.y >= 5 && pos.y <= 14 && pos.y !== 9 && pos.y !== 10) return true;
  if (pos.y === 9 && pos.x >= 5 && pos.x <= 14 && pos.x !== 9 && pos.x !== 10) return true;

  return false;
};

function getNewPosition(pos: Position, dir: Direction): Position {
  switch (dir) {
    case "UP":
      return { ...pos, y: Math.max(0, pos.y - 1) };
    case "DOWN":
      return { ...pos, y: Math.min(GRID_SIZE - 1, pos.y + 1) };
    case "LEFT":
      return { ...pos, x: Math.max(0, pos.x - 1) };
    case "RIGHT":
      return { ...pos, x: Math.min(GRID_SIZE - 1, pos.x + 1) };
  }
}

// BFS pathfinding to find shortest route to Pac-Man
const findBestDirection = (ghostPos: Position, targetPos: Position): Direction => {
  const directions: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"];
  const visited = new Set<string>();
  const queue: Array<{ pos: Position; dir: Direction }> = [];

  // Start BFS from ghost position in all valid directions
  for (const dir of directions) {
    const newPos = getNewPosition(ghostPos, dir);
    if (!isWall(newPos)) {
      queue.push({ pos: newPos, dir });
      visited.add(`${newPos.x},${newPos.y}`);
    }
  }

  // BFS with limited depth for performance
  const maxDepth = 5;
  let depth = 0;
  let bestDir = directions[0];
  let bestDist = Infinity;

  while (queue.length > 0 && depth < maxDepth) {
    const current = queue.shift();
    if (!current) break;

    const { pos, dir } = current;
    const dist = Math.hypot(pos.x - targetPos.x, pos.y - targetPos.y);

    if (dist < bestDist) {
      bestDist = dist;
      bestDir = dir;
    }

    // Explore further
    if (depth < maxDepth - 1) {
      for (const nextDir of directions) {
        const nextPos = getNewPosition(pos, nextDir);
        const key = `${nextPos.x},${nextPos.y}`;
        if (!isWall(nextPos) && !visited.has(key)) {
          visited.add(key);
          queue.push({ pos: nextPos, dir });
        }
      }
    }

    depth++;
  }

  // Fallback to simple greedy if no path found
  if (bestDist === Infinity) {
    for (const dir of directions) {
      const newPos = getNewPosition(ghostPos, dir);
      if (!isWall(newPos)) {
        const dist = Math.hypot(newPos.x - targetPos.x, newPos.y - targetPos.y);
        if (dist < bestDist) {
          bestDist = dist;
          bestDir = dir;
        }
      }
    }
  }

  return bestDir;
};

const PacManApp: React.FC = () => {
  const [gameState, setGameState] = React.useState<"menu" | "levelSelect" | "playing">("menu");
  const [selectedLevel, setSelectedLevel] = React.useState(1);
  const [completedLevels, setCompletedLevels] = React.useState<Set<number>>(new Set());
  const [level, setLevel] = React.useState(1);
  const [pacPos, setPacPos] = React.useState<Position>({ x: 1, y: 1 });
  const [direction, setDirection] = React.useState<Direction>("RIGHT");
  const [nextDirection, setNextDirection] = React.useState<Direction>("RIGHT");
  const [ghosts, setGhosts] = React.useState<Ghost[]>([
    { id: 1, pos: { x: 8, y: 8 }, color: "#FF0000" },
    { id: 2, pos: { x: 9, y: 8 }, color: "#FFB6C1" },
    { id: 3, pos: { x: 8, y: 9 }, color: "#00FFFF" },
    { id: 4, pos: { x: 9, y: 9 }, color: "#FFB347" }
  ]);
  const [pellets, setPellets] = React.useState<Set<string>>(new Set());
  const [powerPellets, setPowerPellets] = React.useState<Set<string>>(new Set());
  const [score, setScore] = React.useState(0);
  const [lives, setLives] = React.useState(3);
  const [gameOver, setGameOver] = React.useState(false);
  const [won, setWon] = React.useState(false);
  const gameLoopRef = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize pellets and power pellets
  React.useEffect(() => {
    const newPellets = new Set<string>();
    const newPowerPellets = new Set<string>();

    for (let x = 1; x < GRID_SIZE - 1; x++) {
      for (let y = 1; y < GRID_SIZE - 1; y++) {
        // Skip walls and starting position
        if (isWall({ x, y }) || (x === 1 && y === 1)) continue;

        const rand = Math.random();
        if (rand > 0.1) {
          // 90% regular pellets
          newPellets.add(`${x},${y}`);
        } else {
          // 10% power pellets
          newPowerPellets.add(`${x},${y}`);
        }
      }
    }

    setPellets(newPellets);
    setPowerPellets(newPowerPellets);
  }, [level]);

  // Handle keyboard input
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          setNextDirection("UP");
          e.preventDefault();
          break;
        case "arrowdown":
        case "s":
          setNextDirection("DOWN");
          e.preventDefault();
          break;
        case "arrowleft":
        case "a":
          setNextDirection("LEFT");
          e.preventDefault();
          break;
        case "arrowright":
        case "d":
          setNextDirection("RIGHT");
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Game loop
  React.useEffect(() => {
    if (gameOver || won) return;

    gameLoopRef.current = setInterval(() => {
      setPacPos((prev) => {
        let newPos = { ...prev };
        let moveDir = nextDirection;

        // Try to move in next direction, fall back to current
        const tryPos = getNewPosition(prev, nextDirection);
        if (!isWall(tryPos)) {
          newPos = tryPos;
          setDirection(nextDirection);
        } else {
          const currentPos = getNewPosition(prev, direction);
          if (!isWall(currentPos)) {
            newPos = currentPos;
          }
        }

        // Check pellet collision
        const key = `${newPos.x},${newPos.y}`;
        if (pellets.has(key)) {
          setPellets((prev) => {
            const updated = new Set(prev);
            updated.delete(key);
            return updated;
          });
          setScore((s) => s + 10);
        }

        if (powerPellets.has(key)) {
          setPowerPellets((prev) => {
            const updated = new Set(prev);
            updated.delete(key);
            return updated;
          });
          setScore((s) => s + 50);
        }

        return newPos;
      });

      // Move ghosts with improved BFS AI
      setGhosts((prev) =>
        prev.map((ghost) => {
          const bestDir = findBestDirection(ghost.pos, pacPos);
          return { ...ghost, pos: getNewPosition(ghost.pos, bestDir) };
        })
      );
    }, 200 - level * 10); // Speed increases with level

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [direction, nextDirection, pellets, powerPellets, level, gameOver, won, pacPos]);

  // Check collisions with ghosts
  React.useEffect(() => {
    for (const ghost of ghosts) {
      if (ghost.pos.x === pacPos.x && ghost.pos.y === pacPos.y) {
        const newLives = lives - 1;
        if (newLives <= 0) {
          setGameOver(true);
        } else {
          setLives(newLives);
          setPacPos({ x: 1, y: 1 });
        }
        break;
      }
    }
  }, [pacPos, ghosts, lives]);

  // Check win condition
  React.useEffect(() => {
    if (pellets.size === 0 && powerPellets.size === 0) {
      if (level >= LEVELS) {
        setWon(true);
      } else {
        // Mark level as completed
        setCompletedLevels((prev) => new Set([...prev, level]));
        setLevel((l) => l + 1);
        setPacPos({ x: 1, y: 1 });
        setDirection("RIGHT");
        setNextDirection("RIGHT");
      }
    }
  }, [pellets, powerPellets, level]);

  const resetGame = () => {
    setLevel(1);
    setPacPos({ x: 1, y: 1 });
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setGameState("menu");
  };

  const startNewGame = () => {
    setLevel(1);
    setPacPos({ x: 1, y: 1 });
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setGameState("playing");
  };

  const playLevel = (levelNum: number) => {
    setLevel(levelNum);
    setPacPos({ x: 1, y: 1 });
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setGameState("playing");
  };

  const goToMenu = () => {
    // Return to menu without closing the game
    setGameState("menu");
  };

  const quitGame = () => {
    // Get all windows and find the pacman window
    const state = useWindowStore.getState();
    const pacmanWindow = state.windows.find((w) => w.appId === "pacman");
    if (pacmanWindow) {
      state.closeWindow(pacmanWindow.id);
    }
  };

  // Menu Screen
  if (gameState === "menu") {
    return (
      <div className="h-full w-full flex flex-col bg-slate-950 text-white overflow-hidden items-center justify-center gap-12">
        <div className="text-center">
          <div className="text-6xl font-bold text-yellow-300 drop-shadow-lg">PAC-MAN</div>
          <div className="text-xl text-gray-300 mt-2">Classic Maze Game</div>
        </div>
        
        <div className="flex flex-col gap-6 w-80">
          <button
            onClick={startNewGame}
            className="w-full px-8 py-4 bg-yellow-500 text-black font-bold text-xl rounded-lg hover:bg-yellow-400 transition-all transform hover:scale-105 cursor-pointer shadow-lg"
          >
            New Game
          </button>
          
          <button
            onClick={() => setGameState("levelSelect")}
            className="w-full px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-lg hover:bg-blue-500 transition-all transform hover:scale-105 cursor-pointer shadow-lg"
          >
            Levels
          </button>
          
          <button
            onClick={quitGame}
            className="w-full px-8 py-4 bg-red-600 text-white font-bold text-xl rounded-lg hover:bg-red-500 transition-all transform hover:scale-105 cursor-pointer shadow-lg"
          >
            Quit Game
          </button>
        </div>
      </div>
    );
  }

  // Level Select Screen
  if (gameState === "levelSelect") {
    return (
      <div className="h-full w-full flex flex-col bg-slate-950 text-white overflow-hidden">
        <div className="px-4 py-4 border-b border-white/10 bg-slate-900/50">
          <button
            onClick={() => setGameState("menu")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors cursor-pointer"
          >
            ← Back
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-8 text-yellow-300">Select Level</div>
            
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: LEVELS }).map((_, idx) => {
                const levelNum = idx + 1;
                const isUnlocked = levelNum === 1 || completedLevels.has(levelNum - 1);

                return (
                  <button
                    key={levelNum}
                    onClick={() => isUnlocked && playLevel(levelNum)}
                    disabled={!isUnlocked}
                    className={`w-16 h-16 rounded-lg font-bold text-lg transition-colors ${
                      isUnlocked
                        ? "bg-yellow-500 text-black hover:bg-yellow-400 cursor-pointer"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {levelNum}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 text-sm text-gray-400">
              Complete a level to unlock the next one
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="h-full w-full flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-white/10 bg-slate-900/50 flex justify-between items-center">
        <button
          onClick={goToMenu}
          className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-500 transition-colors cursor-pointer"
        >
          ← Menu
        </button>
        <div className="flex justify-between items-center text-xs flex-1 px-4">
          <div>Level: {level}/{LEVELS}</div>
          <div>Score: {score}</div>
          <div>Lives: {lives}</div>
        </div>
      </div>

      {/* Game board */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="relative bg-slate-950 border-2 border-blue-500 rounded"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE
          }}
        >
          {/* Render walls */}
          {Array.from({ length: GRID_SIZE }).map((_, x) =>
            Array.from({ length: GRID_SIZE }).map((_, y) => {
              if (isWall({ x, y })) {
                return (
                  <div
                    key={`wall-${x}-${y}`}
                    className="absolute bg-blue-600 border border-blue-400"
                    style={{
                      left: x * CELL_SIZE,
                      top: y * CELL_SIZE,
                      width: CELL_SIZE,
                      height: CELL_SIZE
                    }}
                  />
                );
              }
              return null;
            })
          )}

          {/* Render pellets */}
          {Array.from(pellets).map((key) => {
            const [x, y] = key.split(",").map(Number);
            return (
              <div
                key={`pellet-${key}`}
                className="absolute bg-yellow-300 rounded-full"
                style={{
                  left: x * CELL_SIZE + CELL_SIZE / 2 - 2,
                  top: y * CELL_SIZE + CELL_SIZE / 2 - 2,
                  width: 4,
                  height: 4
                }}
              />
            );
          })}

          {/* Render power pellets */}
          {Array.from(powerPellets).map((key) => {
            const [x, y] = key.split(",").map(Number);
            return (
              <motion.div
                key={`power-${key}`}
                className="absolute bg-yellow-300 rounded-full"
                style={{
                  left: x * CELL_SIZE + CELL_SIZE / 2 - 4,
                  top: y * CELL_SIZE + CELL_SIZE / 2 - 4,
                  width: 8,
                  height: 8
                }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            );
          })}

          {/* Render Pac-Man */}
          <motion.div
            className="absolute w-4 h-4 bg-yellow-300 rounded-full"
            style={{
              left: pacPos.x * CELL_SIZE + CELL_SIZE / 2 - 8,
              top: pacPos.y * CELL_SIZE + CELL_SIZE / 2 - 8,
              width: 16,
              height: 16
            }}
            animate={{ rotate: getRotation(direction) }}
            transition={{ duration: 0.1 }}
          />

          {/* Render ghosts */}
          {ghosts.map((ghost) => (
            <motion.div
              key={ghost.id}
              className="absolute w-4 h-4 rounded-full"
              style={{
                left: ghost.pos.x * CELL_SIZE + CELL_SIZE / 2 - 8,
                top: ghost.pos.y * CELL_SIZE + CELL_SIZE / 2 - 8,
                width: 16,
                height: 16,
                backgroundColor: ghost.color
              }}
              layout
            />
          ))}
        </div>
      </div>

      {/* Game over / Win overlay */}
      {(gameOver || won) && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center pointer-events-auto z-50">
          <div className="bg-slate-800 p-8 rounded-lg text-center">
            <div className="text-2xl font-bold mb-4">
              {gameOver ? "GAME OVER" : `LEVEL ${level} COMPLETE!`}
            </div>
            {won && <div className="text-lg mb-4">You beat all {LEVELS} levels!</div>}
            <div className="text-lg mb-6">Final Score: {score}</div>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 cursor-pointer transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function getRotation(dir: Direction): number {
  switch (dir) {
    case "RIGHT":
      return 0;
    case "DOWN":
      return 90;
    case "LEFT":
      return 180;
    case "UP":
      return 270;
  }
}

export default PacManApp;
