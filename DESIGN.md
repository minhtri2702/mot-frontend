---
name: Mọt Truyện
description: Thư viện truyện đêm ấm áp, tập trung vào khám phá và đọc tiếp.
colors:
  ember: "#e9613b"
  ember-deep: "#c84629"
  night-ink: "#151515"
  night-surface: "#1d1c1a"
  night-raised: "#272522"
  paper: "#f8f5ef"
  paper-surface: "#fffdf8"
  quiet-text: "#aaa49b"
  hairline: "#3a3732"
typography:
  headline:
    fontFamily: "Space Grotesk, Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  card-manga:
    backgroundColor: "{colors.night-surface}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0"
---

# Design System: Mọt Truyện

## Overview

**Creative North Star: "Thư viện đêm"**

Mọt giống một hiệu sách nhỏ còn sáng đèn vào cuối ngày: yên, ấm và đầy bìa truyện nhiều màu. Giao diện dùng nền than ấm để ảnh truyện tự tạo sức sống; chrome sản phẩm được giữ phẳng, rõ và quen thuộc. Mật độ đủ cao cho người mê truyện nhưng mỗi khu vực có nhịp nghỉ rõ ràng.

Hệ thống tuyệt đối tránh dashboard SaaS, glassmorphism tràn lan, neon gaming và các dãy card lồng nhau. Mobile là bề mặt chính; desktop mở rộng mật độ chứ không thay đổi mô hình điều hướng.

**Key Characteristics:**

- Nền trung tính ấm, không dùng đen hoặc trắng tuyệt đối.
- Cam son chỉ đánh dấu hành động, lựa chọn và nội dung mới.
- Ảnh bìa lớn, metadata ngắn và dễ quét.
- Bề mặt phẳng; chiều sâu xuất hiện khi tương tác.
- Chuyển động nhanh, có mục đích và có chế độ giảm chuyển động.

## Colors

Bảng màu “mực, giấy và than hồng” tạo không gian đọc dịu, trong khi ảnh bìa giữ vai trò nguồn màu phong phú.

### Primary

- **Than Hồng:** Accent dành cho CTA, focus, tab đang chọn và chương mới.
- **Than Hồng Đậm:** Trạng thái nhấn và hover có tương phản cao.

### Neutral

- **Mực Đêm:** Nền dark mode chính.
- **Kệ Gỗ Tối:** Bề mặt nhóm nội dung.
- **Giấy Ấm:** Nền light mode, tránh trắng lạnh.
- **Mực Nhạt:** Metadata và nội dung thứ cấp.

**The Ember Rule.** Cam son chiếm không quá 10% một màn hình; nếu mọi thứ đều nổi bật thì không còn gì nổi bật.

## Typography

**Display Font:** Space Grotesk (với Plus Jakarta Sans dự phòng)  
**Body Font:** Plus Jakarta Sans (với system-ui dự phòng)

**Character:** Tiêu đề chắc và hơi biên tập; nội dung thân thiện, rõ nét khi đọc tiếng Việt ở kích thước nhỏ.

### Hierarchy

- **Headline** (600, 1.5rem, 1.2): Tiêu đề trang và khu vực chính.
- **Title** (600, 1rem, 1.35): Tên truyện, tối đa hai dòng.
- **Body** (400, 1rem, 1.6): Mô tả và văn bản dài, tối đa 70ch.
- **Label** (600, 0.8125rem, 1.3): Metadata, nút và filter; không viết hoa toàn bộ tiếng Việt.

**The Scan First Rule.** Tên truyện, chương mới và thời gian cập nhật phải tạo thành một đường quét rõ trước mọi metadata khác.

## Elevation

Hệ thống phẳng theo mặc định và dùng thay đổi màu bề mặt cùng border mảnh để phân tầng. Shadow chỉ xuất hiện ở menu nổi, dialog và card đang hover; không dùng blur nền như một lớp trang trí thường trực.

**The Flat Shelf Rule.** Một section không cần card bao ngoài; nhóm bằng khoảng cách, tiêu đề và divider trước khi thêm container.

## Components

### Buttons

- **Shape:** Bo vừa phải (12px), không pill trừ control có tính lọc.
- **Primary:** Cam son với chữ mực đậm, padding 10px 16px.
- **Hover / Focus:** Đậm màu khi hover; focus ring 2px rõ và có offset.
- **Ghost:** Không nền ở trạng thái nghỉ, chỉ lên một lớp neutral khi hover.

### Chips

- **Style:** Pill nhỏ chỉ dùng cho thể loại và filter.
- **State:** Trạng thái chọn dùng accent; chưa chọn dùng nền neutral và border mảnh.

### Cards / Containers

- **Corner Style:** 12px cho ảnh truyện, 18px cho hero.
- **Background:** Card truyện không có khung bao metadata; ảnh chính là ranh giới.
- **Shadow Strategy:** Chỉ nâng nhẹ khi hover trên thiết bị có con trỏ.
- **Internal Padding:** Ảnh không padding; metadata bắt đầu cách ảnh 10px.

### Inputs / Fields

- **Style:** Nền neutral rõ ràng, border 1px và bán kính 12px.
- **Focus:** Border cam son và ring có tương phản.
- **Error / Disabled:** Luôn có icon hoặc copy hỗ trợ, không chỉ đổi màu.

### Navigation

Header desktop gọn, có tìm kiếm nổi bật và trạng thái trang hiện tại. Mobile giữ menu ngắn, mục tiêu chạm ít nhất 44px và không giấu hành động tìm kiếm.

## Do's and Don'ts

### Do:

- **Do** ưu tiên “Đọc tiếp” trước nội dung khám phá khi có lịch sử.
- **Do** dùng nền than xám để ảnh bìa nhiều màu nổi bật tự nhiên.
- **Do** giữ trạng thái hover/focus/active nhất quán và nhanh trong 150–220ms.
- **Do** dùng skeleton giữ đúng tỷ lệ ảnh để tránh layout shift.

### Don't:

- **Don't** tạo dashboard SaaS hoặc bọc mọi section trong card.
- **Don't** dùng glassmorphism tràn lan, backdrop blur chỉ dành cho lớp nổi có lý do.
- **Don't** dùng neon gaming, gradient text hoặc đen/trắng tuyệt đối.
- **Don't** lặp nhiều carousel tự chạy; người dùng phải kiểm soát chuyển động.
- **Don't** hiển thị metadata không giúp người dùng quyết định đọc.
