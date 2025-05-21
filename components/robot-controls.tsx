"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function RobotControls() {
  const { toast } = useToast()
  const [dof, setDof] = useState<string>("7")
  const [position, setPosition] = useState({
    x: 0.0,
    y: 0.0,
    z: 0.3,
  })
  const [orientation, setOrientation] = useState({
    roll: 0.0,
    pitch: 0.0,
    yaw: 0.0,
  })
  const [workspaceRanges, setWorkspaceRanges] = useState({
    x: { min: -1.0, max: 1.0 },
    y: { min: -1.0, max: 1.0 },
    z: { min: 0.3, max: 1.5 },
  })

  // Update workspace ranges based on DOF
  useEffect(() => {
    const dofNumber = Number.parseInt(dof)
    const ranges = {
      2: { x: { min: -0.4, max: 0.4 }, y: { min: -0.4, max: 0.4 }, z: { min: 0.3, max: 0.8 } },
      3: { x: { min: -0.5, max: 0.5 }, y: { min: -0.5, max: 0.5 }, z: { min: 0.3, max: 1.0 } },
      4: { x: { min: -0.6, max: 0.6 }, y: { min: -0.6, max: 0.6 }, z: { min: 0.3, max: 1.1 } },
      5: { x: { min: -0.7, max: 0.7 }, y: { min: -0.7, max: 0.7 }, z: { min: 0.3, max: 1.2 } },
      6: { x: { min: -0.8, max: 0.8 }, y: { min: -0.8, max: 0.8 }, z: { min: 0.3, max: 1.3 } },
      7: { x: { min: -1.0, max: 1.0 }, y: { min: -1.0, max: 1.0 }, z: { min: 0.3, max: 1.5 } },
    }[dofNumber]

    setWorkspaceRanges(ranges)

    // Clamp current position to new workspace
    setPosition((prev) => ({
      x: Math.max(ranges.x.min, Math.min(ranges.x.max, prev.x)),
      y: Math.max(ranges.y.min, Math.min(ranges.y.max, prev.y)),
      z: Math.max(ranges.z.min, Math.min(ranges.z.max, prev.z)),
    }))

    // Trigger an update when DOF changes
    window.dispatchEvent(
      new CustomEvent("updateRobotArm", {
        detail: {
          position,
          orientation,
          dof: dofNumber,
        },
      }),
    )
  }, [dof])

  // Remove the handleCalculate function and add this useEffect
  useEffect(() => {
    // Trigger update whenever position or orientation changes
    const timer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("updateRobotArm", {
          detail: {
            position,
            orientation,
            dof: Number.parseInt(dof),
          },
        }),
      )
    }, 50) // Small delay to prevent too many updates while dragging

    return () => clearTimeout(timer)
  }, [position, orientation, dof])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Robot Arm Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="dof">Degrees of Freedom (DOF)</Label>
          <Select value={dof} onValueChange={setDof}>
            <SelectTrigger id="dof">
              <SelectValue placeholder="Select DOF" />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5, 6, 7].map((d) => (
                <SelectItem key={d} value={d.toString()}>
                  {d} DOF
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Target Position</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="x-position">X Position</Label>
              <span className="text-sm text-muted-foreground">{position.x.toFixed(2)}</span>
            </div>
            <Slider
              id="x-position"
              min={workspaceRanges.x.min}
              max={workspaceRanges.x.max}
              step={0.01}
              value={[position.x]}
              onValueChange={(value) => setPosition({ ...position, x: value[0] })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="y-position">Y Position</Label>
              <span className="text-sm text-muted-foreground">{position.y.toFixed(2)}</span>
            </div>
            <Slider
              id="y-position"
              min={workspaceRanges.y.min}
              max={workspaceRanges.y.max}
              step={0.01}
              value={[position.y]}
              onValueChange={(value) => setPosition({ ...position, y: value[0] })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="z-position">Z Position</Label>
              <span className="text-sm text-muted-foreground">{position.z.toFixed(2)}</span>
            </div>
            <Slider
              id="z-position"
              min={workspaceRanges.z.min}
              max={workspaceRanges.z.max}
              step={0.01}
              value={[position.z]}
              onValueChange={(value) => setPosition({ ...position, z: value[0] })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Target Orientation</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="roll">Roll</Label>
              <span className="text-sm text-muted-foreground">{orientation.roll.toFixed(2)} rad</span>
            </div>
            <Slider
              id="roll"
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              value={[orientation.roll]}
              onValueChange={(value) => setOrientation({ ...orientation, roll: value[0] })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="pitch">Pitch</Label>
              <span className="text-sm text-muted-foreground">{orientation.pitch.toFixed(2)} rad</span>
            </div>
            <Slider
              id="pitch"
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              value={[orientation.pitch]}
              onValueChange={(value) => setOrientation({ ...orientation, pitch: value[0] })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="yaw">Yaw</Label>
              <span className="text-sm text-muted-foreground">{orientation.yaw.toFixed(2)} rad</span>
            </div>
            <Slider
              id="yaw"
              min={-Math.PI}
              max={Math.PI}
              step={0.01}
              value={[orientation.yaw]}
              onValueChange={(value) => setOrientation({ ...orientation, yaw: value[0] })}
            />
          </div>
        </div>

        <div className="text-sm text-center text-muted-foreground">
          La visualización se actualiza automáticamente al mover los controles
        </div>
      </CardContent>
    </Card>
  )
}
