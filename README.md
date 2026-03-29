# ✊ Kéo–Búa–Bao (Rock–Paper–Scissors)

Game **Kéo–Búa–Bao** hiện đại với AI thích nghi, nhiều chế độ chơi, giao diện glassmorphism đẹp, hỗ trợ offline (PWA).

---

## 🚀 Hướng dẫn chạy

### Mở trực tiếp bằng trình duyệt
```bash
# Cách 1: Mở file index.html trực tiếp
# (Chỉ dùng cho development; một số tính năng PWA cần server)
open index.html   # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

### Chạy với local server (khuyến nghị)
```bash
# Python (có sẵn trên hầu hết hệ thống)
python -m http.server 8080
# → Mở http://localhost:8080

# Node.js (nếu có npx)
npx serve .
# → Mở http://localhost:3000

# VS Code: Cài extension "Live Server" → click "Go Live"
```

> **Lưu ý:** Game chạy **hoàn toàn offline** sau lần đầu tải trang (PWA Service Worker cache tất cả file tĩnh).

---

## 📁 Cấu trúc thư mục

```
/
├─ index.html              # Giao diện chính
├─ styles.css              # CSS (Glassmorphism, Dark/Light theme, Responsive)
├─ app.js                  # Entry point, khởi tạo game, gắn sự kiện UI
├─ game/
│   ├─ engine.js           # Luật chơi, vòng/loạt trận, tính điểm
│   ├─ ai.js               # AI thích nghi (tần suất + trọng số ngẫu nhiên)
│   └─ storage.js          # localStorage: lưu điểm, lịch sử, cấu hình
├─ ui/
│   ├─ dom.js              # Query selector, render helpers
│   ├─ animations.js       # Hiệu ứng thắng/thua/hòa, confetti, shake, pulse
│   └─ sounds.js           # Quản lý âm thanh (Web Audio API, không cần file .mp3)
├─ assets/
│   └─ icons.svg           # SVG sprite biểu tượng Kéo/Búa/Bao
├─ manifest.webmanifest    # PWA manifest
├─ sw.js                   # Service Worker (cache offline)
└─ README.md               # Tài liệu này
```

---

## 🎮 Hướng dẫn sử dụng

### Chơi game
1. **Chọn nước đi**: Nhấn vào nút **Kéo ✌️**, **Búa ✊**, hoặc **Bao 🖐️**
2. AI sẽ tự động chọn nước đi và hiển thị kết quả
3. Kết quả được cập nhật realtime vào bảng điểm và lịch sử

### Chế độ chơi
| Chế độ | Mô tả |
|--------|-------|
| **Chơi nhanh** | Mỗi ván là một lượt độc lập |
| **Best of 3** | Thắng 2 lượt trước (tối đa 3) |
| **Best of 5** | Thắng 3 lượt trước (tối đa 5) |
| **First to N** | Ai đạt N điểm trước thắng (N từ 2–10) |

### Độ khó AI
| Độ khó | Hành vi |
|--------|---------|
| **Dễ** | 50% theo dự đoán, 50% ngẫu nhiên |
| **Vừa** | 70% theo dự đoán, 30% ngẫu nhiên |
| **Khó** | 85% theo dự đoán, 15% ngẫu nhiên |

> AI phân tích 8 lượt gần nhất của bạn để dự đoán nước đi. Có cơ chế "fairness" tự động giảm độ mạnh nếu AI thắng >70% trong 10 lượt liên tiếp.

---

## ⌨️ Phím tắt

| Phím | Hành động |
|------|-----------|
| `1` | Chọn Kéo ✌️ |
| `2` | Chọn Búa ✊ |
| `3` | Chọn Bao 🖐️ |
| `R` | Chơi lại vòng / loạt mới |
| `M` | Bật/Tắt âm thanh |
| `T` | Đổi giao diện Sáng/Tối |
| `Esc` | Đóng hộp thoại |

---

## ✅ Bộ kiểm thử nhanh (Quick Test Cases)

### [UI] Màn hình nhỏ (<480px)
- Mở DevTools → Responsive mode → chọn 375px
- **Kiểm tra:** Nút bấm không tràn, chữ rõ, bố cục 1 cột hoạt động bình thường

### [Logic] Luật Kéo–Búa–Bao
- Chơi 10 lượt, so sánh kết quả với bảng:
  - Kéo ✌️ **thắng** Bao 🖐️
  - Bao 🖐️ **thắng** Búa ✊
  - Búa ✊ **thắng** Kéo ✌️
  - Giống nhau → **Hòa**

### [AI] Kiểm tra phản ứng độ khó Khó
- Chọn độ khó **Khó**
- Liên tục nhấn **Kéo** (phím `1`) khoảng 7–10 lần
- **Kỳ vọng:** AI chọn **Búa** nhiều hơn các nước khác

### [State] Lưu trữ sau refresh
- Chơi vài ván, thay đổi theme/ngôn ngữ
- Refresh trang (F5)
- **Kiểm tra:** Điểm, lịch sử, theme, ngôn ngữ được giữ nguyên

### [Controls] Chế độ First to 5
- Chọn chế độ **First to N**, nhập N=5
- Chơi đến khi một bên đạt 5 điểm
- **Kiểm tra:** Progress bar tăng đúng, modal xuất hiện khi kết thúc

### [A11y] Điều khiển bằng bàn phím
- Nhấn `Tab` để di chuyển qua các nút
- **Kiểm tra:** Focus ring hiển thị rõ ràng trên tất cả phần tử tương tác
- Nhấn `1`, `2`, `3` → game phản hồi đúng
- Screen reader: kết quả được đọc qua live region

### [Reset] Xác nhận trước khi xóa
- Nhấn nút **Đặt lại tất cả** 🗑️
- **Kiểm tra:** Modal xác nhận xuất hiện
- Nhấn **Hủy** → dữ liệu giữ nguyên
- Nhấn lại và xác nhận → điểm & lịch sử được xóa sạch

---

## 🎨 Tính năng nổi bật

- **Glassmorphism UI**: Hiệu ứng kính mờ hiện đại, gradient đẹp mắt
- **Dark/Light Theme**: Chuyển đổi mượt mà, tự động nhận diện `prefers-color-scheme`
- **AI thích nghi**: Phân tích hành vi người chơi, điều chỉnh theo độ khó
- **Confetti**: Hiệu ứng giấy rơi khi thắng
- **Web Audio API**: Âm thanh tổng hợp, không cần file .mp3 bên ngoài
- **PWA**: Cài được như app, chạy offline hoàn toàn
- **i18n**: Hỗ trợ Tiếng Việt / English
- **Responsive**: Mobile-first, hoạt động tốt từ 320px đến 4K
- **Accessibility**: WCAG AA, screen reader, focus management

---

## 🛠️ Công nghệ sử dụng

- **HTML5** – Semantic markup, ARIA roles
- **CSS3** – Custom Properties, Grid, Flexbox, Animation Keyframes
- **JavaScript ES6 Modules** – Không bundler, không framework
- **Web Audio API** – Âm thanh tổng hợp
- **localStorage** – Lưu trữ client-side
- **Service Worker** – PWA offline cache
- **Google Fonts** – Font Inter

---

## 👩‍💻 Tác giả

Phát triển bởi **MinhThu** · Phiên bản 1.0 · 2025