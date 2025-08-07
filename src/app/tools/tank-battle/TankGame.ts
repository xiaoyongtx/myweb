export class TankGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private setScore: (score: number) => void;
  private setGameStatus: (status: 'playing' | 'paused' | 'gameOver') => void;
  
  private score = 0;
  private gameRunning = true;
  private gamePaused = false;
  
  // 游戏对象
  private player: PlayerTank;
  private enemies: EnemyTank[] = [];
  private bullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  
  // 键盘状态
  private keys: { [key: string]: boolean } = {};
  
  // 敌人生成计时器
  private enemySpawnTimer = 0;
  private enemySpawnInterval = 120; // 2秒（60fps）
  
  private animationId: number | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    setScore: (score: number) => void,
    setGameStatus: (status: 'playing' | 'paused' | 'gameOver') => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setScore = setScore;
    this.setGameStatus = setGameStatus;
    
    this.player = new PlayerTank(400, 500);
    
    this.init();
  }
  
  private init() {
    // 键盘事件监听
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    
    // 开始游戏循环
    this.gameLoop();
  }
  
  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    // 阻止空格键滚动页面
    if (e.code === 'Space') {
      e.preventDefault();
    }
  };
  
  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };
  
  private gameLoop = () => {
    if (this.gameRunning && !this.gamePaused) {
      this.update();
      this.render();
    }
    this.animationId = requestAnimationFrame(this.gameLoop);
  };
  
  private update() {
    // 更新玩家
    this.player.update(this.keys);
    
    // 玩家射击
    if (this.keys['Space'] && this.player.canShoot()) {
      this.bullets.push(new Bullet(
        this.player.x + this.player.width / 2,
        this.player.y,
        0, -5, 'player'
      ));
      this.player.lastShot = Date.now();
    }
    
    // 生成敌人
    this.enemySpawnTimer++;
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }
    
    // 更新敌人
    this.enemies.forEach(enemy => {
      enemy.update();
      
      // 敌人射击
      if (Math.random() < 0.01) { // 1%概率射击
        this.enemyBullets.push(new Bullet(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height,
          0, 3, 'enemy'
        ));
      }
    });
    
    // 更新子弹
    this.bullets = this.bullets.filter(bullet => {
      bullet.update();
      return bullet.y > 0;
    });
    
    this.enemyBullets = this.enemyBullets.filter(bullet => {
      bullet.update();
      return bullet.y < this.canvas.height;
    });
    
    // 移除超出边界的敌人
    this.enemies = this.enemies.filter(enemy => enemy.y < this.canvas.height + 50);
    
    // 碰撞检测
    this.checkCollisions();
  }
  
  private spawnEnemy() {
    const x = Math.random() * (this.canvas.width - 40);
    this.enemies.push(new EnemyTank(x, 50));
  }
  
  private checkCollisions() {
    // 玩家子弹击中敌人
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        if (this.isColliding(bullet, enemy)) {
          this.bullets.splice(bulletIndex, 1);
          this.enemies.splice(enemyIndex, 1);
          this.score += 100;
          this.setScore(this.score);
        }
      });
    });
    
    // 敌人子弹击中玩家
    this.enemyBullets.forEach((bullet, bulletIndex) => {
      if (this.isColliding(bullet, this.player)) {
        this.gameOver();
      }
    });
    
    // 敌人撞到玩家
    this.enemies.forEach(enemy => {
      if (this.isColliding(enemy, this.player)) {
        this.gameOver();
      }
    });
  }
  
  private isColliding(obj1: any, obj2: any): boolean {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }
  
  private gameOver() {
    this.gameRunning = false;
    this.setGameStatus('gameOver');
  }
  
  private render() {
    // 清空画布
    this.ctx.fillStyle = '#1f2937';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制游戏对象
    this.player.render(this.ctx);
    
    this.enemies.forEach(enemy => enemy.render(this.ctx));
    this.bullets.forEach(bullet => bullet.render(this.ctx));
    this.enemyBullets.forEach(bullet => bullet.render(this.ctx));
  }
  
  public pause() {
    this.gamePaused = true;
  }
  
  public resume() {
    this.gamePaused = false;
  }
  
  public restart() {
    this.score = 0;
    this.gameRunning = true;
    this.gamePaused = false;
    this.player = new PlayerTank(400, 500);
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.enemySpawnTimer = 0;
    this.setScore(0);
  }
  
  public destroy() {
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }
}

class PlayerTank {
  public x: number;
  public y: number;
  public width = 40;
  public height = 40;
  private speed = 4;
  public lastShot = 0;
  private shootCooldown = 200; // 毫秒
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  
  update(keys: { [key: string]: boolean }) {
    // 移动控制
    if (keys['KeyA'] && this.x > 0) {
      this.x -= this.speed;
    }
    if (keys['KeyD'] && this.x < 800 - this.width) {
      this.x += this.speed;
    }
    if (keys['KeyW'] && this.y > 0) {
      this.y -= this.speed;
    }
    if (keys['KeyS'] && this.y < 600 - this.height) {
      this.y += this.speed;
    }
  }
  
  canShoot(): boolean {
    return Date.now() - this.lastShot > this.shootCooldown;
  }
  
  render(ctx: CanvasRenderingContext2D) {
    // 绘制坦克主体
    ctx.fillStyle = '#10b981';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 绘制炮管
    ctx.fillStyle = '#059669';
    ctx.fillRect(this.x + this.width / 2 - 2, this.y - 10, 4, 15);
    
    // 绘制坦克细节
    ctx.fillStyle = '#065f46';
    ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
  }
}

class EnemyTank {
  public x: number;
  public y: number;
  public width = 40;
  public height = 40;
  private speed = 1;
  private direction = Math.random() < 0.5 ? -1 : 1;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  
  update() {
    // 简单的左右移动
    this.x += this.speed * this.direction;
    
    // 边界反弹
    if (this.x <= 0 || this.x >= 800 - this.width) {
      this.direction *= -1;
    }
    
    // 缓慢下移
    this.y += 0.5;
  }
  
  render(ctx: CanvasRenderingContext2D) {
    // 绘制敌方坦克
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 绘制炮管
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(this.x + this.width / 2 - 2, this.y + this.height, 4, 10);
    
    // 绘制坦克细节
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
  }
}

class Bullet {
  public x: number;
  public y: number;
  private vx: number;
  private vy: number;
  public width = 4;
  public height = 8;
  private type: string;
  
  constructor(x: number, y: number, vx: number, vy: number, type: string) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  
  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.type === 'player' ? '#fbbf24' : '#f97316';
    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}