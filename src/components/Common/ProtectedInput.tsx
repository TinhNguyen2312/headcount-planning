import { Input, type InputProps } from "antd"
import ShowFor, { type ShowForProps } from "./ShowFor"

type ShowForKeys = Pick<ShowForProps, "projectRoles">
type ProtectedInputProps = InputProps & Partial<ShowForKeys>

const ProtectedInput = ({ projectRoles, ...props }: ProtectedInputProps) => (
  <ShowFor projectRoles={projectRoles}>
    <Input {...props} />
  </ShowFor>
)

export default ProtectedInput
