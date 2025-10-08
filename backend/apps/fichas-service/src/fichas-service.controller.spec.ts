import { Test, TestingModule } from '@nestjs/testing';
import { FichasServiceController } from './fichas-service.controller';
import { FichasServiceService } from './fichas-service.service';

describe('FichasServiceController', () => {
  let fichasServiceController: FichasServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FichasServiceController],
      providers: [FichasServiceService],
    }).compile();

    fichasServiceController = app.get<FichasServiceController>(FichasServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fichasServiceController.getHello()).toBe('Hello World!');
    });
  });
});
