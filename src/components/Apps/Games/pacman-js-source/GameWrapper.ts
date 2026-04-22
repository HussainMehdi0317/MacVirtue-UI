import { Pacman } from './Pacman';
import { Ghost } from './Ghost';
import { DIRECTION_RIGHT, DIRECTION_UP, DIRECTION_LEFT, DIRECTION_BOTTOM, DrawContext, Position } from './types';

// Game map
const map = [
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

const getCanvas = (): HTMLCanvasElement | null => {
  const el = document.getElementById("canvas");
  return el as HTMLCanvasElement | null;
};
const getCanvasContext = (): CanvasRenderingContext2D | null => {
  const canvas = getCanvas();
  return canvas ? canvas.getContext("2d") : null;
};
const getPacmanFrames = (): HTMLImageElement | null => {
  const el = document.getElementById("animation");
  return el as HTMLImageElement | null;
};
const getGhostFrames = (): HTMLImageElement | null => {
  const el = document.getElementById("ghosts");
  return el as HTMLImageElement | null;
};

let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let pacmanFrames: HTMLImageElement | null = null;
let ghostFrames: HTMLImageElement | null = null;

let lives = 3;
let pacman: Pacman | null = null;
let oneBlockSize = 20;
let score = 0;
let ghosts: Ghost[] = [];

const ghostRandomTargets: Position[] = [
  { x: 0, y: 0 },
  { x: 20, y: 0 },
  { x: 0, y: 22 },
  { x: 20, y: 22 }
];

let fps = 30;
let gameLoopInterval: NodeJS.Timeout | null = null;

const createNewPacman = (): void => {
    if (!map) return;
    pacman = new Pacman(
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize / 5,
        oneBlockSize,
        map
    );
};

const createGhosts = (): void => {
    if (!pacman || !map) return;
    ghosts = [];
    const ghostCount = 4;
    const ghostImageLocations = [
        { x: 0, y: 0 },
        { x: 176, y: 0 },
        { x: 0, y: 121 },
        { x: 176, y: 121 },
    ];

    for (let i = 0; i < ghostCount; i++) {
        const newGhost = new Ghost(
            9 * oneBlockSize + (i % 2 === 0 ? 0 : oneBlockSize),
            10 * oneBlockSize + (i % 2 === 0 ? 0 : oneBlockSize),
            oneBlockSize,
            oneBlockSize,
            pacman.speed / 2,
            oneBlockSize,
            map,
            ghostImageLocations[i].x,
            ghostImageLocations[i].y,
            176,
            121,
            6 + i,
            ghostRandomTargets
        );
        ghosts.push(newGhost);
    }
};

const drawWalls = (): void => {
    if (!canvasContext || !canvas) return;
    const wallSpaceWidth = oneBlockSize / 1.6;
    const wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
    const wallInnerColor = "black";

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] === 1) {
                canvasContext.fillStyle = "#342DCA";
                canvasContext.fillRect(
                    j * oneBlockSize,
                    i * oneBlockSize,
                    oneBlockSize,
                    oneBlockSize
                );

                if (j > 0 && map[i][j - 1] === 1) {
                    canvasContext.fillStyle = wallInnerColor;
                    canvasContext.fillRect(
                        j * oneBlockSize,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth
                    );
                }

                if (j < map[0].length - 1 && map[i][j + 1] === 1) {
                    canvasContext.fillStyle = wallInnerColor;
                    canvasContext.fillRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth
                    );
                }

                if (i < map.length - 1 && map[i + 1][j] === 1) {
                    canvasContext.fillStyle = wallInnerColor;
                    canvasContext.fillRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset
                    );
                }

                if (i > 0 && map[i - 1][j] === 1) {
                    canvasContext.fillStyle = wallInnerColor;
                    canvasContext.fillRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset
                    );
                }
            }
        }
    }
};

const drawFoods = (): void => {
    if (!canvasContext) return;
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] === 2) {
                canvasContext.fillStyle = "#FEB897";
                canvasContext.fillRect(
                    j * oneBlockSize + oneBlockSize / 3,
                    i * oneBlockSize + oneBlockSize / 3,
                    oneBlockSize / 3,
                    oneBlockSize / 3
                );
            }
        }
    }
};

const drawGhosts = (): void => {
    if (!canvasContext || !ghostFrames) return;
    const ctx: DrawContext = {
        ctx: canvasContext,
        blockSize: oneBlockSize,
        animationImg: pacmanFrames!,
        ghostImg: ghostFrames
    };
    for (const ghost of ghosts) {
        ghost.draw(ctx);
    }
};

const drawScore = (): void => {
    if (!canvasContext) return;
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText(
        "Score: " + score,
        0,
        oneBlockSize * (map.length + 1)
    );
};

const drawRemainingLives = (): void => {
    if (!canvasContext || !pacmanFrames) return;
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Lives: ", 220, oneBlockSize * (map.length + 1));

    for (let i = 0; i < lives; i++) {
        canvasContext.drawImage(
            pacmanFrames,
            2 * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            350 + i * oneBlockSize,
            oneBlockSize * map.length + 2,
            oneBlockSize,
            oneBlockSize
        );
    }
};

const draw = (): void => {
    if (!canvasContext || !canvas) return;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = "black";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    drawWalls();
    drawFoods();
    drawGhosts();
    if (pacman) {
        const ctx: DrawContext = {
            ctx: canvasContext,
            blockSize: oneBlockSize,
            animationImg: pacmanFrames!,
            ghostImg: ghostFrames!
        };
        pacman.updateAnimation();
        pacman.draw(ctx);
    }
    drawScore();
    drawRemainingLives();
};

const gameLoop = (): void => {
    if (!pacman) return;
    
    pacman.moveProcess();
    pacman.eat();
    
    for (const ghost of ghosts) {
        ghost.moveProcess(pacman);
    }
    
    draw();
};

const initializeGame = (): void => {
    canvas = getCanvas();
    canvasContext = getCanvasContext();
    pacmanFrames = getPacmanFrames();
    ghostFrames = getGhostFrames();

    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }

    const cols = 21;
    const rows = 23;
    canvas.width = cols * oneBlockSize;
    canvas.height = rows * oneBlockSize + 2 * oneBlockSize;

    createNewPacman();
    createGhosts();

    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
    }
    gameLoopInterval = setInterval(gameLoop, 1000 / fps);
    
    draw();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    setTimeout(initializeGame, 100);
}

// Keyboard controls
window.addEventListener("keydown", (event: KeyboardEvent) => {
    if (!pacman) return;
    
    const k = event.keyCode;
    setTimeout(() => {
        if (k === 37 || k === 65) {
            // left arrow or a
            pacman!.nextDirection = DIRECTION_LEFT;
        } else if (k === 38 || k === 87) {
            // up arrow or w
            pacman!.nextDirection = DIRECTION_UP;
        } else if (k === 39 || k === 68) {
            // right arrow or d
            pacman!.nextDirection = DIRECTION_RIGHT;
        } else if (k === 40 || k === 83) {
            // down arrow or s
            pacman!.nextDirection = DIRECTION_BOTTOM;
        }
    }, 1);
});
