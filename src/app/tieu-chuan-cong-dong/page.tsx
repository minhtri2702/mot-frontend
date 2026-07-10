import type { Metadata } from "next";
import { Shield, AlertTriangle, ThumbsUp, MessageSquare, Flag, Ban } from "lucide-react";

export const metadata: Metadata = {
  title: "Tiêu Chuẩn Cộng Đồng - Mọt Truyện",
  description: "Tiêu chuẩn cộng đồng của Mọt Truyện",
};

export default function TieuChuanCongDongPage() {
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Tiêu Chuẩn Cộng Đồng</h1>
          <p className="text-muted-foreground text-lg">
            Cùng nhau xây dựng một cộng đồng đọc truyện văn minh và thân thiện
          </p>
        </div>

        <div className="border-t pt-8" />

        {/* Content */}
        <div className="space-y-8">
          <p className="text-lg leading-relaxed">
            Tại <strong>Mọt Truyện</strong>, chúng tôi tin rằng một cộng đồng 
            văn minh sẽ mang lại trải nghiệm tốt đẹp cho tất cả mọi người. Vì vậy, chúng tôi 
            mong muốn tất cả thành viên cùng tuân thủ những tiêu chuẩn sau đây.
          </p>

          {/* Rule 1 */}
          <div className="bg-muted/50 rounded-xl p-6 border">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 shrink-0">
                <ThumbsUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Tôn trọng lẫn nhau</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Hãy đối xử với người khác bằng sự tôn trọng. Không công kích cá nhân, 
                  không phân biệt chủng tộc, giới tính, tôn giáo hay bất kỳ hình thức 
                  kỳ thị nào. Mọi người đều xứng đáng được tôn trọng.
                </p>
              </div>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="bg-muted/50 rounded-xl p-6 border">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 shrink-0">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">2. Bình luận văn minh</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Hãy bình luận một cách xây dựng và có văn hóa. Tránh spam, flood hay 
                  đăng nội dung vô nghĩa. Không tiết lộ nội dung truyện (spoiler) mà không 
                  có cảnh báo trước.
                </p>
              </div>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="bg-muted/50 rounded-xl p-6 border">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 shrink-0">
                <Ban className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">3. Không vi phạm bản quyền</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Không đăng tải, chia sẻ các nội dung vi phạm bản quyền. Tôn trọng công 
                  sức của các tác giả, họa sĩ và nhóm dịch thuật.
                </p>
              </div>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="bg-muted/50 rounded-xl p-6 border">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10 shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">4. Nội dung cấm</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nghiêm cấm đăng tải các nội dung: khiêu dâm, bạo lực quá mức, quảng cáo 
                  trái phép, link độc hại, hoặc bất kỳ nội dung nào vi phạm pháp luật 
                  Việt Nam.
                </p>
              </div>
            </div>
          </div>

          {/* Rule 5 */}
          <div className="bg-muted/50 rounded-xl p-6 border">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10 shrink-0">
                <Flag className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">5. Báo cáo vi phạm</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nếu bạn thấy bất kỳ nội dung hay hành vi nào vi phạm tiêu chuẩn cộng đồng, 
                  hãy báo cáo ngay cho đội ngũ quản trị viên. Chúng tôi sẽ xử lý kịp thời 
                  và công bằng.
                </p>
              </div>
            </div>
          </div>

          {/* Consequences */}
          <div className="bg-destructive/10 rounded-xl p-6 border border-destructive/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hình thức xử lý vi phạm
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold">•</span>
                <span><strong>Cảnh cáo:</strong> Đối với vi phạm lần đầu hoặc nhẹ.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold">•</span>
                <span><strong>Tạm khóa tài khoản:</strong> Đối với vi phạm nhiều lần hoặc nghiêm trọng.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold">•</span>
                <span><strong>Khóa tài khoản vĩnh viễn:</strong> Đối với vi phạm đặc biệt nghiêm trọng hoặc có chủ đích.</span>
              </li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <p className="text-muted-foreground">
              Cảm ơn bạn đã chung tay xây dựng cộng đồng <strong>Mọt Truyện</strong> ngày càng tốt đẹp hơn! 🙏
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
