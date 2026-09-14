import type { MouseEvent } from "react"

const noop = () => {}

export const createShortcutMouseEvent = (
  target: HTMLElement | null,
): MouseEvent<HTMLElement> =>
  ({
    preventDefault: noop,
    stopPropagation: noop,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    persist: noop,
    currentTarget: target,
    target: target,
    type: "click",
  }) as unknown as MouseEvent<HTMLElement>
