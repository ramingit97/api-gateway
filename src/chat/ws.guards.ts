import {
    Injectable,
    Inject,
    CanActivate,
    ExecutionContext,
    HttpException,
  } from '@nestjs/common';
  import { firstValueFrom } from 'rxjs';
  import { Reflector } from '@nestjs/core';
  import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { WsException } from '@nestjs/websockets';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
  
  @Injectable()
  export class WsAuthGuard implements CanActivate {
    constructor(
      private readonly reflector: Reflector,
      @Inject('AUTH_SERVICE') private readonly userServiceClient: ClientProxy,
      @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) {}
  
    public async canActivate(context: any): Promise<boolean> {
      let request = context.switchToWs().getData();

      const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
      let user = await this.cacheService.get(bearerToken);
      
        
      return true;
    //   const userInfo = await firstValueFrom(
    //     this.userServiceClient.send('token_decode', {
    //       access_token: this.extractTokenFromHeader(request),
    //       refresh_token
    //     }),
    //   );
  

    //   if (!userInfo) {
    //     throw new WsException(
    //       {
    //         message: userInfo.message,
    //         data: null,
    //         errors: null,
    //       },
    //     );
    //   } 
      
      
    //   request.user = userInfo;
    //   console.log("raminid",userInfo.id);
    //   return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
  