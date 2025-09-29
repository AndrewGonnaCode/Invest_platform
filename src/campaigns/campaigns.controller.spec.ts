import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { TrendingService } from './trending.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

describe('CampaignsController', () => {
  let controller: CampaignsController;
  let campaignsService: CampaignsService;
  let trendingService: TrendingService;

  const mockCampaignsService = {
    create: jest.fn(),
    list: jest.fn(),
    findById: jest.fn(),
  };

  const mockTrendingService = {
    getTrending: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        {
          provide: CampaignsService,
          useValue: mockCampaignsService,
        },
        {
          provide: TrendingService,
          useValue: mockTrendingService,
        },
      ],
    }).compile();

    controller = module.get<CampaignsController>(CampaignsController);
    campaignsService = module.get<CampaignsService>(CampaignsService);
    trendingService = module.get<TrendingService>(TrendingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a campaign successfully', async () => {
      const createCampaignDto: CreateCampaignDto = {
        title: 'Test Campaign',
        description: 'This is a test campaign for funding a new project',
        goalAmount: '10.5',
        deadline: '2024-12-31T23:59:59.000Z',
        creatorAddress: '0x742d35Cc6635C0532925a3b8D8a9a8e8e8e8e8e8',
      };

      const expectedResult = {
        id: 1,
        title: 'Test Campaign',
        description: 'This is a test campaign for funding a new project',
        goalAmount: '10.5',
        deadline: new Date('2024-12-31T23:59:59.000Z'),
        creatorAddress: '0x742d35cc6635c0532925a3b8d8a9a8e8e8e8e8e8',
        contractAddress: '0x0000000000000000000000000000000000000000',
        createdAt: new Date(),
        contributions: [],
      };

      mockCampaignsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createCampaignDto);

      expect(campaignsService.create).toHaveBeenCalledWith(createCampaignDto);
      expect(campaignsService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle campaign creation with minimum valid data', async () => {
      const createCampaignDto: CreateCampaignDto = {
        title: 'Minimal Campaign',
        description: 'Short description',
        goalAmount: '1.0',
        deadline: '2024-06-30T12:00:00.000Z',
        creatorAddress: '0x1234567890123456789012345678901234567890',
      };

      const expectedResult = {
        id: 2,
        ...createCampaignDto,
        creatorAddress: createCampaignDto.creatorAddress.toLowerCase(),
        deadline: new Date(createCampaignDto.deadline),
        contractAddress: '0x0000000000000000000000000000000000000000',
        createdAt: new Date(),
        contributions: [],
      };

      mockCampaignsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createCampaignDto);

      expect(campaignsService.create).toHaveBeenCalledWith(createCampaignDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle campaign creation with large goal amount', async () => {
      const createCampaignDto: CreateCampaignDto = {
        title: 'Big Campaign',
        description: 'Campaign with a large funding goal for a major project',
        goalAmount: '1000.0',
        deadline: '2025-01-15T18:30:00.000Z',
        creatorAddress: '0xAbCdEf1234567890123456789012345678901234',
      };

      const expectedResult = {
        id: 3,
        ...createCampaignDto,
        creatorAddress: createCampaignDto.creatorAddress.toLowerCase(),
        deadline: new Date(createCampaignDto.deadline),
        contractAddress: '0x0000000000000000000000000000000000000000',
        createdAt: new Date(),
        contributions: [],
      };

      mockCampaignsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createCampaignDto);

      expect(campaignsService.create).toHaveBeenCalledWith(createCampaignDto);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate service errors', async () => {
      const createCampaignDto: CreateCampaignDto = {
        title: 'Error Campaign',
        description: 'This campaign will cause an error',
        goalAmount: '5.0',
        deadline: '2024-08-15T10:00:00.000Z',
        creatorAddress: '0x9876543210987654321098765432109876543210',
      };

      const errorMessage = 'Database connection failed';
      mockCampaignsService.create.mockRejectedValue(new Error(errorMessage));

      await expect(controller.create(createCampaignDto)).rejects.toThrow(errorMessage);
      expect(campaignsService.create).toHaveBeenCalledWith(createCampaignDto);
    });
  });

  describe('list', () => {
    it('should return list of campaigns', async () => {
      const expectedCampaigns = [
        {
          id: 1,
          title: 'Campaign 1',
          description: 'First campaign',
          goalAmount: '10.0',
          deadline: new Date('2024-12-31'),
          creatorAddress: '0x1111111111111111111111111111111111111111',
          contractAddress: '0x0000000000000000000000000000000000000000',
          createdAt: new Date(),
        },
        {
          id: 2,
          title: 'Campaign 2',
          description: 'Second campaign',
          goalAmount: '20.0',
          deadline: new Date('2024-11-30'),
          creatorAddress: '0x2222222222222222222222222222222222222222',
          contractAddress: '0x0000000000000000000000000000000000000000',
          createdAt: new Date(),
        },
      ];

      mockCampaignsService.list.mockResolvedValue(expectedCampaigns);

      const result = await controller.list();

      expect(campaignsService.list).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCampaigns);
    });
  });

  describe('get', () => {
    it('should return a specific campaign by id', async () => {
      const campaignId = '1';
      const expectedCampaign = {
        id: 1,
        title: 'Test Campaign',
        description: 'Test description',
        goalAmount: '15.0',
        deadline: new Date('2024-12-31'),
        creatorAddress: '0x1111111111111111111111111111111111111111',
        contractAddress: '0x0000000000000000000000000000000000000000',
        createdAt: new Date(),
      };

      mockCampaignsService.findById.mockResolvedValue(expectedCampaign);

      const result = await controller.get(campaignId);

      expect(campaignsService.findById).toHaveBeenCalledWith(1);
      expect(campaignsService.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCampaign);
    });
  });

  describe('trending', () => {
    it('should return trending campaigns', async () => {
      const expectedTrending = [
        { campaignId: 1, score: 95.5 },
        { campaignId: 2, score: 87.2 },
        { campaignId: 3, score: 76.8 },
      ];

      mockTrendingService.getTrending.mockResolvedValue(expectedTrending);

      const result = await controller.trending();

      expect(trendingService.getTrending).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedTrending);
    });
  });
});
