# Sử dụng image Node.js 18 chính thức
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy mã nguồn
COPY . .

# Mở cổng ứng dụng (thay 3000 bằng cổng của bạn)
EXPOSE 3000

# Lệnh khởi động ứng dụng
CMD ["npm","run" ,"dev"]