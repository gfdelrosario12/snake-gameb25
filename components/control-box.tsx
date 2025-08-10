'use client'

import { useState, useEffect } from 'react'

interface ControlBoxProps {
  isMobile: boolean
}

export default function ControlBox({ isMobile }: ControlBoxProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const [isMinimized, setIsMinimized] = useState<boolean>(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const toggleMinimized = (): void => {
    setIsMinimized(!isMinimized)
    setIsVisible(true)
  }

  const controls = [
    { key: 'W', action: 'Move Up' },
    { key: 'A', action: 'Move Left' },
    { key: 'S', action: 'Move Down' },
    { key: 'D', action: 'Move Right' },
  ]

  if (!isVisible && !isMinimized) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 left-4 bg-gray-800 border border-green-400 text-green-400 p-1 rounded text-xs z-50 opacity-50 hover:opacity-100"
      >
        ?
      </button>
    )
  }

  return (
    <div className={`fixed ${isMobile ? 'top-4 left-4' : 'top-4 left-1/2 transform -translate-x-1/2'} z-50`}>
      <div className="bg-gray-800 border border-green-400 rounded p-2 text-xs font-mono opacity-80">
        <div className="flex items-center justify-between mb-1">
          <span className="text-green-400 font-bold">Controls</span>
          <button
            onClick={toggleMinimized}
            className="text-green-400 hover:text-green-300 ml-2"
          >
            {isMinimized ? '▲' : '▼'}
          </button>
        </div>
        
        {!isMinimized && (
          <div className="space-y-1 text-white">
            {controls.map((control) => (
              <div key={control.key} className="flex items-center space-x-2">
                <span className="bg-green-600 text-white px-1 rounded font-bold min-w-[16px] text-center">
                  {control.key}
                </span>
                <span className="text-xs">{control.action}</span>
              </div>
            ))}
          </div>
        )}
        
        {!isMinimized && isMobile && (
          <div className="mt-2 pt-2 border-t border-green-600">
            <div className="text-green-400 text-xs">Touch controls available below</div>
          </div>
        )}
      </div>
    </div>
  )
}