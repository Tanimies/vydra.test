import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Box,
  Circle,
  Cone,
  Cylinder,
  Move3d,
  PenLine,
  RotateCw,
  Scaling,
  Trash2,
  Disc3
} from 'lucide-react'
import AppShell from '../components/AppShell'

// Three.js needs a real browser canvas, so the scene is client-only.
const ShapeStudioScene = dynamic(() => import('../components/ShapeStudioScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[520px] items-center justify-center text-sm text-zinc-600">
      Loading 3D viewport...
    </div>
  )
})

const SHAPE_TOOLS = [
  { type: 'cube', label: 'Cube', icon: Box },
  { type: 'sphere', label: 'Sphere', icon: Circle },
  { type: 'cylinder', label: 'Cylinder', icon: Cylinder },
  { type: 'cone', label: 'Cone', icon: Cone },
  { type: 'torus', label: 'Torus', icon: Disc3 }
]

const TRANSFORM_TOOLS = [
  { key: 'translate', label: 'Move', icon: Move3d },
  { key: 'rotate', label: 'Rotate', icon: RotateCw },
  { key: 'scale', label: 'Scale', icon: Scaling },
  { key: 'line', label: 'Draw Line', icon: PenLine }
]

const COLOR_SWATCHES = ['#d9c25c', '#f2e9c4', '#e3ce7a', '#dcc26a', '#c9ab3f', '#a88a26', '#0a0a0a', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#ffffff']

const AXIS_LABELS = ['X', 'Y', 'Z']

let shapeCounter = 0
function createShape(type) {
  shapeCounter += 1
  const offset = (shapeCounter % 5) * 0.4 - 0.8
  return {
    id: `shape-${Date.now()}-${shapeCounter}`,
    type,
    color: '#d9c25c',
    position: [offset, 0.65, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  }
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
      {label}
      <input
        type="number"
        step="0.1"
        value={Number.isFinite(value) ? Number(value.toFixed(2)) : 0}
        onChange={(event) => {
          const parsed = parseFloat(event.target.value)
          onChange(Number.isFinite(parsed) ? parsed : 0)
        }}
        className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm font-medium text-zinc-950 focus:border-black focus:outline-none focus:ring-2 focus:ring-zinc-200"
      />
    </label>
  )
}

export default function ShapeStudioPage() {
  const [shapes, setShapes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [mode, setMode] = useState('translate')
  const [lineDraft, setLineDraft] = useState([])
  const [finishedLines, setFinishedLines] = useState([])

  const selectedShape = shapes.find((shape) => shape.id === selectedId) || null

  const addShape = (type) => {
    const next = createShape(type)
    setShapes((current) => [...current, next])
    setSelectedId(next.id)
  }

  const removeSelected = () => {
    if (!selectedId) return
    setShapes((current) => current.filter((shape) => shape.id !== selectedId))
    setSelectedId(null)
  }

  const clearAll = () => {
    setShapes([])
    setSelectedId(null)
    setLineDraft([])
    setFinishedLines([])
  }

  const handleTransform = (id, patch) => {
    setShapes((current) => current.map((shape) => (shape.id === id ? { ...shape, ...patch } : shape)))
  }

  const setSelectedColor = (color) => {
    if (!selectedId) return
    setShapes((current) => current.map((shape) => (shape.id === selectedId ? { ...shape, color } : shape)))
  }

  const updateSelectedAxis = (field, axisIndex, value) => {
    if (!selectedId) return
    setShapes((current) => current.map((shape) => {
      if (shape.id !== selectedId) return shape
      const next = [...shape[field]]
      next[axisIndex] = value
      return { ...shape, [field]: next }
    }))
  }

  const changeMode = (nextMode) => {
    setMode(nextMode)
    if (nextMode !== 'line') {
      setLineDraft([])
    }
  }

  const addLinePoint = (point) => {
    setLineDraft((current) => [...current, point])
  }

  const finishLine = () => {
    if (lineDraft.length < 2) return
    setFinishedLines((current) => [...current, lineDraft])
    setLineDraft([])
  }

  const clearLines = () => {
    setFinishedLines([])
    setLineDraft([])
  }

  return (
    <AppShell
      eyebrow="3D Studio"
      title="Build and view shapes in 3D"
      description="A CAD-style workspace: drop in shapes, then move, rotate, or scale them with the gizmo, or switch to the line tool to sketch connected points in 3D space."
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <div className="card p-5">
            <p className="section-kicker text-[#18181b]">Add a shape</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {SHAPE_TOOLS.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.type}
                    type="button"
                    onClick={() => addShape(tool.type)}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white/80 p-4 text-xs font-semibold text-zinc-800 transition hover:-translate-y-0.5 hover:border-black hover:bg-[#d9c25c]"
                  >
                    <Icon className="h-6 w-6" />
                    {tool.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card p-5">
            <p className="section-kicker text-[#18181b]">Tool</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {TRANSFORM_TOOLS.map((item) => {
                const Icon = item.icon
                const active = mode === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => changeMode(item.key)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? 'border-black bg-zinc-950 text-[#d9c25c]'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-black'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
            {mode === 'line' ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs leading-5 text-zinc-500">
                  Click on the ground plane to place points. {lineDraft.length} point{lineDraft.length === 1 ? '' : 's'} in the current line.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={finishLine}
                    disabled={lineDraft.length < 2}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Finish line
                  </button>
                  <button
                    type="button"
                    onClick={clearLines}
                    disabled={finishedLines.length === 0 && lineDraft.length === 0}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Clear lines
                  </button>
                </div>
                <p className="text-xs leading-5 text-zinc-500">{finishedLines.length} finished line{finishedLines.length === 1 ? '' : 's'}</p>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Click a shape in the viewport to select it, then drag the gizmo arrows/rings/handles.
              </p>
            )}
          </div>

          {selectedShape && mode !== 'line' && (
            <div className="card p-5">
              <p className="section-kicker text-[#18181b]">Position</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {AXIS_LABELS.map((label, axisIndex) => (
                  <NumberField
                    key={`position-${label}`}
                    label={label}
                    value={selectedShape.position[axisIndex]}
                    onChange={(value) => updateSelectedAxis('position', axisIndex, value)}
                  />
                ))}
              </div>

              <p className="section-kicker mt-5 text-[#18181b]">Width / Height / Depth</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {['Width', 'Height', 'Depth'].map((label, axisIndex) => (
                  <NumberField
                    key={`scale-${label}`}
                    label={label}
                    value={selectedShape.scale[axisIndex]}
                    onChange={(value) => updateSelectedAxis('scale', axisIndex, value)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="card p-5">
            <p className="section-kicker text-[#18181b]">Selected shape color</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  disabled={!selectedShape}
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-30 ${
                    selectedShape?.color === color ? 'border-black' : 'border-zinc-300'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Set color ${color}`}
                />
              ))}
            </div>
            {!selectedShape && (
              <p className="mt-3 text-xs leading-5 text-zinc-500">Select a shape to change its color.</p>
            )}
          </div>

          <div className="card p-5">
            <p className="section-kicker text-[#18181b]">Scene</p>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={removeSelected}
                disabled={!selectedId}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                Delete selected
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={shapes.length === 0 && finishedLines.length === 0 && lineDraft.length === 0}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear scene
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">{shapes.length} shape{shapes.length === 1 ? '' : 's'} in scene</p>
          </div>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="h-[560px] w-full lg:h-[680px]">
            <ShapeStudioScene
              shapes={shapes}
              selectedId={selectedId}
              mode={mode}
              onSelect={setSelectedId}
              onDeselect={() => setSelectedId(null)}
              onTransform={handleTransform}
              lineDraft={lineDraft}
              finishedLines={finishedLines}
              onAddLinePoint={addLinePoint}
            />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
