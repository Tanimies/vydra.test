import React, { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, Grid, Environment, Line } from '@react-three/drei'

const GEOMETRY_BY_TYPE = {
  cube: (
    <boxGeometry args={[1, 1, 1]} />
  ),
  sphere: (
    <sphereGeometry args={[0.65, 32, 32]} />
  ),
  cylinder: (
    <cylinderGeometry args={[0.6, 0.6, 1.2, 32]} />
  ),
  cone: (
    <coneGeometry args={[0.7, 1.2, 32]} />
  ),
  torus: (
    <torusGeometry args={[0.6, 0.22, 16, 48]} />
  )
}

function ShapeMesh({ shape, isSelected, onSelect, meshRef }) {
  return (
    <mesh
      ref={meshRef}
      position={shape.position}
      rotation={shape.rotation}
      scale={shape.scale}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(shape.id)
      }}
      castShadow
      receiveShadow
    >
      {GEOMETRY_BY_TYPE[shape.type] || GEOMETRY_BY_TYPE.cube}
      <meshStandardMaterial
        color={shape.color}
        emissive={isSelected ? shape.color : '#000000'}
        emissiveIntensity={isSelected ? 0.25 : 0}
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  )
}

function PointMarker({ point, color = '#0a0a0a' }) {
  return (
    <mesh position={point}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Invisible plane the line tool clicks against, so we can turn a 2D click
// into a real 3D point via event.point.
function LineDrawingPlane({ onPlacePoint }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(event) => {
        event.stopPropagation()
        onPlacePoint(event.point.toArray())
      }}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

export default function ShapeStudioScene({
  shapes,
  selectedId,
  mode,
  onSelect,
  onTransform,
  onDeselect,
  lineDraft = [],
  finishedLines = [],
  onAddLinePoint
}) {
  const meshRefs = useRef({})
  // Tracked in real state (set via the mesh ref callback / an effect keyed on
  // selectedId) rather than read imperatively from meshRefs during render, so
  // the TransformControls gizmo shows up on the same render the shape is
  // selected/created instead of one render late.
  const [selectedObject, setSelectedObject] = useState(null)

  useEffect(() => {
    setSelectedObject(selectedId ? meshRefs.current[selectedId] || null : null)
  }, [selectedId, shapes])

  const isLineMode = mode === 'line'

  return (
    <Canvas
      shadows
      camera={{ position: [4, 3.5, 6], fov: 45 }}
      onPointerMissed={onDeselect}
    >
      <color attach="background" args={['#f2e9c4']} />
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Environment preset="city" />

      <Grid
        args={[20, 20]}
        cellColor="#00000022"
        sectionColor="#00000044"
        fadeDistance={20}
        infiniteGrid
        position={[0, -0.01, 0]}
      />

      {isLineMode && <LineDrawingPlane onPlacePoint={onAddLinePoint} />}

      {finishedLines.map((points, index) => (
        points.length > 1 ? (
          <Line key={`line-${index}`} points={points} color="#0a0a0a" lineWidth={2.5} />
        ) : null
      ))}
      {finishedLines.flatMap((points, lineIndex) =>
        points.map((point, pointIndex) => (
          <PointMarker key={`line-${lineIndex}-point-${pointIndex}`} point={point} color="#0a0a0a" />
        ))
      )}

      {lineDraft.length > 1 && (
        <Line points={lineDraft} color="#a88a26" lineWidth={2.5} dashed dashSize={0.15} gapSize={0.1} />
      )}
      {lineDraft.map((point, index) => (
        <PointMarker key={`draft-point-${index}`} point={point} color="#a88a26" />
      ))}

      {shapes.map((shape) => (
        <ShapeMesh
          key={shape.id}
          shape={shape}
          isSelected={shape.id === selectedId}
          onSelect={onSelect}
          meshRef={(el) => {
            meshRefs.current[shape.id] = el
            if (shape.id === selectedId) {
              setSelectedObject(el)
            }
          }}
        />
      ))}

      {selectedObject && !isLineMode && (
        <TransformControls
          object={selectedObject}
          mode={mode}
          onObjectChange={() => {
            if (!selectedObject) return
            onTransform(selectedId, {
              position: selectedObject.position.toArray(),
              rotation: [selectedObject.rotation.x, selectedObject.rotation.y, selectedObject.rotation.z],
              scale: selectedObject.scale.toArray()
            })
          }}
        />
      )}

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate={!isLineMode}
        minDistance={2}
        maxDistance={30}
      />
    </Canvas>
  )
}
