import { Body, Controller, Get,Inject, Post, Request} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientProxy} from '@nestjs/microservices';
import { firstValueFrom, from, of, switchMap,map } from 'rxjs';
import { ChatGateway } from 'src/chat/chat.gateway';
import { Authorization } from 'src/decorators/authorization.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreateOrderSaga } from 'src/usecases/create-order/create-order.saga';
import { v4 as uuidv4 } from 'uuid';


@Controller('orders')
export class OrdersController {

    constructor(
        @Inject("ORDER_SERVICE_TCP") private readonly orderService:ClientProxy,
        @Inject("AUTH_SERVICE") private readonly authService:ClientProxy,
        @Inject('create-order-saga') private saga: CreateOrderSaga,
        private readonly socketGateway:ChatGateway


    ){
        
    }

    @Authorization(true)
    @Post("create")
    async create(@Body() orderData,@Request() request,@CurrentUser() userInfo:any){
        orderData.id = uuidv4();
        orderData.userId = userInfo.id;
        console.log(orderData,"orderdata from gateway")
        this.saga.execute(orderData);
        return orderData
        // let result = await firstValueFrom(this.orderService.send("orders.create",orderData))
        // console.log("result from gateway",result);
        // return result;        
    }

    @Authorization(true)
    @Get("list")
    async get(@Body() userData){
        // const result = await firstValueFrom(
        //     this.orderService.send("list", { limit: 10 }).pipe(
        //         switchMap(posts => {
        //             const userIds = Array.from(new Set(posts.map(post => post.userId)));
        //             // Возвращаем userIds в виде Observable
        //             return of(userIds);
        //         })
        //     )
        // );


        let result = await this.orderService.send("list", { limit: 10 }).pipe(
        //     switchMap(posts => {
        //         // console.log(posts);
        //         const userIds = Array.from(new Set(posts.map(post => post.userId)));
        //         return from(this.authService.send("all", userIds)).pipe(
        //             map(users => {
        //                  const usersMap = users.flat().reduce((acc, user) => {
        //                     acc[user.id] = user;
        //                     return acc;
        //                 }, {});
        //                 const postsWithAuthors = posts.map(post => ({
        //                     ...post,
        //                     author: usersMap[post.userId]
        //                 }));
        //                 return postsWithAuthors;
        //             })
                );
        // ); // Преобразуем в Promise для использования await
        console.log("orders list  22",result);
        
        return result;
    }


    @OnEvent("orders.create.event")
    async createPost5(data,@CurrentUser() userInfo:any){
        let orderResult = await firstValueFrom(this.orderService.send("orders.completed",{   
            id:data.id
        }))
        console.log("orderresult",orderResult);
        this.socketGateway.emitMessage({
            status:"completed",
            ...orderResult
        },data.userId)
    }

   

    // @Get("deleteAll")
    // async deleteAll(@Body() userData){
    //     let result = await firstValueFrom(this.orderService.send("deleteAll",{   
    //         limit:10
    //     }))
    //     console.log("12312312321",result);
    //     return result;
    // }

}
