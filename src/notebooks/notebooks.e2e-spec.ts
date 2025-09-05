import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { NotebooksModule } from './notebooks.module';
import { NotebooksService } from './notebooks.service';
import { CreateNotebookDto } from './dto/create-notebook.dto';

describe('NotebooksController (e2e)', () => {
  let app: INestApplication;
  let notebooksService = {
    findAll: jest.fn(() => [
      { id: 1, title: 'Notebook 1', content: 'contenido 1' },
      { id: 2, title: 'Notebook 2', content: 'contenido 2' },
    ]),
    create: jest.fn((dto: CreateNotebookDto) => {
      if (!dto.title || !dto.content) throw new Error('Invalid data');
      return { id: 3, ...dto };
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotebooksModule],
    })
      .overrideProvider(NotebooksService)
      .useValue(notebooksService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/GET notebooks', () => {
    return request(app.getHttpServer())
      .get('/notebooks')
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
        expect(res.body[0].title).toBe('Notebook 1');
      });
  });

  it('/POST notebooks - success', () => {
    const dto: CreateNotebookDto = { title: 'Nueva Notebook', content: 'Contenido nuevo' };
    return request(app.getHttpServer())
      .post('/notebooks')
      .send(dto)
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body).toEqual({ id: 3, ...dto });
      });
  });

  it('/POST notebooks - fail', () => {
    const dto: CreateNotebookDto = { title: '', content: '' };
    return request(app.getHttpServer())
      .post('/notebooks')
      .send(dto)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.message).toBe('Error creating notebook');
      });
  });
});
