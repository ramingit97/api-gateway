import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
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
              name: 'POST_SERVICE_TCP',
              transport: Transport.TCP,
              options: {
                host:'post-service',
                port:5000
              },
            },
        ])
    ],
    controllers:[UserController],
    providers:[
      {
        provide: APP_GUARD,
        useClass: AuthGuard,
      }
    ]
})
export class UserModule {}
