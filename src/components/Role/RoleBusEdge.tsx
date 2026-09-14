import { BaseEdge, type EdgeProps, Position } from "@xyflow/react"

const RoleBusEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) => {
  const r = 8

  // Straight vertical connection (e.g. GD -> TP, or TBP -> GS in same column)
  if (Math.abs(sourceX - targetX) < 1) {
    const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
    return <BaseEdge path={path} style={style} markerEnd={markerEnd} />
  }

  // Common horizontal trunk line for ALL branches coming from the parent
  // Using the exact same yTrunk ensures 100% seamless overlap across all lines
  const yTrunk = sourceY + 32

  // Branch to department heads (targetPosition is Top)
  if (targetPosition === Position.Top) {
    const sign = targetX > sourceX ? 1 : -1
    const path = `M ${sourceX} ${sourceY} L ${sourceX} ${yTrunk - r} Q ${sourceX} ${yTrunk} ${sourceX + sign * r} ${yTrunk} L ${targetX - sign * r} ${yTrunk} Q ${targetX} ${yTrunk} ${targetX} ${yTrunk + r} L ${targetX} ${targetY}`
    return <BaseEdge path={path} style={style} markerEnd={markerEnd} />
  }

  // Branch to specialist stack (targetPosition is Left)
  const xBus = targetX - 36
  const path = `M ${sourceX} ${sourceY} L ${sourceX} ${yTrunk - r} Q ${sourceX} ${yTrunk} ${sourceX + r} ${yTrunk} L ${xBus - r} ${yTrunk} Q ${xBus} ${yTrunk} ${xBus} ${yTrunk + r} L ${xBus} ${targetY - r} Q ${xBus} ${targetY} ${xBus + r} ${targetY} L ${targetX} ${targetY}`

  return <BaseEdge path={path} style={style} markerEnd={markerEnd} />
}

export default RoleBusEdge
