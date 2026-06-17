import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-id',
    email: 'user@test.com',
    name: 'Normal User',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated users', async () => {
    mockPrismaService.user.findMany.mockResolvedValue([mockUser]);
    mockPrismaService.user.count.mockResolvedValue(1);

    const result = await service.findAll({
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      items: [mockUser],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      },
    });

    expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    expect(mockPrismaService.user.count).toHaveBeenCalled();
  });

  it('should return one user by id', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.findOne('user-id');

    expect(result).toEqual(mockUser);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      select: expect.any(Object),
    });
  });

  it('should throw NotFoundException when user does not exist', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update user role', async () => {
    const updatedUser = {
      ...mockUser,
      role: Role.ADMIN,
    };

    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
    mockPrismaService.user.update.mockResolvedValue(updatedUser);

    const result = await service.updateRole('user-id', Role.ADMIN);

    expect(result).toEqual(updatedUser);
    expect(mockPrismaService.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { role: Role.ADMIN },
      select: expect.any(Object),
    });
  });

  it('should delete user', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
    mockPrismaService.user.delete.mockResolvedValue(mockUser);

    const result = await service.remove('user-id');

    expect(result).toEqual({
      message: 'User deleted successfully',
    });

    expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-id' },
    });
  });
});
