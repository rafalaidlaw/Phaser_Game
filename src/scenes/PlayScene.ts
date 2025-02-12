import Phaser from "phaser";
import { PRELOAD_CONFIG } from "..";
import { Player } from "../entities/Player";

import { SpriteWithDynamicBody } from "../types";

import { GameScene } from "./GameScene";

class PlayScene extends GameScene {

        player: Player;
        ground: Phaser.GameObjects.TileSprite;
        obstacles: Phaser.Physics.Arcade.Group;
        startTrigger: SpriteWithDynamicBody;
        gameOverContainer: Phaser.GameObjects.Container;
        gameOverText: Phaser.GameObjects.Image;
        restartText: Phaser.GameObjects.Image;
        spawnInterval: number = 1500;
        spawnTime: number = 0;
        gameSpeed: number = 8;
        

        constructor() {
                super("PlayScene"); 
        }
        
        create() {
                this.createEnviornment();
                this.createPlayer();
                this.createObstacles();
                this.createGameOverContainer();
                this.handleGameStart();
                this.handleObstacleCollisions();
                this.handleGameRestart();
                this.createAnimations();
                
        }
        update(time: number, delta: number): void {
                if (!this.isGameRunning) { return; }
                this.spawnTime += delta;

                if (this.spawnTime >= this.spawnInterval) {
                  this.spawnObstacle();
                  this.spawnTime = 0;
                }
                Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);

                this.obstacles.getChildren().forEach((obstacle: SpriteWithDynamicBody) => {
                        if (obstacle.getBounds().right < 0) {
                          this.obstacles.remove(obstacle);
                        }
                      });
                      
                      this.ground.tilePositionX += this.gameSpeed;
              }

        createPlayer(){
                this.player = new Player(this, 0, this.gameHeight);    

        }

        createEnviornment(){
                this.ground = this.add
                .tileSprite(0, this.gameHeight, 88, 26, "ground")
                .setOrigin(0,1)

        }
        createObstacles(){
                this.obstacles = this.physics.add.group();

        }
        createGameOverContainer(){
                this.gameOverText = this.add.image(0, 0, "game-over");
                this.restartText = this.add.image(0, 80, "restart").setInteractive();
                this.gameOverContainer = this.add
                .container(this.gameWidth / 2, (this.gameHeight / 2) - 50)
                .add([this.gameOverText, this.restartText])
                .setAlpha(0);

        }

        createAnimations() {
                this.anims.create({
                  key: "enemy-bird-fly",
                  frames: this.anims.generateFrameNumbers("enemy-bird"),
                  frameRate: 6,
                  repeat: -1
                });
              }
        

        spawnObstacle() {
                
                const obstacleNum = Math.floor(Math.random() * (PRELOAD_CONFIG.cactusesCount + PRELOAD_CONFIG.birdsCount)) + 1;
                const distance = Phaser.Math.Between(150, 300);
                let obstacle;
                if (obstacleNum > PRELOAD_CONFIG.cactusesCount) {
                  const enemyPossibleHeight = [20, 70];
                  const enemyHeight = enemyPossibleHeight[Math.floor(Math.random() * 2)]
                  obstacle = this.obstacles.create(this.gameWidth + distance, this.gameHeight - enemyHeight, `enemy-bird`)
      obstacle.play("enemy-bird-fly", true);
                } else {
                  obstacle = this.obstacles.create(this.gameWidth + distance, this.gameHeight, `obstacle-${obstacleNum}`)
                }
                
                obstacle
                 .setOrigin(0, 1)
                 .setImmovable();
    
        }

        handleGameStart(){
                this.startTrigger = this.physics.add.sprite(0, 30, null).setOrigin(0, 1).setAlpha(0);
                this.physics.add.overlap(this.startTrigger, this.player, () => {
                        if (this.startTrigger.y === 30) {
                                this.startTrigger.body.reset(0, this.gameHeight);
                                
                                return;
                              }
                              this.startTrigger.body.reset(9999, 9999);
                              const rollOutEvent = this.time.addEvent({
                                delay: 1000 / 60,
                                loop: true,
                                callback: () => {
                                        this.player.playRunAnimation();
                                        this.player.setVelocityX(80);
                                        this.ground.width += (17 * 2);
                                        if (this.ground.width >= this.gameWidth) {
                                          rollOutEvent.remove();
                                          this.ground.width = this.gameWidth;
                                          this.player.setVelocityX(0);
                                          this.isGameRunning = true;
                                  }
                                }
                              });                    
                         });
                
        }
        handleObstacleCollisions(){
                this.physics.add.collider(this.obstacles, this.player, () => {
                        
                        this.isGameRunning = false;
                        this.physics.pause();
                        this.anims.pauseAll();
                        this.player.die();
                        this.gameOverContainer.setAlpha(1);
                        this.spawnTime = 0;
                        this.gameSpeed = 5;
                        
                      });

        }
        handleGameRestart(){
                this.restartText.on("pointerdown", () =>
                        {
                                this.physics.resume();
                                this.player.setVelocityY(0);
                                this.obstacles.clear(true, true);
                                this.gameOverContainer.setAlpha(0);
                                this.anims.resumeAll();
                                this.isGameRunning = true;
                        })

        }

}
export default PlayScene;