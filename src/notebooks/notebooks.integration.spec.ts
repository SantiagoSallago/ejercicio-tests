import { Test, TestingModule } from '@nestjs/testing';
import { NotebooksController } from './notebooks.controller';
import { NotebooksService } from './notebooks.service';
import { CreateNotebookDto } from './dto/create-notebook.dto';


describe('NotebooksController (integración)', () => {
    let controller: NotebooksController;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotebooksController],
            providers: [
                {
                    provide: NotebooksService,
                    useValue: {
                        create: jest.fn((dto) => {
                            if (!dto.title || !dto.content) throw new Error('Invalid data');
                            return { id: 3, ...dto };
                        }),
                        findAll: jest.fn(() => [
                            { id: 1, title: 'Notebook 1', content: 'contenido 1' },
                            { id: 2, title: 'Notebook 2', content: 'contenido 2' },
                        ]),
                    },
                },
            ],
        }).compile();

        controller = module.get<NotebooksController>(NotebooksController);
    });


    it('debería devolver todas las notebooks', async () => {
        const result = await controller.findAll();
        expect(result).toHaveLength(2);
        expect(result[0].title).toBe('Notebook 1');
    });

    it('debería crear una notebook correctamente', async () => {
        const dto: CreateNotebookDto = { title: 'Notebook nueva', content: 'contenido nuevo' };

        const result = await controller.create(dto);
        expect(result).toEqual({ id: 3, ...dto });
    });


    it('debería lanzar HttpException si el servicio falla al crear', async () => {
        const dto: CreateNotebookDto = {
            title: '',
            content: '',
        };

        await expect(controller.create(dto)).rejects.toThrow('Error creating notebook');
    });
});