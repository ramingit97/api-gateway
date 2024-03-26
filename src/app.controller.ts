import { Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { log } from 'console';
import {readFileSync} from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject("POST_SERVICE_TCP") private readonly postService:ClientProxy,
    @Inject("AUTH_SERVICE") private readonly authService:ClientProxy,
    @Inject("POST_SERVICE") private readonly postRmqService:ClientProxy,
    // @Inject("ORDER_SERVICE_TCP") private readonly orderService:ClientProxy,
    @Inject("ORDER_SERVICE") private readonly orderRmqService:ClientProxy,
    @Inject("NODE_SERVICE_TCP") private readonly nodeService:ClientProxy,
    private readonly httpService: HttpService,
    @Inject("POST_SERVICE_TCP2") private readonly postService2:ClientProxy,
    ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('create')
  async createPost(){
     let res = await firstValueFrom(this.postService2.send("create_post",{
      name:"Ramin",
      description:"description"
     }))

    //  console.log(res.gotFerid);
     
     return res;
  }

  @Post("register")
  async register(){
    let res = await firstValueFrom(this.authService.send("register2",{
      username:"ramin"
    }))
    return res;
  }


  @Get("notifications")
  async getNotifications(){
    // let res = await lastValueFrom(
      // this.postRmqService.emit("notifications",{ramin:"ramin"})
    // )
    console.log("sttttttttttttttttttttttttttt");
    
    let orderRes = await lastValueFrom(
      this.orderRmqService.emit("orders",{
        key:'create',
        topic:'orders',
        headers:{eventType:"orders.create"},
        value:{
          order:1,name:"123123",description:"new description"
        }})
    )

    console.log("end");

  }

  @Get("notifications2")
  async getNotifications2(){
    console.log('111111111111111111111111');
    
    // let res = await lastValueFrom(
      // this.postRmqService.emit("notifications",{ramin:"ramin"})
    // )
    let orderRes = await lastValueFrom(
      this.orderRmqService.emit("orders",{key:'update',
      topic:'orders',
      headers:{eventType:"orders.update"},
      value:{
        order:1,name:"123123",description:"new description"
      }})
    )

    // let orderRes2 = await lastValueFrom(
    //   this.postRmqService.emit("orders",{key:'update-all',
    //   topic:'orders',
    //   value:{
    //     order:1,name:"123123",description:"new description"
    //   }})
    // )
  }

  @Get("notifications3")
  async getNotifications3(){
    let orderRes = await lastValueFrom(
      this.orderRmqService.emit("deleteAll",{key:'deleteall',
      topic:'orders',
      value:{
        order:1,name:"123123",description:"new description"
      }})
    )

    
  }


  @Get("all_nodes")
  async getOrders(){
    // const func1 = async ()=>{
    //   const { data } = await firstValueFrom(
    //     this.httpService.get<any[]>('http://nodejs:8000/users/').pipe(
    //       catchError((error: AxiosError) => {
    //         throw 'An error happened!';
    //       }),
    //     ),
    //   );
    //   return data;
    // }

    
    let orderRes = await firstValueFrom(
    this.nodeService.emit("other_queue2",{ramin:"raasdasdasd"}))
      
    // // console.log('data22',data);
    // return await func1();
    // return data;
  }


  @Get("post_service2")
  async postService3(){
    let res = await lastValueFrom(
      this.postService2.send("all2",{ramin:"ramin"})
    )

    console.log('121212',res);
    return res;
    // let orderRes = await lastValueFrom(
    //   this.orderRmqService.emit("create_order",{order:1,name:"123123",description:"new description"})
    // )
  }

  // @MessagePattern('send_notifications2')
  //   getNotifications2(@Payload() data: number[], @Ctx() context: RmqContext) {
  //   console.log(context.getMessage());
  // }



    // @MessagePattern('send_notifications2')
    // getNotifications2(@Payload() data: number[], @Ctx() context: RmqContext) {
    //   console.log("ramin",data);
    //   console.log('123123123');
    // }

    @Get("home")
    async getHome(){
      try {
        const containerIdFilePath = '/proc/1/cgroup';
        const content = readFileSync(containerIdFilePath, 'utf-8');
        const matches = content.match(/\/docker\/([a-f0-9]+)/);
        let containerId = "";
        if (matches && matches.length > 1) {
          containerId = matches[1];
          console.log('Container ID:', containerId);
        } else {
          console.log('Unable to determine Container ID.');
        }
        return containerId
      } catch (err) {
        console.error('Error reading container ID:', err);
      }
    }
}

