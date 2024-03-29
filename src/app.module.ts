import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './services/guards/authorization.guard';
import { HttpModule, HttpService } from '@nestjs/axios';
import { RmqModule } from './rmq/rmq.module';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './orders/order.module';
import { Kafka } from 'kafkajs';

@Module({
  imports: [
    HttpModule,
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
        name: 'AUTH_SERVICE_KAFKA',
        transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth-consumer',
              brokers: ['kafka-0:9092','kafka-1:9092'],
            },
            consumer: {
              groupId: 'auth-consumer',
            },
          },
      },
      // {
      //   name: 'POST_SERVICE',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: ['amqp://rabbitmq:5672'],
      //     queue: 'post_queue',
      //     noAck:true,
      //     queueOptions: { durable: true },
      //   },
      // },
      {
          name: 'POST_SERVICE',
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'consumer-post',
              brokers: ['kafka-0:9092','kafka-1:9092'],
            },
            consumer: {
              groupId: 'consumer-post',
            },
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
      // {
      //   name: 'ORDER_SERVICE_TCP',
      //   transport: Transport.TCP,
      //   options: {
      //     host:'order-service',
      //     port:6000
      //   },
      // },
      {
        name: 'NODE_SERVICE_TCP',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'other_queue2',
          noAck:true,
          queueOptions: { durable: true },
        },
      },

      {
        name: 'POST_SERVICE2',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'consumer-post2',
            brokers: ['kafka-0:9092','kafka-1:9092'],
          },
          consumer: {
            groupId: 'consumer-post2',
          },
        },
      },
      {
        name: 'POST_SERVICE_TCP2',
        transport: Transport.TCP,
        options: {
          host:'post-service2',
          port:6000
        },
      },


    ]),
    UserModule,
    OrderModule,
    RmqModule,
    ConfigModule
  ],
  controllers: [AppController, UserController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    
  ],
})
export class AppModule implements OnModuleInit{
  async onModuleInit() {
      // const kafka = new Kafka({
      //   clientId: 'my-app',
      //   brokers: ['kafka-0:9092','kafka-1:9092'],
      // });

      // let admin = kafka.admin();
      // const topics = await admin.listTopics();
  
      // const topicList = [];
      // // if (!topics.includes('orders')) {
      //   topicList.push({
      //     topic: 'orders',
      //     numPartitions: 5,
      //     replicationFactor: 2,
      //   });
      // }
  
      // if (!topics.includes('orders.reply')) {
      //   topicList.push({
      //     topic: 'orders.reply',
      //     numPartitions: 10,
      //     replicationFactor: 1,
      //   });
      // }

      // console.log('topicList222222',topicList);
      
  
      // if (topicList.length) {
      //   await admin.createTopics({
      //     topics: topicList,
      //   });
    // }
  }
}
