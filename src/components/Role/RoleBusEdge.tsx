/* eslint-disable no-useless-assignment */
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

  if (Math.abs(sourceX - targetX) < 1 && targetPosition === Position.Top) {
    const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
    return <BaseEdge path={path} style={style} markerEnd={markerEnd} />
  }

  const yTrunk = sourceY + 36

  if (targetPosition === Position.Top) {
    const dx = targetX - sourceX
    const signX = dx > 0 ? 1 : -1
    const rTrunk = Math.min(
      r,
      Math.abs(dx) / 2,
      Math.abs(targetY - yTrunk) / 2,
      Math.abs(yTrunk - sourceY) / 2,
    )
    const path = `M ${sourceX} ${sourceY} L ${sourceX} ${yTrunk - rTrunk} Q ${sourceX} ${yTrunk} ${sourceX + signX * rTrunk} ${yTrunk} L ${targetX - signX * rTrunk} ${yTrunk} Q ${targetX} ${yTrunk} ${targetX} ${yTrunk + rTrunk} L ${targetX} ${targetY}`
    return <BaseEdge path={path} style={style} markerEnd={markerEnd} />
  }

  const xBus = targetX - 40
  const dxBus = xBus - sourceX
  const signBus = dxBus >= 0 ? 1 : -1
  const r1 = Math.min(r, Math.abs(dxBus) / 2, Math.abs(yTrunk - sourceY) / 2)
  const r2 = Math.min(
    r,
    Math.abs(targetY - yTrunk) / 2,
    Math.abs(targetX - xBus) / 2,
  )

  let path = ""
  if (Math.abs(dxBus) < 1) {
    path = `M ${sourceX} ${sourceY} L ${xBus} ${targetY - r2} Q ${xBus} ${targetY} ${xBus + r2} ${targetY} L ${targetX} ${targetY}`
  } else {
    path = `M ${sourceX} ${sourceY} L ${sourceX} ${yTrunk - r1} Q ${sourceX} ${yTrunk} ${sourceX + signBus * r1} ${yTrunk} L ${xBus - signBus * r1} ${yTrunk} Q ${xBus} ${yTrunk} ${xBus} ${yTrunk + r1} L ${xBus} ${targetY - r2} Q ${xBus} ${targetY} ${xBus + r2} ${targetY} L ${targetX} ${targetY}`
  }

  return <BaseEdge path={path} style={style} markerEnd={markerEnd} />
}

export default RoleBusEdge
