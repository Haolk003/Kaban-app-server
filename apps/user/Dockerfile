# Stage 1: Builder - Dùng để cài đặt và build ứng dụng
FROM node:20-alpine AS builder

# Cài đặt pnpm và các phụ thuộc hệ thống cần thiết
RUN npm install -g pnpm && \
    apk add --no-cache python3 make g++

WORKDIR /app

# Copy các file quản lý phụ thuộc
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/user/tsconfig.app.json ./apps/user/tsconfig.app.json


# Cài đặt dependencies và build
RUN pnpm install --frozen-lockfile && \
    pnpm build user

# Stage 2: Production image - Chỉ chứa những gì cần để chạy
FROM node:20-alpine

WORKDIR /app

# Copy các file cần thiết từ builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/auth/dist ./dist
COPY --from=builder /app/apps/auth/package.json ./

# Cài đặt production dependencies riêng cho service
RUN pnpm install --prod --frozen-lockfile

# Environment variables
ENV NODE_ENV production
ENV PORT 4002
EXPOSE 4002

CMD ["node", "dist/apps/user/main"]