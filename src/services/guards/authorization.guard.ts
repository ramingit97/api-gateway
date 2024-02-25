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
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private readonly reflector: Reflector,
      @Inject('AUTH_SERVICE') private readonly userServiceClient: ClientProxy,
    ) {}
  
    public async canActivate(context: ExecutionContext): Promise<boolean> {
      const secured = this.reflector.get<string[]>(
        'secured',
        context.getHandler(),
      );
  
      if (!secured) {
        return true;
      }

      
  
      const request = context.switchToHttp().getRequest();

      const refresh_token = request.cookies.refresh_token;
      
      const userInfo = await firstValueFrom(
        this.userServiceClient.send('token_decode', {
          access_token: this.extractTokenFromHeader(request),
          refresh_token
        }),
      );
  

      if (!userInfo) {
        throw new HttpException(
          {
            message: userInfo.message,
            data: null,
            errors: null,
          },
          userInfo.status,
        );
      } 
  
      request.user = userInfo;
      return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
  