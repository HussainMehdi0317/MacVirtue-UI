import { GameMap, GameState, TILE_FOOD, TILE_EMPTY, DIRECTION_RIGHT, Position } from './types';
import { Pacman } from './Pacman';
import { Ghost } from './Ghost';

export class PacManGame {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  blockSize: number = 20;
  fps: number = 10;
  gameLoopId: number | null = null;
  
  pacman: Pacman | null = null;
  ghosts: Ghost[] = [];
  map: GameMap = [];
  
  state: GameState = {
    score: 0,
    lives: 3,
    gameOver: false,
    isPaused: false
  };

  animationImg: HTMLImageElement | null = null;
  ghostImg: HTMLImageElement | null = null;
  
  animationFrameCount: number = 0;
  ghostAnimationInterval: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2D context');
    this.ctx = ctx;
  }

  async loadImages(animationSrc: string, ghostSrc: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let loaded = 0;
      
      console.log('Starting image load...', { animationSrc, ghostSrc });
      
      this.animationImg = new Image();
      this.animationImg.onload = () => {
        console.log('Animation image loaded');
        loaded++;
        if (loaded === 2) {
          console.log('All images loaded!');
          resolve();
        }
      };
      this.animationImg.onerror = (err) => {
        console.error('Animation image failed to load:', err);
        reject(new Error(`Failed to load animation image: ${animationSrc}`));
      };
      this.animationImg.src = animationSrc;

      this.ghostImg = new Image();
      this.ghostImg.onload = () => {
        console.log('Ghost image loaded');
        loaded++;
        if (loaded === 2) {
          console.log('All images loaded!');
          resolve();
        }
      };
      this.ghostImg.onerror = (err) => {
        console.error('Ghost image failed to load:', err);
        reject(new Error(`Failed to load ghost image: ${ghostSrc}`));
      };
      this.ghostImg.src = ghostSrc;
    });
  }

  createDefaultMap(): GameMap {
    return [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
      [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
      [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
  }

  init() {
    this.map = this.createDefaultMap();
    this.state.score = 0;
    this.state.lives = 3;
    this.state.gameOver = false;

    // Create pacman
    this.pacman = new Pacman(
      this.blockSize,
      this.blockSize,
      this.blockSize,
      this.blockSize,
      this.blockSize / 5,
      this.blockSize,
      this.map
    );

    // Create ghosts
    const ghostTargets: Position[] = [
      { x: this.blockSize, y: this.blockSize },
      { x: this.blockSize, y: (this.map.length - 2) * this.blockSize },
      { x: (this.map[0].length - 2) * this.blockSize, y: this.blockSize },
      {
        x: (this.map[0].length - 2) * this.blockSize,
        y: (this.map.length - 2) * this.blockSize,
      },
    ];

    const ghostImageLocations = [
      { x: 0, y: 0 },
      { x: 176, y: 0 },
      { x: 0, y: 121 },
      { x: 176, y: 121 },
    ];

    this.ghosts = [];
    for (let i = 0; i < 4; i++) {
      const ghost = new Ghost(
        (9 + i) * this.blockSize,
        10 * this.blockSize,
        this.blockSize,
        this.blockSize,
        this.blockSize / 5,
        this.blockSize,
        this.map,
        ghostImageLocations[i].x,
        ghostImageLocations[i].y,
        176,
        121,
        15,
        ghostTargets
      );
      this.ghosts.push(ghost);
    }
  }

  update() {
    if (this.state.isPaused || this.state.gameOver || !this.pacman) return;

    this.pacman.moveProcess();
    this.pacman.eat();

    for (const ghost of this.ghosts) {
      ghost.moveProcess(this.pacman);
    }

    // Check ghost collision
    for (const ghost of this.ghosts) {
      if (ghost.getMapX() === this.pacman.getMapX() && ghost.getMapY() === this.pacman.getMapY()) {
        this.state.lives--;
        if (this.state.lives === 0) {
          this.state.gameOver = true;
        } else {
          this.resetPositions();
        }
      }
    }

    // Update animations
    this.animationFrameCount++;
    if (this.animationFrameCount % 3 === 0) {
      this.pacman.updateAnimation();
    }

    this.ghostAnimationInterval++;
    if (this.ghostAnimationInterval >= 10000 / this.fps) {
      for (const ghost of this.ghosts) {
        ghost.changeRandomDirection();
      }
      this.ghostAnimationInterval = 0;
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw a test indicator
    this.ctx.fillStyle = 'cyan';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 10, 20);
    this.ctx.fillText(`Images loaded: ${this.animationImg ? 'Yes' : 'No'} / ${this.ghostImg ? 'Yes' : 'No'}`, 10, 35);

    // If images aren't loaded yet, just show loading message
    if (!this.animationImg || !this.ghostImg) {
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading images...', this.canvas.width / 2, this.canvas.height / 2);
      return;
    }

    // Draw walls
    this.drawWalls();

    // Draw food
    this.drawFood();

    // Draw pacman and ghosts
    if (this.pacman) {
      this.pacman.draw({
        ctx: this.ctx,
        blockSize: this.blockSize,
        animationImg: this.animationImg,
        ghostImg: this.ghostImg
      });
    }

    for (const ghost of this.ghosts) {
      ghost.draw({
        ctx: this.ctx,
        blockSize: this.blockSize,
        animationImg: this.animationImg,
        ghostImg: this.ghostImg
      });
    }

    // Draw HUD
    this.drawHUD();
  }

  drawWalls() {
    this.ctx.fillStyle = '#1a1aff';
    this.ctx.strokeStyle = '#4d4dff';
    this.ctx.lineWidth = 2;

    const wallWidth = this.blockSize / 1.6;
    const wallOffset = (this.blockSize - wallWidth) / 2;

    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[0].length; j++) {
        if (this.map[i][j] === 1) {
          this.ctx.fillRect(
            j * this.blockSize + wallOffset,
            i * this.blockSize + wallOffset,
            wallWidth,
            wallWidth
          );
        }
      }
    }
  }

  drawFood() {
    this.ctx.fillStyle = '#FEB897';

    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[0].length; j++) {
        if (this.map[i][j] === 2) {
          this.ctx.fillRect(
            j * this.blockSize + this.blockSize / 3,
            i * this.blockSize + this.blockSize / 3,
            this.blockSize / 3,
            this.blockSize / 3
          );
        }
      }
    }
  }

  drawHUD() {
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(`Score: ${this.state.score}`, 10, this.canvas.height - 10);
    this.ctx.fillText(`Lives: ${this.state.lives}`, this.canvas.width / 2 - 40, this.canvas.height - 10);

    if (this.state.gameOver) {
      this.ctx.font = '32px Arial';
      this.ctx.fillStyle = 'red';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.textAlign = 'left';
    }
  }

  resetPositions() {
    if (!this.pacman) return;
    this.pacman.x = this.blockSize;
    this.pacman.y = this.blockSize;
    this.pacman.direction = DIRECTION_RIGHT;

    for (let i = 0; i < this.ghosts.length; i++) {
      this.ghosts[i].x = (9 + i) * this.blockSize;
      this.ghosts[i].y = 10 * this.blockSize;
    }
  }

  handleKeyPress(key: string) {
    if (!this.pacman) return;

    switch (key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        this.pacman.nextDirection = 3; // UP
        break;
      case 'arrowdown':
      case 's':
        this.pacman.nextDirection = 1; // BOTTOM
        break;
      case 'arrowleft':
      case 'a':
        this.pacman.nextDirection = 2; // LEFT
        break;
      case 'arrowright':
      case 'd':
        this.pacman.nextDirection = 4; // RIGHT
        break;
    }
  }

  start() {
    console.log('Game.start() called');
    this.init();
    console.log('Game initialized');
    let drawCount = 0;
    this.gameLoopId = window.setInterval(() => {
      drawCount++;
      if (drawCount === 1) {
        console.log('First draw loop executed');
      }
      this.update();
      this.draw();
    }, 1000 / this.fps);
    console.log('Game loop started with interval ID:', this.gameLoopId);
  }

  stop() {
    if (this.gameLoopId) {
      clearInterval(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  pause() {
    this.state.isPaused = !this.state.isPaused;
  }

  getState(): GameState {
    return { ...this.state };
  }

  getScore(): number {
    return this.state.score;
  }

  getLives(): number {
    return this.state.lives;
  }

  isGameOver(): boolean {
    return this.state.gameOver;
  }
}
