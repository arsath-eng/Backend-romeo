import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { writeFileSync } from 'fs';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('app/v1');
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors({
    allowedHeaders:
      '*',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });
  //   const config = new DocumentBuilder()
  //   .setTitle('RomeoHR API')
  //   .setDescription('RomeoHR API')
  //   .setVersion('1.0')
  //   .addTag('hrmAPI')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // writeFileSync("./swagger-spec.json", JSON.stringify(document));
  // SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
