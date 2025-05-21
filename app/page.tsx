
import { RobotKinematicsViewer } from "@/components/robot-kinematics-viewer"
import { RobotControls } from "@/components/robot-controls"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Robot Arm Kinematics Visualization</h1>
          <p className="text-muted-foreground">
            Interactive 3D visualization of robot arm kinematics with forward and inverse kinematics calculation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RobotControls />
          </div>
          <div className="lg:col-span-2 bg-muted/30 rounded-lg p-4 min-h-[500px]">
            <RobotKinematicsViewer />
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">About This Application</h2>
          <p>
            This application visualizes a robotic arm with configurable degrees of freedom (DOF) from 2 to 7. It
            implements both forward and inverse kinematics using the Denavit-Hartenberg parameters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Features</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Interactive 3D visualization of the robot arm</li>
                <li>Adjustable target position (X, Y, Z) and orientation (Roll, Pitch, Yaw)</li>
                <li>Real-time inverse kinematics calculation</li>
                <li>Configurable degrees of freedom (2-7)</li>
                <li>Visualization of coordinate frames</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Technical Details</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Python backend with Flask for API endpoints</li>
                <li>Next.js frontend with Three.js for 3D visualization</li>
                <li>NumPy for mathematical operations</li>
                <li>Real-time updates via WebSockets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
