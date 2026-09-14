# Hệ thống Quản trị Kế hoạch Nhân sự (Headcount Planning) - Next.js Fullstack

Dự án đã được chuyển đổi hoàn toàn sang kiến trúc **Fullstack Next.js 16 (App Router, 100% TypeScript)** kết nối trực tiếp cơ sở dữ liệu **Supabase PostgreSQL** thông qua **Drizzle ORM**, thay thế toàn bộ FastAPI backend và Postgres local cũ.

## Khởi chạy nhanh

### 1. Cấu hình môi trường (`.env`)
```env
SUPABASE_POSTGRES_URL=postgresql://postgres.aqcznssfntdqnttmmjsl:tinhmy14032022@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_URL=postgresql://postgres.aqcznssfntdqnttmmjsl:tinhmy14032022@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
SESSION_COOKIE_NAME=JSESSIONID
SESSION_EXPIRE_MINUTES=480
```

### 2. Cài đặt và Chạy
```bash
# Cài đặt dependencies (nếu chưa)
npm install

# Chạy môi trường phát triển (Development)
npm run dev

# Hoặc Build & Chạy bản sản xuất (Production)
npm run build
npm run start
```
Truy cập: `http://localhost:3000`

### 3. Tài khoản quản trị mặc định
- **Email:** `admin@gmail.com`
- **Mật khẩu:** `123456`

### 4. Tài liệu Swagger API
- **Giao diện trực quan (Swagger UI):** `http://localhost:3000/api-doc`
- **OpenAPI JSON Spec:** `http://localhost:3000/api/doc`

---

## 1. Nguyên tắc chung

Toàn bộ hệ thống là một web duy nhất, không có ứng dụng di động riêng. Cùng một mã nguồn phục vụ cả người quản lý dùng trên máy tính và nhân viên hiện trường dùng trên điện thoại, giao diện tự thích ứng theo kích thước màn hình và theo vai trò đăng nhập.

Frontend không tự quyết định logic nghiệp vụ. Mọi việc như task được phép chuyển giai đoạn hay không, ai được xem gì, đều do backend trả về, frontend chỉ hiển thị đúng theo dữ liệu và trạng thái nhận được, tránh việc tự suy luận quyền ở phía giao diện rồi lệch với thực tế.

## 2. Cấu trúc điều hướng chính

Hệ thống chia làm hai khu vực trải nghiệm khác nhau, cùng tồn tại trong một ứng dụng:

- Khu vực quản trị, dành cho người có quyền quản lý: quản lý dự án, nhân sự, task mẫu, lịch trình, theo dõi tiến độ, báo cáo.
- Khu vực thực thi, dành cho người trực tiếp làm việc: xem task hôm nay, xử lý từng công việc, nộp minh chứng.

Một nhân sự có thể thấy cả hai khu vực nếu vừa quản lý vừa trực tiếp thực hiện công việc trong cùng dự án. Sau khi đăng nhập, nếu nhân sự có nhiều dự án, cần có bước chọn đang làm việc ở dự án nào, vì toàn bộ dữ liệu hiển thị sau đó phụ thuộc vào lựa chọn này.

## 3. Trạng thái cần quản lý xuyên suốt ứng dụng

- Nhân sự hiện tại và toàn bộ danh sách dự án kèm role tương ứng.
- Dự án và khu đang được chọn để làm việc.
- Quyền hiện tại trong bối cảnh dự án đang chọn, dùng để ẩn hiện các nút hành động.
- Cây công việc của task đang xem, gồm trạng thái từng task, để cập nhật ngay trên giao diện khi có thay đổi mà không cần tải lại toàn trang.

## 4. Thành phần giao diện dùng lại nhiều nơi

### Cây công việc có thể thu gọn và mở rộng
Dùng ở cả màn hình cấu hình task mẫu và màn hình task hôm nay. Cần thiết kế sao cho hiển thị rõ nhiều cấp lồng nhau mà không rối mắt, mặc định thu gọn các nhánh đã hoàn thành, giữ mở các nhánh còn việc cần làm.

### Form nộp minh chứng nhiều loại
Một task có thể yêu cầu nhiều loại minh chứng cùng lúc, ví dụ vừa nhập số liệu vừa gửi ảnh. Thành phần này cần hiển thị đúng các ô nhập tương ứng theo từng loại yêu cầu, kiểm tra đủ dữ liệu bắt buộc trước khi cho phép gửi.

### Nút hành động chuyển giai đoạn
Chỉ hiển thị nút chuyển sang giai đoạn tiếp theo nếu nhân sự hiện tại có role khớp với giai đoạn đích. Nếu không khớp, task vẫn hiển thị nhưng ở dạng chỉ xem, kèm thông tin đang chờ ai xử lý tiếp.

### Dòng thời gian lịch sử xử lý
Hiển thị toàn bộ lịch sử chuyển giai đoạn của một task, ai làm, lúc nào, có ghi chú gì. Dùng ở màn hình chi tiết task cho cả người thực hiện lẫn người quản lý.

### Ma trận phân quyền
Dùng khi cấu hình task mẫu, hiển thị dạng bảng, hàng là các task, cột là các role, ô là hành động được chọn từ danh mục hành động chuẩn hoá. Cần cho phép chọn nhanh bằng dropdown thay vì gõ tay.

## 5. Luồng xử lý chính và API tương ứng

- Người quản lý xây dựng task mẫu: tạo và sắp xếp cây công việc, gán yêu cầu minh chứng và giai đoạn xử lý cho từng task lá, gọi các API thuộc nhóm task mẫu.
- Người quản lý lên lịch: chọn task mẫu, chọn phạm vi áp dụng, thiết lập tần suất, gọi API tạo lịch trình.
- Nhân viên xem việc hôm nay: gọi API lấy task hôm nay ngay khi vào màn hình chính, không cần thao tác chọn thêm.
- Nhân viên xử lý một công việc: mở chi tiết task, nộp minh chứng qua API nộp minh chứng, sau đó gọi API chuyển giai đoạn nếu được phép.
- Người quản lý duyệt công việc: mở task đang chờ duyệt, xem minh chứng đã nộp, gọi API chuyển giai đoạn để duyệt hoặc từ chối.
- Người quản lý thêm việc phát sinh: từ màn hình task của một ngày cụ thể, gọi API thêm task vào instance đó.
- Người quản lý theo dõi tổng thể: gọi các API báo cáo, lọc theo dự án, khu, thời gian.

## 6. Yêu cầu về trải nghiệm cần đảm bảo khi hiện thực

- Trên màn hình điện thoại, khu vực thực thi cần chữ to, nút bấm lớn, thao tác được bằng một tay, hạn chế các bước phụ không cần thiết trước khi hoàn thành một công việc.
- Khi mạng chập chờn, cần có phản hồi rõ ràng cho nhân sự biết dữ liệu đã gửi thành công hay chưa, tránh trường hợp nhân sự tưởng đã nộp xong nhưng thực tế chưa gửi được lên server.
- Khi nhiều người cùng xử lý chung một task, ví dụ nhân viên vừa nộp xong thì quản lý cần thấy ngay để duyệt, cần có cơ chế cập nhật dữ liệu mới mà không bắt nhân sự phải tự bấm tải lại trang liên tục.
- Giao diện cấu hình task mẫu và ma trận phân quyền là nơi phức tạp nhất, cần ưu tiên sự rõ ràng hơn tốc độ phát triển, vì đây là nơi dễ cấu hình sai và ảnh hưởng tới toàn bộ dữ liệu sinh ra sau đó.