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
        this.orderClient.emit("orders.create",order)
      )
      return createOrder;
    }

    async withCompenstation(order): Promise<any> {
        // const createOrder = await lastValueFrom(
        //     this.orderClient.send("orders.cancel",{
        //         order
        //     })
        // )
        // return createOrder;
        return Promise.resolve();
      }
  }
