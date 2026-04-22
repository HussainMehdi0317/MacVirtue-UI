import { DIRECTION_RIGHT, DIRECTION_UP, DIRECTION_LEFT, DIRECTION_BOTTOM, TILE_WALL, TILE_FOOD, TILE_EATEN, GameMap, DrawContext } from './types';

export class Pacman {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: number = DIRECTION_RIGHT;
  nextDirection: number = DIRECTION_RIGHT;
  currentFrame: number = 1;
  frameCount: number = 7;
  blockSize: number;
  map: GameMap;
  score: number = 0;

  constructor(x: number, y: number, width: number, height: number, speed: number, blockSize: number, map: GameMap) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.blockSize = blockSize;
    this.map = map;
  }

  moveProcess() {
    this.changeDirectionIfPossible();
    this.moveForwards();
    if (this.checkCollisions()) {
      this.moveBackwards();
    }
  }

  eat(): number {
    let foodEaten = 0;
    const mapX = this.getMapX();
    const mapY = this.getMapY();

    if (mapY >= 0 && mapY < this.map.length && mapX >= 0 && mapX < this.map[0].length) {
      if (this.map[mapY][mapX] === TILE_FOOD) {
        this.map[mapY][mapX] = TILE_EATEN;
        foodEaten = 1;
        this.score++;
      }
    }
    return foodEaten;
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
    const y = parseInt(this.y.toString());
    const x = parseInt(this.x.toString());
    
    const topLeft = parseInt((y / blockSize).toString());
    const topLeftRight = parseInt(((x + blockSize * 0.9999) / blockSize).toString());
    const bottomLeft = parseInt(((y + blockSize * 0.9999) / blockSize).toString());
    const bottomLeftRight = parseInt(((x + blockSize * 0.9999) / blockSize).toString());

    if (topLeft < 0 || topLeft >= this.map.length || topLeftRight >= this.map[0].length) return true;
    if (bottomLeft >= this.map.length || bottomLeftRight >= this.map[0].length) return true;

    return (
      this.map[topLeft][parseInt((x / blockSize).toString())] === TILE_WALL ||
      this.map[topLeft][topLeftRight] === TILE_WALL ||
      this.map[bottomLeft][parseInt((x / blockSize).toString())] === TILE_WALL ||
      this.map[bottomLeft][bottomLeftRight] === TILE_WALL
    );
  }

  changeDirectionIfPossible() {
    if (this.direction === this.nextDirection) return;

    const tempDirection = this.direction;
    this.direction = this.nextDirection;
    this.moveForwards();
    if (this.checkCollisions()) {
      this.moveBackwards();
      this.direction = tempDirection;
    } else {
      this.moveBackwards();
    }
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

  updateAnimation() {
    this.currentFrame = this.currentFrame === this.frameCount ? 1 : this.currentFrame + 1;
  }

  draw(ctx: DrawContext) {
    const { ctx: canvasCtx, animationImg } = ctx;
    
    canvasCtx.save();
    canvasCtx.translate(
      this.x + this.blockSize / 2,
      this.y + this.blockSize / 2
    );
    canvasCtx.rotate((this.direction * 90 * Math.PI) / 180);
    canvasCtx.translate(
      -this.x - this.blockSize / 2,
      -this.y - this.blockSize / 2
    );
    
    canvasCtx.drawImage(
      animationImg,
      (this.currentFrame - 1) * this.blockSize,
      0,
      this.blockSize,
      this.blockSize,
      this.x,
      this.y,
      this.width,
      this.height
    );
    
    canvasCtx.restore();
  }
}
