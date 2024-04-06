import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './exception-filter/all.filter';
import * as cookieParser from "cookie-parser";
import { AllRpcExceptionsFilter } from './exception-filter/rpc.filter';
import { RmqService } from './rmq/rmq.service';
import { MicroserviceOptions } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllRpcExceptionsFilter())
  app.useGlobalFilters(new AllExceptionFilter())
  app.setGlobalPrefix("api");
  app.enableCors({
    credentials:true,
    origin:[
      'http://localhost:3001',
    ]
  })
  // app.useGlobalFilters(new RpxExceptionFilter())

  app.use(cookieParser())
  console.log("Start api gateway")



   
  const rmqService = app.get<RmqService>(RmqService);
  const appRmq = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    rmqService.getOptions('response_queue')
  );
  
  await app.listen(3000,()=>{
    console.log("API GATEWAY RUN ON PORT 3000");
    
  });
  await appRmq.listen();
}
bootstrap();
