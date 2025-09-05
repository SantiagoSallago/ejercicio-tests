import { Test, TestingModule } from '@nestjs/testing';
import { NotebooksController } from './notebooks.controller';
import { NotebooksService } from './notebooks.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('NotebooksController', () => {
  let controller: NotebooksController;
  let service: NotebooksService;

  const mockNotebooks = [
    { id: 1, title: 'Notebook 1', content: 'ta fea' },
    { id: 2, title: 'Notebook 2', content: 'ta horrible' },
    { id: 3, title: 'Notebook 3', content: 'ta buena' },
    
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotebooksController],
      providers: [
        {
          provide: NotebooksService,
          useValue: {
            findAll: jest.fn(() => mockNotebooks),
            create: jest.fn((dto) => ({ id: 4, ...dto })),
          },
        },
      ],
    }).compile();

    controller = module.get<NotebooksController>(NotebooksController);
    service = module.get<NotebooksService>(NotebooksService);
  });

  it('Debería devolver todas las notebooks', async () => {
    const results = await controller.findAll();
    expect(results).toEqual(mockNotebooks);
  });

  it('Maneja el error si no logra devolver todas las notebooks', async () => {
    (service.findAll as jest.Mock).mockImplementationOnce(() => {
      throw new Error('DB error');
    });

    await expect(controller.findAll()).rejects.toThrow(
      new HttpException('Error retrieving notebooks', HttpStatus.INTERNAL_SERVER_ERROR)
    );
  });

  it('Debería crear una nueva notebook', async () => {
    const dto = { title: 'Notebook 4', content: 'ta horrible' };
    const expected = { id: 4, ...dto };

    const result = await controller.create(dto);
    expect(result).toEqual(expected);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('Maneja el error si no logra crear una nueva notebook', async () => {
    (service.create as jest.Mock).mockImplementationOnce(() => {
      throw new Error('DB error');
    });

    await expect(controller.create({ title: '', content: '' })).rejects.toThrow(
      new HttpException('Error creating notebook', HttpStatus.BAD_REQUEST)
    );
  });
});