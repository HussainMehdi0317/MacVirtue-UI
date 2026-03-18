import React from "react";
import { motion } from "framer-motion";
import { useWindowStore } from "../../../state/useWindowStore";
import { LEVELS, TILE_WALL, TILE_DOT, TILE_POWER_PELLET, LevelMap } from "./levels";
import { aStar, findFarthestTile, Tile } from "./pathfinding";

type GhostState = "scatter" | "chase" | "frightened" | "eaten";
type GameState = "menu" | "levelSelect" | "playing" | "levelComplete" | "gameWon";

interface Ghost {
  id: number;
  worldPos: { x: number; y: number };
  tilePos: Tile;
  color: string;
  state: GhostState;
  path: Tile[];
  speed: number;
  replanTimer: number;
  replanInterval: number;
  frightenedEndTime: number;
  scatterTarget: Tile;
}

interface GameData {
  level: number;
  map: LevelMap;
  pacWorldPos: { x: number; y: number };
  pacTilePos: Tile;
  pacNextDir: "UP" | "DOWN" | "LEFT" | "RIGHT";
  pacDir: "UP" | "DOWN" | "LEFT" | "RIGHT";
  pacSpeed: number;
  ghosts: Ghost[];
  dots: Set<string>;
  powerPellets: Set<string>;
  score: number;
  lives: number;
  frightModeEndTime: number;
  gameTime: number;
  chasePhaseTimer: number;
}

