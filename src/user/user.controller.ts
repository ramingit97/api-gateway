import { Body, Controller, Get, HttpStatus, Inject, Post, Request, Res, UnauthorizedException, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CookieOptions, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { Authorization } from 'src/decorators/authorization.decorator';
import { Cookie } from 'src/decorators/cookies.decorator';

@Controller('user')
export class UserController {

    constructor(
        @Inject("AUTH_SERVICE") private readonly authService:ClientProxy,
        // @Inject("POST_SERVICE_TCP") private readonly postService:ClientProxy,

    ){
        
    }

    @Post("register")
    async register(@Body() userData,@Res() res:Response){
        console.log("121212");
        let result = await firstValueFrom(this.authService.send("register",userData))
          console.log('result',result);
          return result;
        // let result = await this.userService.register(userData);
        // 
        
        // res.status(HttpStatus.CREATED).json({
        //     userId:result.user.id,
        //     access_token:result.access_token
        // });
    }

    @Post("login")
    async login(@Body() userData,@Res() res:Response){

        console.log('fff2323');
        
        let result = await firstValueFrom(this.authService.send("login",userData))
        
        await this.setRefreshCookie(result.refresh_token,res);
        res.status(HttpStatus.CREATED).json({
            // userId:result.user.id,
            access_token:result.access_token,
        });
    }


    @Post("refresh_token")
    async refresh(@Body() data,@Cookie("refresh_token") refresh_token:string,@Res() res:Response ){
        console.log(refresh_token);
        
        let result = await firstValueFrom(this.authService.send("refresh_token",{
            refresh_token
        }))
        await this.setRefreshCookie(result.refresh_token,res);
        res.status(HttpStatus.CREATED).json({
            // userId:result.user.id,
            access_token:result.access_token,
        });
    }

    @Authorization(true)
    @Get("me")
    async getMe(@Body() userData,@Request() request){
        // let result = await firstValueFrom(this.authService.send("login",userData))
        return {result:true,user:request.user};
    }



    // @Authorization(true)
    @Get("all")
    async findAll(@Body() userData){
        let result = await firstValueFrom(this.authService.send("all",userData))
          console.log('555',result);
          return result
    }

    async setRefreshCookie(token:string,res:Response){
        if(!token){
            throw new UnauthorizedException({message:"Token not found"});
        }
        let cookieOptions:CookieOptions = {
            maxAge:30 * 24 *60 *60 ,// 30 days
            // domain:'/',
            sameSite:'strict',
            secure:false
        }
        res.cookie("refresh_token",token,cookieOptions)
    }

    @Get("posts")
    async getAllPosts(){
        // let result = await firstValueFrom(this.postService.send("all","rrr"))
        // console.log('323232323232',result);
        // return result
    }

   

    @Post('create_post')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadFile(@UploadedFiles() files: Express.Multer.File,@Body() body) {
        console.log(files);
        console.log(body);

        let result = await firstValueFrom(this.authService.send("create_photo",{files,body}))
        console.log('result',result);
        return result;
    
    }

   
}
