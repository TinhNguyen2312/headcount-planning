import { Tag } from "antd"

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "APPROVED":
      return (
        <Tag color="success" className="text-[10px] m-0">
          Đã duyệt
        </Tag>
      )
    case "SUBMITTED":
      return (
        <Tag color="processing" className="text-[10px] m-0">
          Đã nộp
        </Tag>
      )
    case "REJECTED":
      return (
        <Tag color="error" className="text-[10px] m-0">
          Từ chối
        </Tag>
      )
    default:
      return (
        <Tag color="default" className="text-[10px] m-0">
          Bản nháp
        </Tag>
      )
  }
}

export default StatusBadge
