import Button, { type ShortcutButtonProps } from "@/keyboard/ShortcutButton"
import ShowFor, { type ShowForProps } from "./ShowFor"

type ShowForKeys = Pick<ShowForProps, "projectRoles">
type ProtectedButtonProps = ShortcutButtonProps & Partial<ShowForKeys>

const ProtectedButton = ({ projectRoles, ...props }: ProtectedButtonProps) => (
  <ShowFor projectRoles={projectRoles}>
    <Button {...props} />
  </ShowFor>
)

export default ProtectedButton
