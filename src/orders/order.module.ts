import { Module } from '@nestjs/common';
import { OrdersController } from './order.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/services/guards/authorization.guard';
import { CreateOrderSaga } from 'src/usecases/create-order/create-order.saga';
import { CreateOrderStep } from 'src/usecases/create-order/steps/create-order.step';
import { CreateProductStep } from 'src/usecases/create-order/steps/create-product.step';
import { ChatGateway } from 'src/chat/chat.gateway';

@Module({
    imports:[
  
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
              name: 'ORDER_SERVICE_TCP',
              transport: Transport.TCP,
              options: {
                host:'order-service',
                port:6000
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
              transport: Transport.KAFKA,
              options: {
                client: {
                  clientId: 'auth',
                  brokers: ['kafka-0:9092','kafka-1:9092'],
                },
                consumer: {
                  groupId: 'auth-consumer',
                },
              },
            },
        ])
    ],
    controllers:[OrdersController],
    providers:[
      ChatGateway,
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      },
      {
        provide: 'create-order-step',
        useClass: CreateOrderStep,
      },
      {
        provide: 'create-product-step',
        useClass: CreateProductStep,
      },
      
      {
        provide: 'create-order-saga',
        useClass: CreateOrderSaga,
      },
  
    ]
})
export class OrderModule {}
