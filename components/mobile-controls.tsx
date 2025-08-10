'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface MobileControlsProps {
  onDirectionChange: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void
}

export default function MobileControls({ onDirectionChange }: MobileControlsProps): JSX.Element {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<{ x: number; y: number } | null>(null)

  const handleStart = (clientX: number, clientY: number): void => {
    if (!joystickRef.current) return
    
    setIsDragging(true)
    const rect = joystickRef.current.getBoundingClientRect()
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  const handleMove = (clientX: number, clientY: number): void => {
    if (!isDragging || !centerRef.current || !knobRef.current) return

    const deltaX = clientX - centerRef.current.x
    const deltaY = clientY - centerRef.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = 40

    // Constrain knob to circle
    const constrainedDistance = Math.min(distance, maxDistance)
    const angle = Math.atan2(deltaY, deltaX)
    
    const knobX = Math.cos(angle) * constrainedDistance
    const knobY = Math.sin(angle) * constrainedDistance

    knobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`

    // Determine direction based on angle
    if (constrainedDistance > 20) {
      const degrees = (angle * 180) / Math.PI
      const normalizedDegrees = ((degrees + 360) % 360)

      if (normalizedDegrees >= 315 || normalizedDegrees < 45) {
        onDirectionChange('RIGHT')
      } else if (normalizedDegrees >= 45 && normalizedDegrees < 135) {
        onDirectionChange('DOWN')
      } else if (normalizedDegrees >= 135 && normalizedDegrees < 225) {
        onDirectionChange('LEFT')
      } else if (normalizedDegrees >= 225 && normalizedDegrees < 315) {
        onDirectionChange('UP')
      }
    }
  }

  const handleEnd = (): void => {
    setIsDragging(false)
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)'
    }
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent): void => {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      handleStart(touch.clientX, touch.clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent): void => {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      handleMove(touch.clientX, touch.clientY)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent): void => {
    e.preventDefault()
    handleEnd()
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: MouseEvent): void => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = (): void => {
    handleEnd()
  }

  // Add global mouse event listeners when dragging
  if (typeof window !== 'undefined' && isDragging) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Cleanup listeners
  if (typeof window !== 'undefined' && !isDragging) {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-8 z-50">
      {/* Virtual Joystick */}
      <div className="relative">
        <div
          ref={joystickRef}
          className="w-24 h-24 bg-gray-800 border-2 border-green-400 rounded-full flex items-center justify-center opacity-75 touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div
            ref={knobRef}
            className="w-8 h-8 bg-green-400 rounded-full transition-transform duration-75 pointer-events-none"
          />
        </div>
        <div className="text-center text-xs text-green-400 mt-1">MOVE</div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        <Button
          className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-75 touch-none select-none"
          onTouchStart={(e) => {
            e.preventDefault()
            onDirectionChange('UP')
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            onDirectionChange('UP')
          }}
        >
          ⬆️
        </Button>
        <div className="flex space-x-2">
          <Button
            className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-75 touch-none select-none"
            onTouchStart={(e) => {
              e.preventDefault()
              onDirectionChange('LEFT')
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              onDirectionChange('LEFT')
            }}
          >
            ⬅️
          </Button>
          <Button
            className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-75 touch-none select-none"
            onTouchStart={(e) => {
              e.preventDefault()
              onDirectionChange('RIGHT')
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              onDirectionChange('RIGHT')
            }}
          >
            ➡️
          </Button>
        </div>
        <Button
          className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-75 touch-none select-none"
          onTouchStart={(e) => {
            e.preventDefault()
            onDirectionChange('DOWN')
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            onDirectionChange('DOWN')
          }}
        >
          ⬇️
        </Button>
      </div>
    </div>
  )
}