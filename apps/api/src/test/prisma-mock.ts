// ===========================================
// Prisma Mock Helper
// ===========================================

import { vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';

// Type-safe mock
export const prismaMock = {
  folder: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
  },
  note: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
  permission: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    createMany: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
} as unknown as PrismaClient;

// Helper to reset all mocks
export function resetPrismaMock() {
  vi.clearAllMocks();
}

// Helper to create folder mock data
export function createFolderMock(overrides: Partial<{
  id: string;
  name: string;
  slug: string;
  path: string;
  parentId: string | null;
  color: string | null;
  icon: string | null;
  position: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: 'folder-1',
    name: 'Test Folder',
    slug: 'test-folder',
    path: '/',
    parentId: null,
    color: null,
    icon: null,
    position: 0,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// Helper to create note mock data
export function createNoteMock(overrides: Partial<{
  id: string;
  title: string;
  slug: string;
  folderId: string;
  position: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  return {
    id: 'note-1',
    title: 'Test Note',
    slug: 'test-note',
    folderId: 'folder-1',
    position: 0,
    isDeleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}
