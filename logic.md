bạn tìm cái gì lâu vậy xem lại logic tui nói xem bạn có đang implent đúng không. 
1. scopeType => chọn các dự án trong scope đó ở bảng headcount_projects.active = true
2. với từng project xem plan nào đang active => lấy các phase trong plain đó ra => đối chiếu thời gian của phase nào trong fromMonth => được các milestone cần tính.

3. lọc role theo scopeType.

4. chạy định biên theo dự án:
 4.1 với mỗi dự án lọc headcount_standard theo role bước 3 và theo projectType, from_milestrone và to_milestone. 
4.2 lấy các properties - value của dự án đó ra.
 4.2 với mỗi headcount_standard:
   4.2.1 dựa trên headcount_criteria lấy được property sao đó xem có match không. Nếu match tính tiếp headcount_criteria  (nếu có), không match loại.
   4.2.2: nếu pass qua bước 4.2.1 thì lấy hệ số tối ưu thông qua headcount_monthly_factors. 
   4.2.3: từ hệ số tối ưu đó nhân với headcount => định biên của một role
  4.3 tổng hợp lại nếu một role và có hơn headcount_standard => lấy cái tối ưu nhân sự hơn.
  4.4 tổng hợp được định biên của 1 dự án.
  4.5 tổng hợp lên vùng (nếu có)
  4.6 tổng hợp lên sector (nếu có).
  