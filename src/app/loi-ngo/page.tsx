import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lời ngỏ",
  description: "Một vài điều về dự án này",
};

export default function LoiNgoPage() {
  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-hidden bg-background md:static md:z-auto md:min-h-[calc(100dvh-4rem)] md:overflow-visible">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 py-3 sm:px-6 sm:py-5 md:px-8 md:py-8">

        {/* Header */}
        <header className="mb-2 md:mb-6">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Lời ngỏ
          </h1>
          <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs md:mt-2">
            Hà Nội
          </p>
        </header>
        {/* Content */}
        <article className="flex-1 space-y-2 overflow-hidden text-[10.5px] leading-[1.45] text-muted-foreground sm:text-xs sm:leading-5 md:space-y-4 md:overflow-visible md:text-sm md:leading-7">
          <p>
            Dạo này vừa ốm vừa lười nên mãi không xong đuợc, mình nghĩ về nó lần đầu vào những ngày đầu năm 2014 nhưng về sau mải chuyện đi học, rồi chuyện đi làm nên giờ mới hòm hòm. Mãi mình vẫn nhớ về  một góc nhỏ ở Mọt Coffee, quán cà phê sách giữa lòng Hà Nội.
            <br />
            Trên bàn, cốc bơ già thảo mộc vẫn còn nghi ngút khói, cuốn Rừng Na Uy nằm mở, radio vang lên giai điệu Mary on a Cross
          </p>
          <p>Mình làm ra nó không phải vì mục đích gì cả, UI cũng không quá xịn, tốc độ cũng không quá nhanh vậy nên nó sẽ hoàn toàn miễn phí.</p>
          <p className="border-l-2 border-red-500/40 pl-3 text-foreground">
            Mình vẫn đi làm, cũng không tính chuyện kiếm tiền từ việc này. Nhưng nếu sau này, nếu có nguồn thu nhập nào phát sinh,
            một phần sẽ được dùng để đầu tư vào hạ tầng và duy trì hệ thống.
            <br/>
            Toàn bộ phần còn lại sẽ dành cho việc thiện nguyện,
            hỗ trợ trẻ em có hoàn cảnh khó khăn.
            <br />
            Bởi vậy, nếu bạn có vô tình nhìn thấy mấy cái quảng cáo, hay lỡ tay bấm vô cái đường link Shopee nào đó, thì cứ yên tâm.
            <br />
            Bạn không làm giàu cho ai cả. (Nhưng mà, cũng chẳng biết khi nào ngày đó mới đến :v).
          </p>
          <p>
            Hiện tại mình cũng không có biện pháp bảo mật gì đặc biệt.
            Nếu muốn DDoS hay hack gì thì hãy cứ thoải mái. Ai thèm quan tâm chứ :)))
            <br />
            Hạ tầng hiện tại còn khá đơn giản,
            nên đôi lúc trải nghiệm có thể chưa thật sự ổn định.
          </p>
          <p className="border-l-2 border-red-500/40 pl-3 text-foreground">
            Mình không trực tiếp tạo ra hay tham gia sản xuất bất kỳ nội dung nào xuất hiện trên web/app.
            Tất cả đều được tổng hợp từ những nguồn công khai trên internet.
            Nếu có nội dung nào ảnh hưởng tới bạn,
            hãy liên hệ với Mình.
            <br />
            Mình sẽ xử lý nhanh nhất có thể.
          </p>

        </article>
        {/* Footer */}
        <footer className="mt-2 border-t border-border pt-2 md:mt-6 md:pt-3">
          <p className="text-[10px] italic text-muted-foreground sm:text-xs">
            Cảm ơn vì đã ghé qua
          </p>
        </footer>

      </div>
    </div>
  );
}
