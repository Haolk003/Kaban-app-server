# Stage 1: Builder - Dùng để cài đặt và build ứng dụng
FROM node:20-alpine AS builder

# Cài đặt pnpm và các phụ thuộc hệ thống cần thiết
RUN npm install -g pnpm && \
    apk add --no-cache python3 make g++

WORKDIR /usr/src/app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Copy các file quản lý phụ thuộc
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/api/tsconfig.app.json ./apps/api/tsconfig.app.json
COPY prisma ./prisma


# Cài đặt dependencies và build
RUN pnpm install --frozen-lockfile

RUN pnpm exec prisma generate

# Build ứng dụng
COPY apps/api/ ./apps/api/
COPY libs/ ./libs/
RUN pnpm build api

# Stage 2: Production image - Chỉ chứa những gì cần để chạy
# Stage 1: Builder (giữ nguyên)

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy chỉ những gì cần từ builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/api/dist ./dist
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/prisma ./prisma

# Chỉ cài đặt production dependencies
RUN npm install --omit=dev

# Environment variables
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Chạy prisma generate và migrate deploy ở PRODUCTION stage
RUN npx prisma generate
RUN npx prisma migrate deploy

# Sửa lệnh CMD để chạy ứng dụng đã build
CMD ["node", "dist/apps/api/main"]