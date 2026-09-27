# CafeFlow Admin Dashboard — báo cáo hoàn thiện

Ngày kiểm tra: 27/09/2026.

1. **Mock trước đây:** toàn bộ KPI, phần trăm tăng trưởng, biểu đồ doanh thu/trạng thái, bàn, đơn hàng, khách, sản phẩm bán chạy, tồn kho, nhân viên và các dự báo/nhận định AI đều là hằng số frontend. Đã thay bằng API; bỏ dự báo AI không có nguồn, nút giả, ô tìm kiếm/header notification giả và liên kết Reports không có route.
2. **Endpoint:** `GET /api/admin/dashboard`, middleware `auth:sanctum` + `admin_middleware`. Customer/Staff trả 403, chưa đăng nhập trả 401. Controller chỉ validate và gọi `AdminDashboardService`.
3. **Date range:** `TODAY` (mặc định), `7_DAYS`, `30_DAYS`, `THIS_MONTH`, `CUSTOM&from=YYYY-MM-DD&to=YYYY-MM-DD`. Custom tối đa 366 ngày, có kiểm tra ngày hợp lệ và thứ tự.
4. **Revenue:** `SUM(payments.amount)` với `status=SUCCESS`, lọc `paid_at`. Không lấy tổng đơn/hóa đơn; payment không có thời điểm thanh toán không được tính vào một kỳ ngày cụ thể.
5. **Orders:** đếm `orders.created_at` trong kỳ, đủ 7 trạng thái, breakdown DINE_IN/TAKEAWAY.
6. **AOV:** doanh thu chia `COUNT(DISTINCT payments.order_id)` của tập thanh toán thành công trong kỳ; mẫu số 0 trả 0. Một đơn thanh toán thành công vẫn đóng góp revenue kể cả trạng thái đơn không phải COMPLETED; doanh số sản phẩm/giảm giá loại đơn CANCELLED.
7. **Customers:** card chính là khách đăng ký mới (`customers.created_at`) trong kỳ. Widget riêng hiển thị tổng và ACTIVE hiện tại. Thêm `/admin/customers` có tìm kiếm, phân trang, dùng API customers có sẵn.
8. **Tables:** group theo `cafe_tables.status` hiện tại, không áp date range.
9. **Inventory:** tái sử dụng `AdminInventoryService`, đổi summary sang aggregate SQL. OUT: stock <= 0; LOW: 0 < stock <= minimum; NORMAL: stock > minimum. Danh sách tối đa 5, ưu tiên tồn thấp; số liệu/dashboard list cùng xét tất cả nguyên liệu. Product availability đọc các trường dẫn xuất do service Inventory hiện có duy trì, không sửa Product.status.
10. **Attendance:** `attendances.work_date` là ngày Việt Nam hôm nay. Các trạng thái là số bản ghi theo ca, được ghi rõ trong UI. Ca chưa có bản ghi lấy assignment không có attendance tương ứng. Nhân viên đang làm phải đang trong khung giờ ca, có check-in PRESENT/LATE và chưa check-out; hỗ trợ ca qua đêm và đếm staff distinct.
11. **Payroll:** kỳ chứa ngày Việt Nam hôm nay; nếu có nhiều kỳ trùng, chọn start_date mới nhất rồi id lớn nhất. Tổng net_salary và số staff distinct trong kỳ. Không có kỳ trả null/empty state.
12. **Reservations:** theo `reservation_at` trong kỳ, đủ 6 trạng thái; recent ưu tiên PENDING, tối đa 5. Thêm API/trang danh sách `/admin/reservations` với lọc trạng thái, tìm kiếm, phân trang; đây là trang xem danh sách, không bổ sung workflow duyệt đặt bàn.
13. **Promotions:** RUNNING/UPCOMING/ENDED/INACTIVE dẫn xuất từ status/starts_at/ends_at tại thời điểm đọc, không ghi DB. Giảm giá cộng `order_promotions.discount_amount` của đơn không hủy có payment SUCCESS trong kỳ thanh toán. Voucher hiển thị trạng thái hiện tại, UNUSED/RESERVED quá expires_at được dẫn xuất EXPIRED, không ghi DB.
14. **AI:** đọc `ai_settings.enabled` và tên assistant; chưa có setting trả null, không giả là đang bật. Conversations/messages lọc theo created_at trong kỳ; FALLBACK/ERROR từ status; top intent đếm tin USER để tránh đếm hai lần một lượt hỏi/đáp.
15. **Top products:** tối đa 5, cộng quantity từ order_items của đơn không CANCELLED đã thanh toán thành công trong kỳ; group product_id + tên snapshot. Không hiển thị revenue sản phẩm khi chưa bảo đảm phân bổ giảm giá.
16. **Recent orders:** tối đa 8 đơn tạo gần nhất trong kỳ, join customer một lần; WALK_IN hiển thị Khách vãng lai, thành viên dùng tên thật. Link đến Orders. Recent activity API chỉ lấy sự kiện tạo đơn thật, không suy diễn người thao tác.
17. **Chart:** một ngày group theo giờ; đến 62 ngày group theo ngày; dài hơn group theo tháng. Aggregate tại DB, backend điền bucket không phát sinh bằng 0. Tooltip có thời gian, VND đầy đủ và số đơn.
18. **Comparison:** tính thật. TODAY so hôm qua; 7/30 ngày và custom so khoảng liền trước cùng số ngày; THIS_MONTH so toàn bộ tháng trước. Kỳ trước doanh thu 0 trả null, không hiển thị phần trăm vô nghĩa.
19. **Actions:** date selector, custom submit, refresh, retry và các link đều có xử lý/route thật. Link attendance mở đúng tab. Quick actions điều hướng module, không thêm CRUD trên Dashboard.
20. **Fake data:** không còn business mock, random chart, fake activity hay hardcoded counts trong Dashboard. Mảng trạng thái/nhãn/màu và skeleton chỉ là cấu hình giao diện.
21. **N+1:** aggregate SQL, join/select trường cần, danh sách limit. Test chứng minh thêm 20 đơn không làm tăng số query tổng hợp; dưới 45 query trong fixture kiểm thử.
22. **Indexes:** migration ALTER mới `2026_09_27_000001_add_dashboard_indexes.php`, đã chạy trên database hiện có: payments(status,paid_at), orders(created_at,status), reservations(reservation_at,status), customers(created_at), ai_conversations(created_at), staff_shift_assignments(work_date,work_shift_id). Tái sử dụng indexes attendance(work_date), attendance(staff_id), ai_messages(created_at) đã có. Không thêm payments.created_at vì doanh thu lọc paid_at; không thêm index status riêng không phục vụ query.
23. **Reports consistency:** source chưa có module Reports thực tế. Hai summary hiện có ở Orders/Invoices đã dùng chung `RevenueService` với Dashboard; test so sánh cùng ngày và cùng dữ liệu trả cùng revenue/AOV. Invoice summary giữ scope hôm nay, Orders summary hỗ trợ date_from/date_to.
24. **Backend:** `php artisan optimize:clear` PASS; `php artisan route:list --path=dashboard` PASS, xác nhận middleware bằng `-v`; `php artisan test` PASS: 8 tests, 94 assertions (6 test Dashboard và 2 test có sẵn). Test dùng SQLite `:memory:` và migrate thông thường trên connection riêng.
25. **Frontend:** `npm.cmd run build` PASS; ESLint tất cả file frontend thay đổi PASS. Chrome headless với API/database thật: 1440/1024/768 px không tràn ngang, chart render, 7/30 ngày/tháng/custom gọi API 200, refresh và đích Customers/Reservations hoạt động, offline hiển thị lỗi và retry khôi phục thành công, không có runtime exception. Cảnh báo bundle >500 kB của Vite còn tồn tại; không cài thư viện mới.
26. **Dữ liệu:** KHÔNG chạy `migrate:fresh`, không reset/seed database đang dùng. Chỉ thêm index. Phiên đăng nhập tạm dùng để kiểm tra browser được thu hồi sau kiểm tra.

