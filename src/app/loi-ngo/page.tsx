
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lời ngỏ",
  description: "Một vài điều về dự án này",
};

export default function LoiNgoPage() {
  return (
    <div className="container max-w-5xl mx-auto px-6 py-8 min-h-screen flex flex-col">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Lời ngỏ
        </h1>

        <div className="mt-2 text-xs text-muted-foreground">
          Hà Nội, 22/05/2024 · Một ngày khá lạnh
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 text-[14px] leading-6 text-muted-foreground">

        <p>
          Project này được nghĩ ra trong một góc nhỏ của Mọt Coffee.
        </p>

        <p>
          Không phải là một cái gì to tát cả, chỉ đơn giản là nó hoàn toàn miễn phí.
        </p>

        <p>
          Mình không có ý định biến nó thành một business.
          Và mình nghĩ nó sẽ luôn như vậy.
        </p>

        <p>
          Nếu sau này project có tạo ra doanh thu,
          một phần sẽ được dùng đầu tư và hạ tầng 
          và trì hệ thống.
        </p>

        <p>
          Tất cả phần còn lại sẽ dành cho việc thiện nguyện hỗ trợ trẻ em
          có hoàn cảnh khó khăn.
        </p>

        <p>
          Vì thế nếu bạn nhìn thấy quảng cáo,
          hoặc lỡ bấm vào một link shoppe nào đó,
          thì cứ yên tâm.
          Bạn không làm giàu cho ai cả.
        </p>

        <p>
          Mình không trực tiếp tạo ra hay tham gia sản suất bất kỳ nội dung nào
          xuất hiện trên web/app.
          Tất cả đều được tổng hợp từ những nguồn công khai trên internet.
        </p>

        <p>
          Nếu có nội dung nào ảnh hưởng tới bạn, thì đừng ngại
          hãy liên hệ với mình.
          Mình sẽ xử lý nhanh nhất có thể.
        </p>

        <p>
          Hiện tại project vẫn đang chạy trên chiếc laptop cũ
          mình dùng từ thời sinh viên,
          đặt trong góc phòng trọ ở Hà Nội.
        </p>

        <p>
          Mình không có hạ tầng mạnh,
          không CDN xịn,
          cũng chẳng có biện pháp bảo mật gì đáng kể.
        </p>

      </div>
      <div className="mt-10 pt-6 border-t text-xs text-muted-foreground">
        Cảm ơn vì đã ghé qua.
      </div>
    </div>
  );
}
