import { Button as AntButton, type ButtonProps } from "antd"
import { useRef } from "react"
import ShortcutHint from "./ShortcutHint"
import { createShortcutMouseEvent } from "./syntheticEvent"

export type ShortcutButtonProps = ButtonProps & {
  shortcutKeys?: string | string[]
  shortcutStorageId?: string
  shortcutLabel?: string
  showKey?: boolean
}

const Button = ({
  shortcutKeys,
  shortcutStorageId,
  shortcutLabel,
  showKey,
  onClick,
  disabled,
  children,
  ...props
}: ShortcutButtonProps) => {
  const btnRef = useRef<HTMLElement>(null)

  return (
    <AntButton
      {...props}
      ref={btnRef as React.Ref<HTMLButtonElement>}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      {(shortcutKeys || shortcutStorageId) && (
        <ShortcutHint
          keys={shortcutKeys ?? []}
          shortcutStorageId={shortcutStorageId}
          shortcutLabel={shortcutLabel}
          handler={
            disabled
              ? undefined
              : () => onClick?.(createShortcutMouseEvent(btnRef.current))
          }
          className="ml-2 text-base opacity-60"
          showKey={showKey}
        />
      )}
    </AntButton>
  )
}

export default Button
