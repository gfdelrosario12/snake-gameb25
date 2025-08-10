'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MobileControls from '@/components/mobile-controls'
import StatsMonitor from '@/components/stats-monitor'
import ControlBox from '@/components/control-box'

interface Position {
  x: number
  y: number
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

interface GameState {
  snake: Position[]
  apple: Position
  direction: Direction
  score: number
  gameOver: boolean
  gameStarted: boolean
  applesEaten: number
}

const GRID_SIZE: number = 20
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION: Direction = 'RIGHT'
const GAME_SPEED: number = 150
const MAX_APPLES_PER_SESSION: number = 10

export default function SnakeEvolution(): JSX.Element {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    apple: { x: 15, y: 10 },
    direction: INITIAL_DIRECTION,
    score: 0,
    gameOver: false,
    gameStarted: false,
    applesEaten: 0,
  })
  
  const [highScore, setHighScore] = useState<number>(0)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const lastDirectionRef = useRef<Direction>(INITIAL_DIRECTION)
  const fpsRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)

  // Initialize high score and mobile detection
  useEffect(() => {
    const stored = localStorage.getItem('snakeHighScore')
    if (stored) {
      setHighScore(parseInt(stored, 10))
    }
    
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Generate random apple position
  const generateApple = useCallback((snake: Position[]): Position => {
    let newApple: Position
    do {
      newApple = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (snake.some(segment => segment.x === newApple.x && segment.y === newApple.y))
    return newApple
  }, [])

  // Check collision
  const checkCollision = useCallback((head: Position, snake: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true
    }
    
    // Self collision
    return snake.some(segment => segment.x === head.x && segment.y === head.y)
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || !prevState.gameStarted) return prevState

      const head = { ...prevState.snake[0] }
      const currentDirection = lastDirectionRef.current

      // Move head based on direction
      switch (currentDirection) {
        case 'UP':
          head.y -= 1
          break
        case 'DOWN':
          head.y += 1
          break
        case 'LEFT':
          head.x -= 1
          break
        case 'RIGHT':
          head.x += 1
          break
      }

      // Check collision
      if (checkCollision(head, prevState.snake)) {
        return { ...prevState, gameOver: true }
      }

      const newSnake = [head, ...prevState.snake]
      let newScore = prevState.score
      let newApplesEaten = prevState.applesEaten
      let newApple = prevState.apple

      // Check apple collision
      if (head.x === prevState.apple.x && head.y === prevState.apple.y) {
        newScore += 10
        newApplesEaten += 1
        newApple = generateApple(newSnake)
        
        // Check session completion
        if (newApplesEaten >= MAX_APPLES_PER_SESSION) {
          setTimeout(() => {
            setGameState(prev => ({ ...prev, gameOver: true }))
          }, 100)
        }
      } else {
        newSnake.pop()
      }

      return {
        ...prevState,
        snake: newSnake,
        apple: newApple,
        score: newScore,
        applesEaten: newApplesEaten,
        direction: currentDirection,
      }
    })
  }, [generateApple, checkCollision])

  // Handle direction change
  const changeDirection = useCallback((newDirection: Direction): void => {
    if (!gameState.gameStarted || gameState.gameOver) return
    
    // Prevent reversing into itself
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    }
    
    if (opposites[lastDirectionRef.current] !== newDirection) {
      lastDirectionRef.current = newDirection
    }
  }, [gameState.gameStarted, gameState.gameOver])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      switch (e.key.toLowerCase()) {
        case 'w':
          changeDirection('UP')
          break
        case 's':
          changeDirection('DOWN')
          break
        case 'a':
          changeDirection('LEFT')
          break
        case 'd':
          changeDirection('RIGHT')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [changeDirection])

  // Game loop effect
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
      gameLoopRef.current = setInterval(() => {
        const now = performance.now()
        const delta = now - lastFrameTimeRef.current
        if (delta > 0) {
          fpsRef.current = Math.round(1000 / delta)
        }
        lastFrameTimeRef.current = now
        gameLoop()
      }, GAME_SPEED)
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
      gameLoopRef.current = null
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameState.gameStarted, gameState.gameOver, gameLoop])

  // Start game
  const startGame = (): void => {
    const newApple = generateApple(INITIAL_SNAKE)
    setGameState({
      snake: INITIAL_SNAKE,
      apple: newApple,
      direction: INITIAL_DIRECTION,
      score: 0,
      gameOver: false,
      gameStarted: true,
      applesEaten: 0,
    })
    lastDirectionRef.current = INITIAL_DIRECTION
  }

  // End game and update high score
  useEffect(() => {
    if (gameState.gameOver && gameState.score > highScore) {
      setHighScore(gameState.score)
      localStorage.setItem('snakeHighScore', gameState.score.toString())
    }
  }, [gameState.gameOver, gameState.score, highScore])

  // Restart game
  const restartGame = (): void => {
    startGame()
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono">
      {/* Stats Monitor */}
      <StatsMonitor 
        fps={fpsRef.current}
        isMobile={isMobile}
        score={gameState.score}
        position={gameState.snake[0] || { x: 0, y: 0 }}
      />

      {/* Control Box */}
      <ControlBox isMobile={isMobile} />

      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        {/* Game Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold text-green-400 pixel-text">
            🐍 SNAKE EVOLUTION
          </h1>
          <p className="text-sm md:text-base text-green-300">
            Collect {MAX_APPLES_PER_SESSION} apples to complete your evolution!
          </p>
        </div>

        {/* Score Display */}
        <div className="flex space-x-4 text-center">
          <Card className="bg-gray-900 border-green-400">
            <CardContent className="p-3">
              <div className="text-green-400 text-lg font-bold">Score: {gameState.score}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-green-400">
            <CardContent className="p-3">
              <div className="text-green-400 text-lg font-bold">High: {highScore}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-green-400">
            <CardContent className="p-3">
              <div className="text-green-400 text-lg font-bold">
                Apples: {gameState.applesEaten}/{MAX_APPLES_PER_SESSION}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        {gameState.gameStarted ? (
          <div className="relative">
            <div 
              className="grid gap-0 bg-gray-900 border-4 border-green-400 pixel-border"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: isMobile ? '320px' : '400px',
                height: isMobile ? '320px' : '400px',
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const x = index % GRID_SIZE
                const y = Math.floor(index / GRID_SIZE)
                
                const isSnakeHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y
                const isSnakeBody = gameState.snake.slice(1).some(segment => segment.x === x && segment.y === y)
                const isApple = gameState.apple.x === x && gameState.apple.y === y
                
                let cellClass = 'w-full h-full border border-gray-800'
                
                if (isSnakeHead) {
                  cellClass += ' bg-green-400 snake-head'
                } else if (isSnakeBody) {
                  cellClass += ' bg-green-600 snake-body'
                } else if (isApple) {
                  cellClass += ' bg-red-500 apple animate-pulse'
                } else {
                  cellClass += ' bg-gray-950'
                }
                
                return (
                  <div key={index} className={cellClass}>
                    {isSnakeHead && '🐍'}
                    {isApple && '🍎'}
                  </div>
                )
              })}
            </div>

            {/* Game Over Overlay */}
            {gameState.gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-2xl md:text-4xl font-bold text-red-400">
                  {gameState.applesEaten >= MAX_APPLES_PER_SESSION ? 'EVOLUTION COMPLETE!' : 'GAME OVER'}
                </h2>
                <div className="space-y-2">
                  <p className="text-green-400">Final Score: {gameState.score}</p>
                  <p className="text-green-400">Apples Collected: {gameState.applesEaten}</p>
                  {gameState.applesEaten >= MAX_APPLES_PER_SESSION && (
                    <Badge className="bg-green-600 text-white">
                      🏆 SESSION COMPLETED!
                    </Badge>
                  )}
                </div>
                <Button 
                  onClick={restartGame}
                  className="bg-green-600 hover:bg-green-700 text-white pixel-button"
                >
                  🔄 PLAY AGAIN
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Start Screen */
          <Card className="bg-gray-900 border-green-400 p-6 text-center">
            <CardHeader>
              <CardTitle className="text-green-400 text-2xl">Ready to Evolve?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-300 text-sm">
                Use WASD keys to guide your snake and collect apples to grow!
              </p>
              <Button 
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 text-white text-xl p-6 pixel-button"
              >
                🚀 START GAME
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mobile Controls */}
        {isMobile && gameState.gameStarted && !gameState.gameOver && (
          <MobileControls onDirectionChange={changeDirection} />
        )}
      </div>
    </div>
  )
}