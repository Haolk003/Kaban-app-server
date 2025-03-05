import { BadRequestException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

const MAX_RETRIES = 5;

export const generateProjectKey = async (
  tx: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  boardTitle: string,
  ownerId: string,
) => {
  const baseKey = sanitizeTitle(boardTitle);
  let candidateKey = baseKey;
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    const existingBoard = await tx.board.findUnique({
      where: {
        projectKey_ownerId: { projectKey: candidateKey, ownerId: ownerId },
      },
      select: { id: true },
    });

    if (!existingBoard) {
      return candidateKey;
    }

    retryCount++;
    candidateKey = `${baseKey}${retryCount}`;
  }

  throw new BadRequestException(
    'Failed to generate unique project key after maximum retries',
  );
};

// Hàm chuyển đổi title thành project key
const sanitizeTitle = (title: string): string => {
  // 1. Chuẩn hóa tiêu đề
  const sanitized = title
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, ' '); // Xóa khoảng trắng thừa

  // 2. Trích xuất các chữ cái đầu từ các từ
  const initials = sanitized
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .join('');

  // 3. Xử lý trường hợp đặc biệt
  if (initials.length === 0) {
    throw new BadRequestException(
      'Invalid board title for project key generation',
    );
  }

  // 4. Giới hạn độ dài từ 3-5 ký tự
  return initials.length > 5 ? initials.slice(0, 5) : initials.padEnd(3, 'X'); // Thêm 'X' nếu quá ngắn
};
