import { Module } from '@nestjs/common';
import { OrdersController } from './order.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/services/guards/authorization.guard';

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
        ])
    ],
    controllers:[OrdersController],
    providers:[
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      }
    ]
})
export class OrderModule {}
