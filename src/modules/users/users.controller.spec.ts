import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateRole: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call usersService.findAll', async () => {
    const query = {
      page: 1,
      limit: 10,
      search: 'admin',
      role: Role.ADMIN,
    };

    const result = {
      items: [],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
      },
    };

    mockUsersService.findAll.mockResolvedValue(result);

    await expect(controller.findAll(query)).resolves.toEqual(result);
    expect(mockUsersService.findAll).toHaveBeenCalledWith(query);
  });

  it('should call usersService.findOne', async () => {
    const userId = 'user-id';

    const result = {
      id: userId,
      email: 'user@test.com',
      name: 'Normal User',
      role: Role.USER,
    };

    mockUsersService.findOne.mockResolvedValue(result);

    await expect(controller.findOne(userId)).resolves.toEqual(result);
    expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
  });

  it('should call usersService.updateRole', async () => {
    const userId = 'user-id';
    const dto = {
      role: Role.ADMIN,
    };

    const result = {
      id: userId,
      email: 'user@test.com',
      name: 'Normal User',
      role: Role.ADMIN,
    };

    mockUsersService.updateRole.mockResolvedValue(result);

    await expect(controller.updateRole(userId, dto)).resolves.toEqual(result);
    expect(mockUsersService.updateRole).toHaveBeenCalledWith(
      userId,
      Role.ADMIN,
    );
  });

  it('should call usersService.remove', async () => {
    const userId = 'user-id';

    const result = {
      message: 'User deleted successfully',
    };

    mockUsersService.remove.mockResolvedValue(result);

    await expect(controller.remove(userId)).resolves.toEqual(result);
    expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
  });
});
