import { Inject, UseGuards } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Request } from 'express';
import { Server, Socket } from 'socket.io';
import { Authorization } from 'src/decorators/authorization.decorator';
import { WsAuthGuard } from './ws.guards';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection,OnGatewayDisconnect {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  private userSocketMap: Map<string, string> = new Map();

  @WebSocketServer()
  server: Server;

  socket:Socket;

  @SubscribeMessage('chat')
  handleMessage(dto: any, @ConnectedSocket() client:Socket): string {
    // if("user" in client.request){
    //   console.log(client.request.user);
    // }
    
    // console.log("payload",client)
    client.emit("chat","salam")
    // this.server.to(this.socket.id).emit("chat","salam bro necesen")
    return 'Hello world!';
  }


  async emitMessage(payload:any,userId:string){
    let currentSocket = this.getCurrentSocket(userId) as any;
    if(currentSocket) this.server.to(currentSocket).emit("chat",payload)
  }


   // it will be handled when a client connects to the server
   async handleConnection(socket: Socket) {
      this.socket = socket;
      const authorizationHeader = socket.request.headers['authorization'];
      if (authorizationHeader) {
        const accessToken = authorizationHeader.split(' ')[1]; // Получение токена из заголовка Authorization
        let user = await this.cacheService.get(accessToken) as {id:string};
        if(user) this.userSocketMap.set(user.id, socket.id);
        // Здесь вы можете сделать что-то с токеном доступа
      } else {
        console.log('Authorization header is missing');
      }
    }

  // it will be handled when a client disconnects from the server
  handleDisconnect(socket: Socket) {
    console.log(`Socket disconnected: ${socket.id}`);
    this.socket = null;
  }


  getCurrentSocket(userId:string){
        return this.userSocketMap.get(userId);
  }
}
