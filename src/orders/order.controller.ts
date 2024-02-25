import { Body, Controller, Get,Inject, Post, Request} from '@nestjs/common';
import { ClientProxy} from '@nestjs/microservices';
import { firstValueFrom, from, of, switchMap,map } from 'rxjs';
import { Authorization } from 'src/decorators/authorization.decorator';
@Controller('orders')
export class OrdersController {

    constructor(
        @Inject("ORDER_SERVICE_TCP") private readonly orderService:ClientProxy,
        @Inject("AUTH_SERVICE") private readonly authService:ClientProxy,

    ){
        
    }

    @Authorization(true)
    @Post("create")
    async getMe(@Body() orderData,@Request() request){
        let data = {
            ...orderData,
            userId:request.user.id
        }
        let result = await firstValueFrom(this.orderService.send("create",data))
        console.log("12312312321",result);
        return result;
    }


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
            switchMap(posts => {
                // console.log(posts);
                const userIds = Array.from(new Set(posts.map(post => post.userId)));
                return from(this.authService.send("all", userIds)).pipe(
                    map(users => {
                         const usersMap = users.flat().reduce((acc, user) => {
                            acc[user.id] = user;
                            return acc;
                        }, {});
                        const postsWithAuthors = posts.map(post => ({
                            ...post,
                            author: usersMap[post.userId]
                        }));
                        return postsWithAuthors;
                    })
                );
            }),
        ); // Преобразуем в Promise для использования await

        return result;
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
