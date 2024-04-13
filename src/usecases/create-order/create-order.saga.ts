import { Inject, Injectable } from "@nestjs/common";
import { Step } from "src/common/step.interface";
import { CreateOrderStep } from "./steps/create-order.step";
import { CreateProductStep } from "./steps/create-product.step";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class CreateOrderSaga {

    private steps: Step<void,void>[] = [];
    private successfulSteps: Step<void,void>[] = [];


    constructor(
        @Inject("create-order-step") step1: CreateOrderStep,
        @Inject("create-product-step") step2: CreateProductStep,
        private eventEmitter: EventEmitter2
    ){
        this.steps = [step1,step2]
    }


    async execute(order){
        for(let step of this.steps){
            // console.log('step',step.name);
            try{
                console.error(`Start Step: ${step.name} !!`);
                await step.invoke(order);
                this.successfulSteps.unshift(step);
            }catch(error){
                // console.error(`Failed Step: ${step.name} !!`);
                this.successfulSteps.forEach(async (s)=>{
                    console.log(`Rollbacking: ${s.name} ...`);
                    await s.withCompenstation(order);
                })
                this.successfulSteps = [];
            }
        }
        console.info('Order Creation Transaction ended successfuly');
        this.eventEmitter.emit("orders.create.event", order);

    }

}