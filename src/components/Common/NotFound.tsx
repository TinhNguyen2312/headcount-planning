import Link from "next/link"
import { Button } from "antd"

const NotFound = () => {
  return (
    <div
      className="flex min-h-screen items-center justify-center flex-col p-4"
      data-testid="not-found"
    >
      <div className="flex items-center z-10">
        <div className="flex flex-col ml-4 items-center justify-center p-4">
          <span className="text-6xl md:text-8xl font-bold leading-none mb-4">
            404
          </span>
          <span className="text-2xl font-bold mb-2">Có lỗi!</span>
        </div>
      </div>

      <p className="text-lg text-muted-foreground mb-4 text-center z-10">
        Trang bạn đang tìm kiếm không tồn tại.
      </p>
      <div className="z-10">
        <Link href="/projects">
          <Button type="primary" className="mt-4">
            Quay lại
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
