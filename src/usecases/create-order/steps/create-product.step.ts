import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Step } from 'src/common/step.interface';

@Injectable()
  export class CreateProductStep extends Step<void, void> {
    constructor(
        @Inject("POST_SERVICE_TCP") private readonly postService:ClientKafka,
    ) {
      super();
      this.name = 'Create Product Step';
    }

    async invoke(order): Promise<void> {
      const createProduct = await lastValueFrom(
        this.postService.send("product.create",{
            name:"Product1",
            price:200,
            quantity:10
        })
      )
      
      return createProduct;
    }

    async withCompenstation(order): Promise<any> {
        const createOrder = await lastValueFrom(
            this.postService.send("product.delete",{
                order
            })
        )
        return createOrder;
      }
  }
