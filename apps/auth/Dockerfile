# Stage 1: Builder - Dùng để cài đặt và build ứng dụng
FROM node:20-alpine AS builder

# Cài đặt pnpm và các phụ thuộc hệ thống cần thiết
RUN npm install -g pnpm && \
    apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy các file quản lý phụ thuộc
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/auth/tsconfig.app.json ./apps/auth/tsconfig.app.json
COPY prisma ./prisma

RUN pnpm add @nestjs/terminus @nestjs/axios axios -w

# Cài đặt dependencies và build
RUN pnpm install --frozen-lockfile

RUN pnpm exec prisma generate

RUN npx prisma migrate deploy


# Sử dụng image có sẵn curl hoặc cài đặt thủ công
RUN apk add --no-cache curl

# Build ứng dụng
COPY apps/auth/ ./apps/auth/
COPY libs/ ./libs/
RUN pnpm build auth

## Stage 2: Production image - Chỉ chứa những gì cần để chạy
#FROM node:20-alpine
#
#WORKDIR /usr/src/app
#
## Copy các file cần thiết từ builder
#COPY --from=builder /app/node_modules ./node_modules
##COPY --from=builder /app/apps/auth/dist ./dist
##COPY --from=builder /app/apps/auth/package.json ./
#
## Cài đặt production dependencies riêng cho service
#RUN pnpm install --prod --frozen-lockfile

# Environment variables
#ENV NODE_ENV production
ENV PORT 4001
EXPOSE 4001

RUN npm run build

#CMD ["node", "dist/apps/auth/main"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1


CMD ["npm","run","start:dev","auth"]