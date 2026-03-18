export interface LevelMap {
  name: string;
  rows: number;
  cols: number;
  tileSize: number;
  tiles: number[][];
  entities: {
    playerSpawn: { i: number; j: number };
    ghostSpawns: { i: number; j: number }[];
    ghostHouse: { i: number; j: number };
    scatterTargets: { i: number; j: number }[];
  };
  metadata: {
    frightDuration: number;
    baseGhostSpeed: number;
    basePacSpeed: number;
  };
}

// Tile types
export const TILE_EMPTY = 0;
export const TILE_WALL = 1;
export const TILE_DOT = 2;
export const TILE_POWER_PELLET = 3;

const createEmptyLevel = (rows: number, cols: number, name: string): LevelMap => ({
  name,
  rows,
  cols,
  tileSize: 20,
  tiles: Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(TILE_EMPTY)),
  entities: {
    playerSpawn: { i: rows - 3, j: Math.floor(cols / 2) },
    ghostSpawns: [
      { i: Math.floor(rows / 2) - 2, j: Math.floor(cols / 2) - 1 },
      { i: Math.floor(rows / 2) - 2, j: Math.floor(cols / 2) },
      { i: Math.floor(rows / 2) - 1, j: Math.floor(cols / 2) - 1 },
      { i: Math.floor(rows / 2) - 1, j: Math.floor(cols / 2) },
    ],
    ghostHouse: { i: Math.floor(rows / 2) - 1, j: Math.floor(cols / 2) },
    scatterTargets: [
      { i: 1, j: 1 },
      { i: 1, j: cols - 2 },
      { i: rows - 2, j: 1 },
      { i: rows - 2, j: cols - 2 },
    ],
  },
  metadata: {
    frightDuration: 7.0,
    baseGhostSpeed: 60,
    basePacSpeed: 80,
  },
});

const createMazeLevel = (name: string): LevelMap => {
  const level = createEmptyLevel(21, 19, name);
  const { tiles } = level;

  // Add border walls
  for (let i = 0; i < level.rows; i++) {
    tiles[i][0] = TILE_WALL;
    tiles[i][level.cols - 1] = TILE_WALL;
  }
  for (let j = 0; j < level.cols; j++) {
    tiles[0][j] = TILE_WALL;
    tiles[level.rows - 1][j] = TILE_WALL;
  }

  // Add interior maze walls
  for (let i = 2; i < level.rows - 2; i++) {
    for (let j = 2; j < level.cols - 2; j++) {
      if (i % 4 === 2 && j % 4 === 2) {
        tiles[i][j] = TILE_WALL;
        if (j + 1 < level.cols - 2) tiles[i][j + 1] = TILE_WALL;
        if (i + 1 < level.rows - 2) tiles[i + 1][j] = TILE_WALL;
      }
    }
  }

  // Fill with dots
  for (let i = 1; i < level.rows - 1; i++) {
    for (let j = 1; j < level.cols - 1; j++) {
      if (tiles[i][j] !== TILE_WALL) {
        tiles[i][j] = TILE_DOT;
      }
    }
  }

  // Place power pellets at corners
  const corners = [
    { i: 2, j: 2 },
    { i: 2, j: level.cols - 3 },
    { i: level.rows - 3, j: 2 },
    { i: level.rows - 3, j: level.cols - 3 },
  ];
  corners.forEach((pos) => {
    if (tiles[pos.i][pos.j] !== TILE_WALL) {
      tiles[pos.i][pos.j] = TILE_POWER_PELLET;
    }
  });

  return level;
};

export const LEVELS: LevelMap[] = Array.from({ length: 10 }, (_, idx) => {
  const level = createMazeLevel(`Level ${idx + 1}`);
  level.metadata.baseGhostSpeed += idx * 5;
  level.metadata.basePacSpeed += idx * 3;
  level.metadata.frightDuration = Math.max(3, 7 - idx * 0.4);
  return level;
});
