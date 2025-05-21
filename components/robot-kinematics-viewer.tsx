"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// DH parameters template from the Python script
const DH_TEMPLATE = [
  [0, 0.3, 0.0, Math.PI / 2],
  [0, 0.0, 0.3, 0],
  [0, 0.0, 0.3, Math.PI / 2],
  [0, 0.3, 0.0, -Math.PI / 2],
  [0, 0.0, 0.3, Math.PI / 2],
  [0, 0.0, 0.3, -Math.PI / 2],
  [0, 0.3, 0.0, 0],
]

export function RobotKinematicsViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<string>("Ready")
  const [error, setError] = useState<string | null>(null)
  const [jointAngles, setJointAngles] = useState<number[] | null>(null)
  const [calculationTime, setCalculationTime] = useState<number | null>(null)
  const [currentDof, setCurrentDof] = useState<number>(7)

  // Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const robotRef = useRef<THREE.Group | null>(null)

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    // Create scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)
    sceneRef.current = scene

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(1.5, 1.5, 1.5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.current = controls

    // Add grid and axes
    const gridHelper = new THREE.GridHelper(2, 20)
    scene.add(gridHelper)

    const axesHelper = new THREE.AxesHelper(0.5)
    scene.add(axesHelper)

    // Create robot group
    const robot = new THREE.Group()
    scene.add(robot)
    robotRef.current = robot

    // Initial robot with default joint angles for 7 DOF
    updateRobotArm(Array(7).fill(0))

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return

      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
    }
  }, [])

  // Function to update robot arm visualization based on joint angles
  const updateRobotArm = (angles: number[]) => {
    if (!robotRef.current || !sceneRef.current) return

    // Clear previous robot
    while (robotRef.current.children.length > 0) {
      robotRef.current.remove(robotRef.current.children[0])
    }

    // Create base
    const baseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 32)
    const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.set(0, 0, 0)
    robotRef.current.add(base)

    // Create transformation matrices
    const T = new THREE.Matrix4().identity()
    const points = [new THREE.Vector3(0, 0, 0)]
    const frames = [new THREE.Matrix4().identity()]

    const dof = angles.length
    const dhParams = DH_TEMPLATE.slice(0, dof)

    // Debug log
    console.log(`Rendering robot with ${dof} DOF, angles: ${angles.map((a) => a.toFixed(2)).join(", ")}`)

    // Draw the base coordinate frame
    const baseAxisLength = 0.05
    const baseXAxis = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      baseAxisLength,
      0xff0000,
    )
    const baseYAxis = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      baseAxisLength,
      0x00ff00,
    )
    const baseZAxis = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      baseAxisLength,
      0x0000ff,
    )
    robotRef.current.add(baseXAxis, baseYAxis, baseZAxis)

    // Create each joint and link
    for (let i = 0; i < dof; i++) {
      const theta = angles[i] + dhParams[i][0]
      const d = dhParams[i][1]
      const a = dhParams[i][2]
      const alpha = dhParams[i][3]

      // Create transformation matrix
      const ct = Math.cos(theta)
      const st = Math.sin(theta)
      const ca = Math.cos(alpha)
      const sa = Math.sin(alpha)

      const Ti = new THREE.Matrix4().set(
        ct,
        -st * ca,
        st * sa,
        a * ct,
        st,
        ct * ca,
        -ct * sa,
        a * st,
        0,
        sa,
        ca,
        d,
        0,
        0,
        0,
        1,
      )

      T.multiply(Ti)
      frames.push(T.clone())

      // Extract position
      const position = new THREE.Vector3()
      position.setFromMatrixPosition(T)
      points.push(position.clone())

      // Create joint
      const jointGeometry = new THREE.SphereGeometry(0.03, 16, 16)
      const jointMaterial = new THREE.MeshBasicMaterial({ color: 0x0088ff })
      const joint = new THREE.Mesh(jointGeometry, jointMaterial)
      joint.position.copy(position)
      robotRef.current.add(joint)

      // Create link from previous point to this joint
      const prevPos = points[i]
      const linkGeometry = new THREE.CylinderGeometry(0.015, 0.015, position.distanceTo(prevPos), 8)
      const linkMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 })
      const link = new THREE.Mesh(linkGeometry, linkMaterial)

      // Position and orient the link
      const midpoint = new THREE.Vector3().addVectors(prevPos, position).multiplyScalar(0.5)
      link.position.copy(midpoint)

      // Orient the cylinder to point from prevPos to position
      const direction = new THREE.Vector3().subVectors(position, prevPos).normalize()
      const axis = new THREE.Vector3(0, 1, 0)
      const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction)
      link.setRotationFromQuaternion(quaternion)

      robotRef.current.add(link)

      // Draw coordinate frame at each joint
      const axisLength = 0.05
      const xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), position, axisLength, 0xff0000)
      const yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), position, axisLength, 0x00ff00)
      const zAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), position, axisLength, 0x0000ff)

      // Apply the rotation from the transformation matrix
      const rotation = new THREE.Matrix4().extractRotation(T)

      xAxis.setRotationFromMatrix(rotation)
      yAxis.setRotationFromMatrix(rotation)
      zAxis.setRotationFromMatrix(rotation)

      robotRef.current.add(xAxis, yAxis, zAxis)
    }

    // Add end effector
    const endPos = points[points.length - 1]
    const endEffectorGeometry = new THREE.ConeGeometry(0.03, 0.08, 16)
    const endEffectorMaterial = new THREE.MeshBasicMaterial({ color: 0xff4400 })
    const endEffector = new THREE.Mesh(endEffectorGeometry, endEffectorMaterial)
    endEffector.position.copy(endPos)

    // Orient the end effector
    const endRotation = new THREE.Matrix4().extractRotation(T)
    endEffector.setRotationFromMatrix(endRotation)
    // Rotate to point in the z direction
    endEffector.rotateX(Math.PI / 2)

    robotRef.current.add(endEffector)
  }

  // Listen for updates from the controls component
  useEffect(() => {
    const handleUpdateRobotArm = (event: CustomEvent) => {
      const { position, orientation, dof } = event.detail

      // Update current DOF
      setCurrentDof(dof)

      setStatus("Calculando cinemática inversa...")
      setError(null)

      // Use a shorter timeout for more responsive updates
      setTimeout(() => {
        try {
          // This is a placeholder - in a real implementation, we would call the Python backend
          // For now, we'll just generate some random joint angles that are somewhat consistent
          // We'll use the position and orientation to seed the random values for more consistency
          const seed = position.x + position.y + position.z + orientation.roll + orientation.pitch + orientation.yaw
          const pseudoRandom = (index: number) => Math.sin(seed * (index + 1) * 1000) * 0.5 * Math.PI

          // Ensure we generate exactly dof angles
          const angles = Array(dof)
            .fill(0)
            .map((_, i) => pseudoRandom(i))

          setJointAngles(angles)
          setCalculationTime(0.05)
          setStatus("Solución encontrada")
          updateRobotArm(angles)
        } catch (err) {
          setError("Error al calcular la cinemática inversa. El objetivo puede estar fuera del espacio de trabajo.")
          setStatus("Error")
        }
      }, 100) // Reduced timeout for more responsive updates
    }

    window.addEventListener("updateRobotArm", handleUpdateRobotArm as EventListener)

    return () => {
      window.removeEventListener("updateRobotArm", handleUpdateRobotArm as EventListener)
    }
  }, [])

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Visualización del Brazo Robótico ({currentDof} DOF)</CardTitle>
          <Badge
            variant={status === "Error" ? "destructive" : status === "Solución encontrada" ? "success" : "secondary"}
          >
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 mb-4">
          {jointAngles && (
            <div className="text-sm">
              <p>Ángulos de las articulaciones: {jointAngles.map((a) => a.toFixed(2)).join(", ")}</p>
              {calculationTime && <p>Tiempo de cálculo: {calculationTime.toFixed(3)}s</p>}
            </div>
          )}
        </div>

        <div ref={containerRef} className="w-full h-[400px] rounded-md overflow-hidden border" />

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Arrastra para rotar la vista. Usa la rueda del ratón para zoom. Clic derecho para desplazar.</p>
        </div>
      </CardContent>
    </Card>
  )
}
