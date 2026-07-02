import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lời ngỏ",
  description: "Một vài điều về dự án này",
};

export default function LoiNgoPage() {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="max-w-3xl mx-auto px-8 py-8 h-full flex flex-col">

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Lời ngỏ
          </h1>

          <p className="mt-2 text-xs text-muted-foreground">
            Hà Nội· Một ngày mưa
          </p>
        </header>

        {/* Content */}
        <article className=" space-y-4 text-sm leading-7 text-muted-foreground">

          <p>
            Project này được manh nha ra đời trong một góc nhỏ ở Mọt Coffe một góc cafe sách ở Hà Nội.
            <br></br>
           Dưới bàn là một cốc bơ già thảo mộc vẫn còn bốc khói, bên cạnh là cuốn Rừng Na Uy còn đọc dở,Radio đang phát Mary on a Cross.
</p>
<p>Nó không là gì cao siêu cả, chỉ đơn giản là nó hoàn toàn miễn phí.</p>
          <p className="border-l-2 border-red-500/40 pl-3 text-foreground">
            Nếu project có tạo ra doanh thu,
            một phần sẽ được dùng để đầu tư vào hạ tầng và duy trì hệ thống.
          <br></br>
            Tất cả phần còn lại sẽ dành cho việc thiện nguyện,
            hỗ trợ trẻ em có hoàn cảnh khó khăn.
        <br></br>
            Vì thế nếu bạn nhìn thấy quảng cáo,
            hoặc lỡ bấm vào một link Shopee nào đó,
            thì cứ yên tâm.
             <br></br>
            Bạn không làm giàu cho ai cả.
          </p>
          <p >
            Hiện tại project vẫn đang chạy trên chiếc laptop cũ
            mình dùng từ thời sinh viên.Nếu muốn DDoss hay hack gì thì hãy cứ thoải mái. Ai thèm quan tâm chứ :)))
          </p>
          <p>
            Hạ tầng hiện tại còn khá đơn giản,
            nên đôi lúc trải nghiệm có thể chưa thật sự ổn định.
          </p>
          <p className="border-l-2 border-red-500/40 pl-3 text-foreground">
            Mình không trực tiếp tạo ra hay tham gia sản xuất bất kỳ nội dung nào xuất hiện trên web/app. 
            Tất cả đều được tổng hợp từ những nguồn công khai trên internet.
            Nếu có nội dung nào ảnh hưởng tới bạn,
            hãy liên hệ với mình.
       <br></br>
            Mình sẽ xử lý nhanh nhất có thể.
      </p>
          
        </article>
        {/* Footer */}
        <footer className="mt-6 pt-3 border-t border-border">
          <p className="text-xs italic text-muted-foreground">
            Cảm ơn vì đã ghé qua và thật tệ nếu mưa mà bạn không cầm theo ô :)
          </p>
        </footer>

      </div>
    </div>
  );
}