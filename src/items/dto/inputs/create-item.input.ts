import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateItemInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  name: string;

  @Field(() => Float)
  @IsPositive()
  @IsNumber()
  quantity: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(1)
  quantityUnits?: string;
}