## Quy ước thời gian

`config/app.php` đang là UTC. Giữ quy ước lưu timestamp này để không diễn giải lại lịch sử hoặc trộn timestamp cũ/mới. `DashboardRange::TIMEZONE` là `Asia/Ho_Chi_Minh`: ngày bắt đầu/kết thúc, tháng, kỳ trước, ngày công và kỳ lương được xác định theo Việt Nam. Truy vấn timestamp đổi ranh giới sang UTC, dùng khoảng nửa mở `[from, next_day)`; chart chuyển UTC +7 trước khi group. Frontend format thời gian bằng timezone Việt Nam.

Các giá trị ngày/giờ do người dùng nhập hiện được lưu dưới dạng civil time (reservation_at, starts_at/ends_at, expires_at, work_date và giờ ca), nên Dashboard so sánh theo giờ Việt Nam trực tiếp. Không sửa/chuyển đổi hàng loạt dữ liệu lịch sử. Các luồng chấm công/đặt bàn/khuyến mãi cũ ngoài Dashboard vẫn giữ implementation hiện có; báo cáo này không khẳng định đã chuẩn hóa toàn bộ các luồng ghi ngày giờ đó.

## Các file chính

- `backend/app/Services/Admin/AdminDashboardService.php`: aggregate toàn bộ sections.
- `backend/app/Services/Admin/DashboardRange.php`: ranh giới ngày và kỳ so sánh.
- `backend/app/Services/Admin/RevenueService.php`: nguồn doanh thu dùng chung.
- `backend/tests/Feature/AdminDashboardTest.php`: regression nghiệp vụ, phân quyền, boundary và query count.
- `frontend/src/pages/Admin/Dashboard/index.jsx`: UI dữ liệu thật, loading/error/empty, navigation.
- `frontend/src/services/admin/dashboard.service.js`: một request aggregate, hủy request cũ khi đổi filter.
