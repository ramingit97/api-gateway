import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './services/guards/authorization.guard';
import { HttpModule, HttpService } from '@nestjs/axios';
import { RmqModule } from './rmq/rmq.module';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './orders/order.module';

@Module({
  imports: [
    HttpModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host:'user-service',
          port:4000
        },
      },
      {
        name: 'POST_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'post_queue',
          noAck:true,
          queueOptions: { durable: true },
        },
      },
      {
        name: 'POST_SERVICE_TCP',
        transport: Transport.TCP,
        options: {
          host:'post-service',
          port:5000
        },
      },
      {
        name: 'ORDER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'order_queue',
          noAck:true,
          queueOptions: { durable: true },
        },
      },
      {
        name: 'ORDER_SERVICE_TCP',
        transport: Transport.TCP,
        options: {
          host:'order-service',
          port:6000
        },
      },
      {
        name: 'NODE_SERVICE_TCP',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'other_queue2',
          noAck:true,
          queueOptions: { durable: true },
        },
      },
    ]),
    UserModule,
    OrderModule,
    RmqModule,
    ConfigModule
  ],
  controllers: [AppController, UserController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    
  ],
})
export class AppModule {}
