# 🎮 Kéo–Búa–Bao (Rock–Paper–Scissors)

Game **Kéo–Búa–Bao** với giao diện glassmorphism hiện đại, AI thích nghi, hỗ trợ đa ngôn ngữ (vi/en), dark/light theme. Chạy offline không cần server, chỉ cần mở `index.html`.

---

## 🚀 Hướng dẫn chạy

1. Tải về / clone repo về máy
2. Mở file `index.html` bằng trình duyệt (Chrome/Edge/Firefox mới nhất)
3. Chơi ngay — không cần cài đặt gì thêm!

> **Lưu ý**: Cần kết nối internet lần đầu để tải font Google Fonts (Poppins). Sau đó font được cache offline. Icons SVG và âm thanh (Web Audio API) hoạt động hoàn toàn offline.

---

## 📁 Cấu trúc thư mục

```
/
├─ index.html              Giao diện chính
├─ styles.css              CSS với glassmorphism, CSS Variables, responsive
├─ app.js                  Điểm vào, khởi tạo game, gắn sự kiện UI, i18n
├─ game/
│   ├─ engine.js           Luật chơi, vòng/loạt trận, tính điểm
│   ├─ ai.js               AI thích nghi: đếm tần suất + trọng số ngẫu nhiên
│   └─ storage.js          localStorage: lưu điểm, lịch sử, cấu hình
├─ ui/
│   ├─ dom.js              Query selector, render helpers, screen reader
│   ├─ animations.js       Hiệu ứng thắng/thua/hòa, confetti, countdown
│   └─ sounds.js           Web Audio API: click, thắng, thua, hòa
├─ assets/
│   └─ icons.svg           SVG sprite: kéo, búa, bao, logo, sun, moon...
└─ README.md               Tài liệu này
```

---

## 🎮 Luật chơi

| Lựa chọn | Thắng | Thua |
|----------|-------|------|
| ✌ Kéo    | Bao   | Búa  |
| ✊ Búa   | Kéo   | Bao  |
| 🖐 Bao   | Búa   | Kéo  |

### Chế độ chơi
- **Nhanh** — 1 ván, xem kết quả ngay
- **Bo3** — Thắng 2/3 ván
- **Bo5** — Thắng 3/5 ván
- **First-to-N** — Ai đạt N điểm trước thắng (N từ 3–10, mặc định 3)

---

## 🤖 AI thích nghi

AI phân tích 10 lựa chọn gần nhất của bạn để dự đoán và khắc chế:

| Độ khó | Theo dự đoán | Ngẫu nhiên |
|--------|-------------|------------|
| Dễ     | 50%         | 50%        |
| Vừa    | 70%         | 30%        |
| Khó    | 85%         | 15%        |

**Yếu tố công bằng**: Nếu AI thắng >70% trong 10 lượt gần nhất, trọng số dự đoán tự động giảm 10%.

---

## ⌨️ Hướng dẫn sử dụng & Phím tắt

| Phím | Hành động |
|------|-----------|
| `1`  | Chọn Kéo (Scissors) |
| `2`  | Chọn Búa (Rock) |
| `3`  | Chọn Bao (Paper) |
| `R`  | Chơi lại / Vòng mới |
| `M`  | Bật/Tắt âm thanh |
| `T`  | Đổi giao diện sáng/tối |
| `?`  | Mở cửa sổ trợ giúp |
| `Esc`| Đóng cửa sổ |

**Trên giao diện**: Nhấn nút `?` ở góc trên phải để xem hướng dẫn.

---

## 💾 Lưu trữ (localStorage)

Các dữ liệu được tự động lưu và khôi phục:
- ✅ Điểm số, số lượt, số hòa
- ✅ Lịch sử 20 lượt gần nhất
- ✅ Cài đặt: theme, ngôn ngữ, độ khó, chế độ chơi
- ✅ Bộ nhớ AI (tần suất lựa chọn của bạn)

Nhấn **🗑 Đặt lại** → xác nhận để xóa sạch dữ liệu game.

---

## ✅ Kiểm thử nhanh (Acceptance Tests)

### [UI] Responsive
- Ở màn hình < 480px: Nút không tràn, chữ không vỡ, bố cục 1 cột
- Ở ≥ 768px: Bố cục 2 cột (chơi | sidebar)

### [Logic] Quy tắc thắng thua
- Kéo > Bao: người chọn Kéo, máy chọn Bao → **Thắng**
- Bao > Búa: người chọn Bao, máy chọn Búa → **Thắng**
- Búa > Kéo: người chọn Búa, máy chọn Kéo → **Thắng**
- Cùng lựa chọn → **Hòa**

### [AI] Phản ứng theo tần suất
- Chọn liên tục "Kéo" ở độ khó Khó → máy chọn "Búa" nhiều hơn "Bao"

### [State] Persistence
- Refresh trang → Giữ điểm, lịch sử, theme, âm thanh, ngôn ngữ, độ khó

### [Controls] First-to-N
- Chọn "First to 5" → Progress bar cập nhật đúng, game kết thúc khi đạt 5

### [A11y] Accessibility
- Tab đến tất cả nút, focus ring rõ ràng
- Screen reader đọc kết quả "Bạn thắng/Thua/Hòa" qua aria-live region
- Keyboard shortcuts hoạt động (1/2/3/R/M/T/?)

### [Reset] Xác nhận đặt lại
- Nhấn "Đặt lại" → Hiện hộp thoại xác nhận
- Sau xác nhận → Điểm về 0, lịch sử trống

---

## 🎨 Tính năng

- **Glassmorphism UI**: Glass effect, gradient, backdrop blur
- **Dark/Light Theme**: Tự động theo `prefers-color-scheme`, nút override
- **Hiệu ứng**:
  - 🏆 Thắng: Card sáng lên (glow) + Confetti canvas
  - 😔 Thua: Card rung nhẹ (shake)
  - 🤝 Hòa: Cả hai pulse nhịp
  - Đếm ngược 3-2-1 trước khi lật bài
- **Âm thanh**: Web Audio API tổng hợp (không cần file .mp3)
- **i18n**: Tiếng Việt / English, lưu vào localStorage
- **Accessibility**: WCAG AA, aria-labels, live regions, focus management

---

## 🛠️ Công nghệ

- **HTML5** + **CSS3** (không framework CSS)
- **JavaScript ES6 Modules** (không bundler, không thư viện)
- **Web Audio API** (âm thanh tổng hợp)
- **Canvas API** (confetti)
- **localStorage** (persistence)
- **Google Fonts** (Poppins)

---

## 📄 Giấy phép

MIT License © 2025
