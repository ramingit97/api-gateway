import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Step } from 'src/common/step.interface';

@Injectable()
  export class CreateOrderStep extends Step<void, void> {
    constructor(
        @Inject("ORDER_SERVICE")
        private orderClient: ClientKafka
    ) {
      super();
      this.name = 'Create Order Step';
    }

    async invoke(order): Promise<void> {
      order.userId = 1;
        
      const createOrder = await lastValueFrom(
        this.orderClient.send("orders.create",order)
      )

      console.log("created order from 222",createOrder);
      
      return createOrder;
    }

    async withCompenstation(order): Promise<any> {
      console.log("with compenstattion",order);
      
        const createOrder = await lastValueFrom(
            this.orderClient.send("orders.cancel",{
                id:order.id
            })
        )
        // return createOrder;
        return Promise.resolve();
    }


    async onModuleInit() {
      this.orderClient.subscribeToResponseOf('orders.create');
      this.orderClient.subscribeToResponseOf('orders.cancel');
      await this.orderClient.connect();
    } 
  }
