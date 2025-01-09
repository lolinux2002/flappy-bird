const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScore = document.getElementById('finalScore');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');

    // Game settings
    const GRAVITY = 0.5;
    const FLAP_STRENGTH = -8;
    const PIPE_GAP = 150;
    const PIPE_WIDTH = 80;
    const PIPE_SPEED = 2;
    const BIRD_SIZE = 40;
    const GROUND_HEIGHT = 20;

    // Game state
    let bird;
    let pipes;
    let score;
    let gameOver;
    let animationFrame;
    let backgroundReady = false;

    // Background image
    const background = new Image();
    background.src = 'background.jpg';
    background.onload = () => {
      backgroundReady = true;
      initGame(); // Initialize game after background is loaded
    };

    // Initialize game
    function initGame() {
      canvas.width = 480;
      canvas.height = 640;

      bird = {
        x: 100,
        y: canvas.height / 2 - BIRD_SIZE / 2,
        velocity: 0,
        size: BIRD_SIZE
      };

      pipes = [];
      score = 0;
      gameOver = false;
      startScreen.classList.remove('hidden');
      gameOverScreen.classList.add('hidden');
    }

    // Start game
    function startGame() {
      if (!backgroundReady) {
        alert('Please wait for background to load');
        return;
      }
      startScreen.classList.add('hidden');
      gameLoop();
    }

    // Game loop
    function gameLoop() {
      if (gameOver) {
        cancelAnimationFrame(animationFrame);
        gameOverScreen.classList.remove('hidden');
        finalScore.textContent = score;
        return;
      }

      update();
      draw();
      animationFrame = requestAnimationFrame(gameLoop);
    }

    // Update game state
    function update() {
      // Update bird
      bird.velocity += GRAVITY;
      bird.y += bird.velocity;

      // Check ground collision
      if (bird.y + bird.size > canvas.height - GROUND_HEIGHT) {
        gameOver = true;
      }

      // Update pipes
      for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= PIPE_SPEED;

        // Check for pipe collision
        if (checkCollision(bird, pipes[i])) {
          gameOver = true;
        }

        // Remove off-screen pipes
        if (pipes[i].x + PIPE_WIDTH < 0) {
          pipes.splice(i, 1);
        }

        // Check for score
        if (pipes[i].x + PIPE_WIDTH === bird.x) {
          score++;
        }
      }

      // Add new pipes
      if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        createPipe();
      }
    }

    // Draw game elements
    function draw() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      if (backgroundReady) {
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      }

      // Draw bird
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(bird.x + bird.size / 2, bird.y + bird.size / 2, bird.size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw pipes
      ctx.fillStyle = '#4CAF50';
      pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, PIPE_WIDTH, pipe.bottomHeight);
      });

      // Draw ground
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

      // Draw score
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${score}`, 20, 40);
    }

    // Create new pipe
    function createPipe() {
      const minHeight = 50;
      const maxHeight = canvas.height - PIPE_GAP - minHeight - GROUND_HEIGHT;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
      const bottomHeight = canvas.height - topHeight - PIPE_GAP - GROUND_HEIGHT;

      pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomHeight: bottomHeight
      });
    }

    // Check collision between bird and pipe
    function checkCollision(bird, pipe) {
      const birdRight = bird.x + bird.size;
      const birdBottom = bird.y + bird.size;
      const pipeRight = pipe.x + PIPE_WIDTH;

      // Check if bird is within pipe width
      if (birdRight > pipe.x && bird.x < pipeRight) {
        // Check if bird is above top pipe or below bottom pipe
        if (bird.y < pipe.topHeight || birdBottom > canvas.height - pipe.bottomHeight - GROUND_HEIGHT) {
          return true;
        }
      }
      return false;
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !gameOver && bird) {
        bird.velocity = FLAP_STRENGTH;
      }
    });

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