const PacManGameApp: React.FC = () => {
  const [gameState, setGameState] = React.useState<GameState>("menu");
  const [completedLevels, setCompletedLevels] = React.useState<Set<number>>(
    new Set()
  );
  const [gameData, setGameData] = React.useState<GameData | null>(null);
  const [levelCompleteInfo, setLevelCompleteInfo] = React.useState<{
    level: number;
    score: number;
  } | null>(null);
  const gameLoopRef = React.useRef<NodeJS.Timeout | null>(null);
  const accumulatorRef = React.useRef(0);

  const goToMenu = () => {
    setGameState("menu");
  };

  const quitGame = () => {
    const state = useWindowStore.getState();
    const pacmanWindow = state.windows.find((w) => w.appId === "pacman");
    if (pacmanWindow) {
      state.closeWindow(pacmanWindow.id);
    }
  };

  const startNewGame = () => {
    initializeGame(1);
    setGameState("playing");
  };

  const playLevel = (levelNum: number) => {
    initializeGame(levelNum);
    setGameState("playing");
  };

  const initializeGame = (levelNum: number) => {
    const map = LEVELS[levelNum - 1];
    const pacTilePos = map.entities.playerSpawn;
    const pacWorldPos = tileToWorld(
      pacTilePos.i,
      pacTilePos.j,
      map.tileSize
    );

    // Initialize dots
    const dots = new Set<string>();
    const powerPellets = new Set<string>();
    for (let i = 0; i < map.rows; i++) {
      for (let j = 0; j < map.cols; j++) {
        if (map.tiles[i][j] === TILE_DOT) {
          dots.add(`${i},${j}`);
        } else if (map.tiles[i][j] === TILE_POWER_PELLET) {
          powerPellets.add(`${i},${j}`);
        }
      }
    }

    // Initialize ghosts
    const ghosts: Ghost[] = map.entities.ghostSpawns.map((spawn, idx) => {
      const worldPos = tileToWorld(spawn.i, spawn.j, map.tileSize);
      return {
        id: idx,
        worldPos,
        tilePos: spawn,
        color: ["#FF0000", "#FFB6C1", "#00FFFF", "#FFB347"][idx],
        state: "scatter",
        path: [],
        speed: map.metadata.baseGhostSpeed,
        replanTimer: 0,
        replanInterval: 0.25,
        frightenedEndTime: 0,
        scatterTarget: map.entities.scatterTargets[idx],
      };
    });

    setGameData({
      level: levelNum,
      map,
      pacWorldPos,
      pacTilePos,
      pacNextDir: "RIGHT",
      pacDir: "RIGHT",
      pacSpeed: map.metadata.basePacSpeed,
      ghosts,
      dots,
      powerPellets,
      score: 0,
      lives: 3,
      frightModeEndTime: 0,
      gameTime: 0,
      chasePhaseTimer: 999, // Always in chase phase
    });
  };

  // Game loop
  React.useEffect(() => {
    if (gameState !== "playing" || !gameData) return;

    const handleGameLoop = () => {
      const dt = 1 / 60; // 60 FPS

      setGameData((prev) => {
        if (!prev) return prev;

        const updated = { ...prev, gameTime: prev.gameTime + dt };
        const { map, pacTilePos, pacNextDir, pacDir } = updated;
        const { tileSize, rows, cols } = map;

        // Update chase/scatter phases - ghosts always chase
        updated.chasePhaseTimer -= dt;
        // No phase swapping - ghosts are always in chase mode

        // Update Pac-Man position
        let newPacDir = pacDir;
        const nextTileInQueuedDir = getTileInDirection(pacTilePos, pacNextDir);
        if (
          isWalkable(nextTileInQueuedDir, map.tiles) &&
          isAlignedWithTileCenter(updated.pacWorldPos, pacTilePos, tileSize)
        ) {
          newPacDir = pacNextDir;
        }

        const nextTile = getTileInDirection(pacTilePos, newPacDir);
        if (isWalkable(nextTile, map.tiles)) {
          const dirVec = getDirectionVector(newPacDir);
          updated.pacWorldPos.x += dirVec.x * updated.pacSpeed * dt;
          updated.pacWorldPos.y += dirVec.y * updated.pacSpeed * dt;

          // Check if reached center of tile
          const tileCenter = tileToWorld(
            nextTile.i,
            nextTile.j,
            tileSize
          );
          const distToCenter = Math.hypot(
            updated.pacWorldPos.x - tileCenter.x,
            updated.pacWorldPos.y - tileCenter.y
          );
          if (distToCenter < updated.pacSpeed * dt + 1) {
            updated.pacWorldPos = { ...tileCenter };
            updated.pacTilePos = nextTile;
          }
        }

        updated.pacDir = newPacDir;

        // Consume dots and power pellets
        const pacKey = `${updated.pacTilePos.i},${updated.pacTilePos.j}`;
        if (updated.dots.has(pacKey)) {
          updated.dots.delete(pacKey);
          updated.score += 10;
        }
        if (updated.powerPellets.has(pacKey)) {
          updated.powerPellets.delete(pacKey);
          updated.score += 50;
          updated.frightModeEndTime = updated.gameTime + map.metadata.frightDuration;
          updated.ghosts.forEach((g) => {
            g.state = "frightened";
            g.frightenedEndTime = updated.frightModeEndTime;
          });
        }

        // Update ghosts
        updated.ghosts = updated.ghosts.map((ghost) => {
          const g = { ...ghost };

          // Determine target based on state
          let target = g.scatterTarget;
          
          if (g.state === "eaten") {
            target = map.entities.ghostHouse;
          } else if (g.state === "frightened") {
            // Flee from player
            target = findFarthestTile(
              g.tilePos,
              updated.pacTilePos,
              map.tiles,
              rows,
              cols
            );
          } else {
            // Chase the player
            target = updated.pacTilePos;
            g.state = "chase";
          }

          // Replan path every 0.25 seconds or if path is invalid
          g.replanTimer -= dt;
          if (g.replanTimer <= 0) {
            const newPath = aStar(g.tilePos, target, map.tiles, rows, cols);
            g.path = newPath.length > 0 ? newPath : [target];
            g.replanTimer = 0.25;
          }

          // Move along path
          if (g.path.length > 0) {
            const nextTile = g.path[0];
            const targetPos = tileToWorld(nextTile.i, nextTile.j, tileSize);
            
            const dx = targetPos.x - g.worldPos.x;
            const dy = targetPos.y - g.worldPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0.1) {
              const speed = g.state === "frightened" ? g.speed * 0.8 : g.speed;
              const moveX = (dx / dist) * speed * dt;
              const moveY = (dy / dist) * speed * dt;

              g.worldPos.x += moveX;
              g.worldPos.y += moveY;

              // Check if reached tile center
              if (dist < speed * dt + 1) {
                g.worldPos = { ...targetPos };
                g.tilePos = nextTile;
                g.path.shift();
              }
            }
          }

          return g;
        });

        // Ghost collisions
        for (const ghost of updated.ghosts) {
          const dist = Math.hypot(
            ghost.worldPos.x - updated.pacWorldPos.x,
            ghost.worldPos.y - updated.pacWorldPos.y
          );
          if (dist < map.tileSize * 0.6) {
            if (ghost.state === "frightened") {
              ghost.state = "eaten";
              updated.score += 200;
            } else if (ghost.state !== "eaten") {
              updated.lives--;
              if (updated.lives <= 0) {
                setGameState("menu");
                return updated;
              }
              // Reset positions
              updated.pacWorldPos = tileToWorld(
                map.entities.playerSpawn.i,
                map.entities.playerSpawn.j,
                tileSize
              );
              updated.pacTilePos = map.entities.playerSpawn;
              updated.ghosts.forEach((g, idx) => {
                const spawn = map.entities.ghostSpawns[idx];
                g.worldPos = tileToWorld(spawn.i, spawn.j, tileSize);
                g.tilePos = spawn;
              });
            }
          }
        }

        // Level completion - stop game loop immediately
        if (updated.dots.size === 0 && updated.powerPellets.size === 0) {
          console.log("LEVEL COMPLETE!", { level: updated.level, score: updated.score, dotsLeft: updated.dots.size, pelletsLeft: updated.powerPellets.size });
          // Clear the game loop
          if (gameLoopRef.current) clearInterval(gameLoopRef.current);
          
          // Stop game state to prevent further updates
          if (updated.level >= LEVELS.length - 1) {
            setLevelCompleteInfo({ level: updated.level, score: updated.score });
            setGameState("gameWon");
          } else {
            setLevelCompleteInfo({ level: updated.level, score: updated.score });
            setGameState("levelComplete");
          }
          // Return early - don't continue looping
          return prev;
        }

        return updated;
      });
    };

    gameLoopRef.current = setInterval(handleGameLoop, 1000 / 60);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState]);

  // Input handling
  React.useEffect(() => {
    if (gameState !== "playing") return;

    const handleKey = (e: KeyboardEvent) => {
      let dir: "UP" | "DOWN" | "LEFT" | "RIGHT" | null = null;
      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          dir = "UP";
          break;
        case "arrowdown":
        case "s":
          dir = "DOWN";
          break;
        case "arrowleft":
        case "a":
          dir = "LEFT";
          break;
        case "arrowright":
        case "d":
          dir = "RIGHT";
          break;
      }

      if (dir) {
        e.preventDefault();
        setGameData((prev) => {
          if (!prev) return prev;
          return { ...prev, pacNextDir: dir };
        });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState]);

  // Level Complete Screen
  if (gameState === "levelComplete" && levelCompleteInfo) {
    return (
      <div className="h-full w-full flex flex-col bg-slate-950 text-white overflow-hidden items-center justify-center gap-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-yellow-300 drop-shadow-lg mb-4">
            LEVEL {levelCompleteInfo.level} COMPLETE!
          </div>
          <div className="text-3xl text-green-400 mb-8">Score: {levelCompleteInfo.score}</div>

          <div className="flex flex-col gap-4 w-80">
            <button
              onClick={() => {
                setCompletedLevels((prev) =>
                  new Set([...prev, levelCompleteInfo.level])
                );
                playLevel(levelCompleteInfo.level + 1);
              }}
              className="w-full px-8 py-4 bg-green-500 text-black font-bold text-xl rounded-lg hover:bg-green-400 transition-all transform hover:scale-105 cursor-pointer shadow-lg"
            >
              Next Level
            </button>

            <button
              onClick={() => setGameState("menu")}
              className="w-full px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-lg hover:bg-blue-500 transition-all transform hover:scale-105 cursor-pointer shadow-lg"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Won Screen
  if (gameState === "gameWon" && levelCompleteInfo) {
    return (
      <div className="h-full w-full flex flex-col bg-slate-950 text-white overflow-hidden items-center justify-center gap-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-yellow-300 drop-shadow-lg mb-4">
            🎉 YOU WIN! 🎉
          </div>
          <div className="text-2xl text-green-400 mb-4">
            All 10 Levels Completed!
          </div>
          <div className="text-3xl text-orange-400 mb-8">Final Score: {levelCompleteInfo.score}</div>

          <div className="flex flex-col gap-4 w-80">
            <button
              onClick={() => {
                setCompletedLevels(new Set());
                startNewGame();
              }}
              className="w-full px-8 py-4 bg-yellow-500 text-black font-bold text-xl rounded-lg hover:bg-yellow-400 transition-all transform hover:scale-105 cursor-pointer shadow-lg"
            >
              Play Again
            </button>

            <button
              onClick={() => setGameState("menu")}
              className="w-full px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-lg hover:bg-blue-500 transition-all transform hover:scale-105 cursor-pointer shadow-lg"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Menu Screen
  if (gameState === "menu") {
    return (
      <div className="h-full w-full flex flex-col bg-slate-950 text-white overflow-hidden items-center justify-center gap-12">
        <div className="text-center">
          <div className="text-6xl font-bold text-yellow-300 drop-shadow-lg">
            PAC-MAN
          </div>
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
            <div className="text-3xl font-bold mb-8 text-yellow-300">
              Select Level
            </div>

            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: LEVELS.length }).map((_, idx) => {
                const levelNum = idx + 1;
                const isUnlocked =
                  levelNum === 1 || completedLevels.has(levelNum - 1);

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
  if (!gameData) return null;

  const { map, pacWorldPos, pacDir, pacTilePos, ghosts, dots, powerPellets, score, lives, level } = gameData;
  const { tileSize, rows, cols } = map;
  const gameWidth = cols * tileSize;
  const gameHeight = rows * tileSize;

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
        <div className="flex justify-between items-center text-xs flex-1 px-4 gap-8">
          <div>Level: {level}/{LEVELS.length}</div>
          <div>Score: {score}</div>
          <div>Lives: {lives}</div>
        </div>
      </div>

      {/* Game board */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="relative bg-slate-950 border-2 border-blue-500 rounded"
          style={{
            width: gameWidth,
            height: gameHeight,
          }}
        >
          {/* Render walls */}
          {Array.from({ length: rows }).map((_, i) =>
            Array.from({ length: cols }).map((_, j) => {
              if (map.tiles[i][j] === TILE_WALL) {
                return (
                  <div
                    key={`wall-${i}-${j}`}
                    className="absolute bg-blue-600 border border-blue-400"
                    style={{
                      left: j * tileSize,
                      top: i * tileSize,
                      width: tileSize,
                      height: tileSize,
                    }}
                  />
                );
              }
              return null;
            })
          )}

          {/* Render dots */}
          {Array.from(dots).map((key) => {
            const [i, j] = key.split(",").map(Number);
            return (
              <div
                key={`dot-${key}`}
                className="absolute bg-yellow-300 rounded-full"
                style={{
                  left: j * tileSize + tileSize / 2 - 2,
                  top: i * tileSize + tileSize / 2 - 2,
                  width: 4,
                  height: 4,
                }}
              />
            );
          })}

          {/* Render power pellets */}
          {Array.from(powerPellets).map((key) => {
            const [i, j] = key.split(",").map(Number);
            return (
              <motion.div
                key={`power-${key}`}
                className="absolute bg-yellow-300 rounded-full"
                style={{
                  left: j * tileSize + tileSize / 2 - 5,
                  top: i * tileSize + tileSize / 2 - 5,
                  width: 10,
                  height: 10,
                }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            );
          })}

          {/* Render Pac-Man */}
          <motion.div
            className="absolute w-4 h-4 bg-yellow-400 rounded-full"
            style={{
              left: pacWorldPos.x - 8,
              top: pacWorldPos.y - 8,
              width: 16,
              height: 16,
            }}
            animate={{ rotate: getRotationAngle(pacDir) }}
            transition={{ duration: 0.1 }}
          />

          {/* Render ghosts */}
          {ghosts.map((ghost) => (
            <motion.div
              key={ghost.id}
              className="absolute w-4 h-4 rounded-full"
              style={{
                left: ghost.worldPos.x - 8,
                top: ghost.worldPos.y - 8,
                width: 16,
                height: 16,
                backgroundColor: ghost.state === "frightened" ? "#0000FF" : ghost.color,
              }}
              layout
              animate={{
                opacity: ghost.state === "frightened" && gameData.gameTime % 0.4 < 0.2 ? 0.3 : 1,
              }}
              transition={{ duration: 0.05 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions
function tileToWorld(i: number, j: number, tileSize: number) {
  return {
    x: j * tileSize + tileSize / 2,
    y: i * tileSize + tileSize / 2,
  };
}

function worldToTile(x: number, y: number, tileSize: number) {
  return {
    i: Math.floor(y / tileSize),
    j: Math.floor(x / tileSize),
  };
}

function isWalkable(tile: Tile, tileGrid: number[][]): boolean {
  if (tile.i < 0 || tile.i >= tileGrid.length) return false;
  if (tile.j < 0 || tile.j >= tileGrid[0].length) return false;
  return tileGrid[tile.i][tile.j] !== TILE_WALL;
}

function getTileInDirection(tile: Tile, dir: "UP" | "DOWN" | "LEFT" | "RIGHT"): Tile {
  switch (dir) {
    case "UP":
      return { ...tile, i: tile.i - 1 };
    case "DOWN":
      return { ...tile, i: tile.i + 1 };
    case "LEFT":
      return { ...tile, j: tile.j - 1 };
    case "RIGHT":
      return { ...tile, j: tile.j + 1 };
  }
}

function getDirectionVector(dir: "UP" | "DOWN" | "LEFT" | "RIGHT") {
  switch (dir) {
    case "UP":
      return { x: 0, y: -1 };
    case "DOWN":
      return { x: 0, y: 1 };
    case "LEFT":
      return { x: -1, y: 0 };
    case "RIGHT":
      return { x: 1, y: 0 };
  }
}

function isAlignedWithTileCenter(
  worldPos: { x: number; y: number },
  tilePosParam: Tile,
  tileSize: number
): boolean {
  const tileCenter = tileToWorld(tilePosParam.i, tilePosParam.j, tileSize);
  const dist = Math.hypot(
    worldPos.x - tileCenter.x,
    worldPos.y - tileCenter.y
  );
  return dist < 2;
}

function getRotationAngle(dir: "UP" | "DOWN" | "LEFT" | "RIGHT"): number {
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

export default PacManGameApp;
