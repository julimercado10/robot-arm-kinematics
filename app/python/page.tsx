import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PythonPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Python Integration</h1>
          <p className="text-muted-foreground">
            Information about the Python backend for the Robot Arm Kinematics Visualization
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About the Python Script</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The robot arm kinematics visualization is powered by a Python script that implements:</p>

            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Forward kinematics using Denavit-Hartenberg parameters</li>
              <li>Inverse kinematics with damped least squares method</li>
              <li>3D visualization of the robot arm</li>
              <li>Interactive controls for target position and orientation</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">Implementation Details</h3>
            <p>
              In a production environment, this web application would integrate with the Python script in one of the
              following ways:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Option 1: Python API</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>
                    The Python script would be deployed as a separate microservice with a REST API. The Next.js
                    application would make API calls to this service to perform kinematics calculations.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Option 2: WebAssembly</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>
                    The Python code could be compiled to WebAssembly using tools like Pyodide or PyScript, allowing it
                    to run directly in the browser without a separate backend.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                For this demonstration, we're using a simulated approach where the frontend visualizes the robot arm
                based on pre-calculated kinematics data.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Visualization</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
