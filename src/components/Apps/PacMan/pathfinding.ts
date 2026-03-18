import { TILE_WALL } from "./levels";

export interface Tile {
  i: number;
  j: number;
}

export interface PathNode {
  tile: Tile;
  g: number; // cost from start
  h: number; // heuristic cost to target
  f: number; // g + h
  parent: PathNode | null;
}

class MinHeap {
  private heap: PathNode[] = [];

  push(node: PathNode) {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): PathNode | undefined {
    if (this.heap.length === 0) return undefined;
    const root = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return root;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(idx: number) {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this.heap[idx].f < this.heap[parentIdx].f) {
        [this.heap[idx], this.heap[parentIdx]] = [
          this.heap[parentIdx],
          this.heap[idx],
        ];
        idx = parentIdx;
      } else {
        break;
      }
    }
  }

  private bubbleDown(idx: number) {
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (
        left < this.heap.length &&
        this.heap[left].f < this.heap[smallest].f
      ) {
        smallest = left;
      }
      if (
        right < this.heap.length &&
        this.heap[right].f < this.heap[smallest].f
      ) {
        smallest = right;
      }

      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [
          this.heap[smallest],
          this.heap[idx],
        ];
        idx = smallest;
      } else {
        break;
      }
    }
  }
}

export function manhattanDistance(a: Tile, b: Tile): number {
  return Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
}

export function aStar(
  start: Tile,
  target: Tile,
  grid: number[][],
  rows: number,
  cols: number
): Tile[] {
  // Simple BFS pathfinding
  const tileKey = (t: Tile) => `${t.i},${t.j}`;
  const queue: Tile[] = [start];
  const parent = new Map<string, Tile>();
  const visited = new Set<string>();
  
  const startKey = tileKey(start);
  const targetKey = tileKey(target);
  visited.add(startKey);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = tileKey(current);

    if (currentKey === targetKey) {
      // Reconstruct path
      const path: Tile[] = [];
      let node = target;
      while (tileKey(node) !== startKey) {
        path.unshift(node);
        const parentTile = parent.get(tileKey(node));
        if (!parentTile) break;
        node = parentTile;
      }
      return path.length > 0 ? path : [target];
    }

    // Check 4 neighbors
    const neighbors: Tile[] = [
      { i: current.i - 1, j: current.j },
      { i: current.i + 1, j: current.j },
      { i: current.i, j: current.j - 1 },
      { i: current.i, j: current.j + 1 },
    ];

    for (const neighbor of neighbors) {
      if (neighbor.i < 0 || neighbor.i >= rows || neighbor.j < 0 || neighbor.j >= cols) {
        continue;
      }

      if (grid[neighbor.i][neighbor.j] === TILE_WALL) {
        continue;
      }

      const neighborKey = tileKey(neighbor);
      if (visited.has(neighborKey)) continue;

      visited.add(neighborKey);
      parent.set(neighborKey, current);
      queue.push(neighbor);
    }
  }

  // No path found
  return [];
}

/**
 * Find the farthest reachable tile from a source tile using BFS
 */
export function findFarthestTile(
  ghostTile: Tile,
  playerTile: Tile,
  grid: number[][],
  rows: number,
  cols: number
): Tile {
  // BFS from player to compute distances
  const playerDistances = new Map<string, number>();
  const queue: Tile[] = [playerTile];
  playerDistances.set(`${playerTile.i},${playerTile.j}`, 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = playerDistances.get(
      `${current.i},${current.j}`
    ) || 0;

    const neighbors = [
      { i: current.i - 1, j: current.j },
      { i: current.i + 1, j: current.j },
      { i: current.i, j: current.j - 1 },
      { i: current.i, j: current.j + 1 },
    ];

    for (const neighbor of neighbors) {
      if (
        neighbor.i < 0 ||
        neighbor.i >= rows ||
        neighbor.j < 0 ||
        neighbor.j >= cols
      ) {
        continue;
      }

      if (grid[neighbor.i][neighbor.j] === TILE_WALL) continue;

      const key = `${neighbor.i},${neighbor.j}`;
      if (playerDistances.has(key)) continue;

      playerDistances.set(key, currentDist + 1);
      queue.push(neighbor);
    }
  }

  // Find tile reachable from ghost with max distance from player
  let maxDist = -1;
  let fleeTarget = ghostTile;

  // BFS from ghost to find reachable tiles
  const ghostReachable = new Set<string>();
  const gq: Tile[] = [ghostTile];
  ghostReachable.add(`${ghostTile.i},${ghostTile.j}`);

  while (gq.length > 0) {
    const current = gq.shift()!;
    const neighbors = [
      { i: current.i - 1, j: current.j },
      { i: current.i + 1, j: current.j },
      { i: current.i, j: current.j - 1 },
      { i: current.i, j: current.j + 1 },
    ];

    for (const neighbor of neighbors) {
      if (
        neighbor.i < 0 ||
        neighbor.i >= rows ||
        neighbor.j < 0 ||
        neighbor.j >= cols
      ) {
        continue;
      }

      if (grid[neighbor.i][neighbor.j] === TILE_WALL) continue;

      const key = `${neighbor.i},${neighbor.j}`;
      if (ghostReachable.has(key)) continue;

      ghostReachable.add(key);
      const dist = playerDistances.get(key) || -1;
      if (dist > maxDist) {
        maxDist = dist;
        fleeTarget = neighbor;
      }

      gq.push(neighbor);
    }
  }

  return fleeTarget;
}
