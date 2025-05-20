# Stage 1: Builder - Dùng để cài đặt và build ứng dụng
FROM node:20-alpine AS builder

# Cài đặt pnpm và các phụ thuộc hệ thống cần thiết
RUN npm install -g pnpm && \
    apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copy các file quản lý phụ thuộc
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/task/tsconfig.app.json ./apps/board/tsconfig.app.json
COPY prisma ./prisma


# Cài đặt dependencies và build
RUN pnpm install --frozen-lockfile

RUN pnpm exec prisma generate

RUN apk add --no-cache curl

# Build ứng dụng
COPY apps/task/ ./apps/task/
COPY libs/ ./libs/
RUN pnpm build task

## Stage 2: Production image - Chỉ chứa những gì cần để chạy
#FROM node:20-alpine
#
#WORKDIR /usr/src/app
#
## Copy các file cần thiết từ builder
#COPY --from=builder /app/node_modules ./node_modules
##COPY --from=builder /app/apps/board/dist ./dist
#
#
## Cài đặt production dependencies riêng cho service
#RUN pnpm install --prod --frozen-lockfile

# Environment variables
#ENV NODE_ENV production
ENV PORT 4004
EXPOSE 4004

RUN npm run build

#CMD ["node", "dist/apps/auth/main"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4004/health || exit 1


CMD ["npm","run","start:dev","task"]