'use client'

interface StatsMonitorProps {
  fps: number
  isMobile: boolean
  score: number
  position: { x: number; y: number }
}

export default function StatsMonitor({ fps, isMobile, score, position }: StatsMonitorProps): JSX.Element {
  return (
    <div className="fixed top-4 right-4 bg-gray-800 border border-green-400 p-2 rounded text-xs font-mono text-white opacity-80 z-50">
      <div className="space-y-1">
        <div>FPS: <span className="text-green-400">{fps || 0}</span></div>
        <div>Mobile: <span className="text-green-400">{isMobile ? 'true' : 'false'}</span></div>
        <div>Position: <span className="text-green-400">({position.x}, {position.y})</span></div>
        <div>Score: <span className="text-green-400">{score}</span></div>
      </div>
    </div>
  )
}