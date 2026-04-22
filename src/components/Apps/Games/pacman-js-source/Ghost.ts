import { DIRECTION_RIGHT, DIRECTION_UP, DIRECTION_LEFT, DIRECTION_BOTTOM, TILE_WALL, GameMap, DrawContext, Position } from './types';
import { Pacman } from './Pacman';

interface QueueNode {
  x: number;
  y: number;
  moves: number[];
}

export class Ghost {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: number = DIRECTION_RIGHT;
  blockSize: number;
  map: GameMap;
  
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
  
  range: number;
  randomTargetIndex: number;
  randomTargets: Position[];
  target: Position | Pacman | null = null;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    speed: number,
    blockSize: number,
    map: GameMap,
    imageX: number,
    imageY: number,
    imageWidth: number,
    imageHeight: number,
    range: number,
    randomTargets: Position[]
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.blockSize = blockSize;
    this.map = map;
    this.imageX = imageX;
    this.imageY = imageY;
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.range = range;
    this.randomTargetIndex = Math.floor(Math.random() * randomTargets.length);
    this.randomTargets = randomTargets;
    this.target = randomTargets[this.randomTargetIndex];
  }

  isInRange(pacman: Pacman): boolean {
    const xDistance = Math.abs(pacman.getMapX() - this.getMapX());
    const yDistance = Math.abs(pacman.getMapY() - this.getMapY());
    return Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range;
  }

  changeRandomDirection() {
    this.randomTargetIndex = (this.randomTargetIndex + 1) % this.randomTargets.length;
  }

  moveProcess(pacman: Pacman) {
    if (this.isInRange(pacman)) {
      this.target = pacman;
    } else {
      this.target = this.randomTargets[this.randomTargetIndex];
    }
    
    this.changeDirectionIfPossible();
    this.moveForwards();
    if (this.checkCollisions()) {
      this.moveBackwards();
    }
  }

  moveBackwards() {
    switch (this.direction) {
      case DIRECTION_RIGHT:
        this.x -= this.speed;
        break;
      case DIRECTION_UP:
        this.y += this.speed;
        break;
      case DIRECTION_LEFT:
        this.x += this.speed;
        break;
      case DIRECTION_BOTTOM:
        this.y -= this.speed;
        break;
    }
  }

  moveForwards() {
    switch (this.direction) {
      case DIRECTION_RIGHT:
        this.x += this.speed;
        break;
      case DIRECTION_UP:
        this.y -= this.speed;
        break;
      case DIRECTION_LEFT:
        this.x -= this.speed;
        break;
      case DIRECTION_BOTTOM:
        this.y += this.speed;
        break;
    }
  }

  checkCollisions(): boolean {
    const blockSize = this.blockSize;
    const y = Math.floor(this.y / blockSize);
    const x = Math.floor(this.x / blockSize);
    const yPlus = Math.floor((this.y + blockSize * 0.9999) / blockSize);
    const xPlus = Math.floor((this.x + blockSize * 0.9999) / blockSize);

    if (y < 0 || y >= this.map.length || x < 0 || x >= this.map[0].length) return true;
    if (yPlus >= this.map.length || xPlus >= this.map[0].length) return true;

    return (
      this.map[y][x] === TILE_WALL ||
      this.map[y][xPlus] === TILE_WALL ||
      this.map[yPlus][x] === TILE_WALL ||
      this.map[yPlus][xPlus] === TILE_WALL
    );
  }

  changeDirectionIfPossible() {
    if (!this.target) return;

    const tempDirection = this.direction;
    const destX = (this.target instanceof Pacman) ? this.target.getMapX() : Math.floor(this.target.x / this.blockSize);
    const destY = (this.target instanceof Pacman) ? this.target.getMapY() : Math.floor(this.target.y / this.blockSize);
    
    const newDir = this.calculateNewDirection(destX, destY);
    if (newDir === undefined) {
      this.direction = tempDirection;
      return;
    }

    this.direction = newDir;

    // Alignment checks
    if (
      this.getMapY() !== this.getMapYRightSide() &&
      (this.direction === DIRECTION_LEFT || this.direction === DIRECTION_RIGHT)
    ) {
      this.direction = DIRECTION_UP;
    }

    if (
      this.getMapX() !== this.getMapXRightSide() &&
      this.direction === DIRECTION_UP
    ) {
      this.direction = DIRECTION_LEFT;
    }

    this.moveForwards();
    if (this.checkCollisions()) {
      this.moveBackwards();
      this.direction = tempDirection;
    } else {
      this.moveBackwards();
    }
  }

  calculateNewDirection(destX: number, destY: number): number | undefined {
    const mapCopy: GameMap = this.map.map(row => [...row]);
    const queue: QueueNode[] = [
      { x: this.getMapX(), y: this.getMapY(), moves: [] }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.x === destX && current.y === destY) {
        return current.moves.length > 0 ? current.moves[0] : DIRECTION_RIGHT;
      }

      mapCopy[current.y][current.x] = TILE_WALL;
      const neighbors = this.addNeighbors(current, mapCopy);
      
      for (const neighbor of neighbors) {
        queue.push(neighbor);
      }
    }

    return undefined;
  }

  addNeighbors(current: QueueNode, map: GameMap): QueueNode[] {
    const neighbors: QueueNode[] = [];
    const rows = map.length;
    const cols = map[0].length;

    // Left
    if (current.x - 1 >= 0 && map[current.y][current.x - 1] !== TILE_WALL) {
      neighbors.push({
        x: current.x - 1,
        y: current.y,
        moves: [...current.moves, DIRECTION_LEFT]
      });
    }

    // Right
    if (current.x + 1 < cols && map[current.y][current.x + 1] !== TILE_WALL) {
      neighbors.push({
        x: current.x + 1,
        y: current.y,
        moves: [...current.moves, DIRECTION_RIGHT]
      });
    }

    // Up
    if (current.y - 1 >= 0 && map[current.y - 1][current.x] !== TILE_WALL) {
      neighbors.push({
        x: current.x,
        y: current.y - 1,
        moves: [...current.moves, DIRECTION_UP]
      });
    }

    // Down
    if (current.y + 1 < rows && map[current.y + 1][current.x] !== TILE_WALL) {
      neighbors.push({
        x: current.x,
        y: current.y + 1,
        moves: [...current.moves, DIRECTION_BOTTOM]
      });
    }

    return neighbors;
  }

  getMapX(): number {
    return Math.floor(this.x / this.blockSize);
  }

  getMapY(): number {
    return Math.floor(this.y / this.blockSize);
  }

  getMapXRightSide(): number {
    return Math.floor(((this.x * 0.99) + this.blockSize) / this.blockSize);
  }

  getMapYRightSide(): number {
    return Math.floor(((this.y * 0.99) + this.blockSize) / this.blockSize);
  }

  draw(ctx: DrawContext) {
    const { ctx: canvasCtx, ghostImg } = ctx;
    
    canvasCtx.save();
    canvasCtx.drawImage(
      ghostImg,
      this.imageX,
      this.imageY,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    canvasCtx.restore();
  }
}
