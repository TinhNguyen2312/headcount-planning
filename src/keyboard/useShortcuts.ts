import { useEffect, useId, useRef, useState } from "react"
import { comboFromEvent, isTypingTarget, normalizeCombo } from "./combo"
import { registerCommand } from "./commandRegistry"
import { resolveKeybinding, subscribeKeybindings } from "./keybindingsStore"
import { BROWSER_RESERVED_COMBOS } from "./reservedCombos"

export interface ShortcutBinding {
  keys: string | string[]
  handler: (() => void) | undefined
  storageId?: string
  label?: string
  category?: string
}

export type ShortcutBindings = Record<string, ShortcutBinding>

interface Claim {
  owner: string
  handler: () => void
}

const claimsByCombo = new Map<string, Claim[]>()
let listenerRefCount = 0

const warnIfColliding = (combo: string, claims: Claim[]): void => {
  if (!import.meta.env.DEV || claims.length < 2) return
  const owners = claims.map((c) => c.owner).join(", ")
  console.error(
    `[useShortcuts] phím "${combo}" bị ${claims.length} nơi đăng ký cùng lúc (${owners}) — chỉ "${claims[0].owner}" sẽ chạy`,
  )
}

const warnIfReserved = (combo: string, owner: string): void => {
  if (!import.meta.env.DEV || !BROWSER_RESERVED_COMBOS.has(combo)) return
  console.error(
    `[useShortcuts] "${combo}" (đăng ký bởi "${owner}") là phím tắt của trình duyệt/OS không chặn được, hãy đổi sang tổ hợp khác`,
  )
}

const onKeyDown = (e: KeyboardEvent): void => {
  if (isTypingTarget(e.target)) return
  const combo = comboFromEvent(e)
  if (!combo) return
  const claim = claimsByCombo.get(combo)?.[0]
  if (!claim) return
  e.preventDefault()
  claim.handler()
}

const attachListener = (): void => {
  if (listenerRefCount === 0) window.addEventListener("keydown", onKeyDown)
  listenerRefCount += 1
}

const detachListener = (): void => {
  listenerRefCount -= 1
  if (listenerRefCount === 0) window.removeEventListener("keydown", onKeyDown)
}

const bindingsShapeKey = (bindings: ShortcutBindings): string =>
  JSON.stringify(
    Object.entries(bindings).map(([id, b]) => [
      id,
      Array.isArray(b.keys) ? b.keys : [b.keys],
      b.storageId ?? null,
      b.label ?? null,
      !!b.handler,
    ]),
  )

export function useShortcuts(bindings: ShortcutBindings): void {
  const instanceId = useId()
  const bindingsRef = useRef(bindings)

  useEffect(() => {
    bindingsRef.current = bindings
  })

  useEffect(() => {
    attachListener()
    return detachListener
  }, [])

  const [overrideVersion, setOverrideVersion] = useState(0)
  useEffect(
    () => subscribeKeybindings(() => setOverrideVersion((v) => v + 1)),
    [],
  )

  const _shapeKey = `${bindingsShapeKey(bindings)}|${overrideVersion}`
  void _shapeKey

  useEffect(() => {
    const registeredClaims: { combo: string; claim: Claim }[] = []
    const unregisterCommands: (() => void)[] = []

    for (const bindingId of Object.keys(bindingsRef.current)) {
      const binding = bindingsRef.current[bindingId]
      if (!binding.handler) continue

      const { storageId, label, category } = binding
      const rawKeys = Array.isArray(binding.keys)
        ? binding.keys
        : [binding.keys]
      const keys = storageId
        ? resolveKeybinding(storageId, binding.keys)
        : rawKeys
      const invoke = (): void => bindingsRef.current[bindingId]?.handler?.()

      if (storageId) {
        unregisterCommands.push(
          registerCommand({
            storageId,
            label: label ?? storageId,
            category,
            handler: invoke,
            keys,
          }),
        )
      }

      const claim: Claim = {
        owner: `${instanceId}:${bindingId}`,
        handler: invoke,
      }
      for (const rawCombo of keys) {
        const combo = normalizeCombo(rawCombo)
        if (!combo) continue
        warnIfReserved(combo, claim.owner)
        const claims = claimsByCombo.get(combo) ?? []
        claims.push(claim)
        claimsByCombo.set(combo, claims)
        warnIfColliding(combo, claims)
        registeredClaims.push({ combo, claim })
      }
    }

    return () => {
      for (const { combo, claim } of registeredClaims) {
        const claims = claimsByCombo.get(combo)
        if (!claims) continue
        const remaining = claims.filter((c) => c !== claim)
        if (remaining.length > 0) claimsByCombo.set(combo, remaining)
        else claimsByCombo.delete(combo)
      }
      unregisterCommands.forEach((fn) => {
        fn()
      })
    }
  }, [instanceId])
}
