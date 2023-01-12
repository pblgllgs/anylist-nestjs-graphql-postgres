import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateListItemInput {
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  completed = false;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity = 0;

  @Field(() => ID)
  @IsUUID()
  listId: string;

  @Field(() => ID)
  @IsUUID()
  itemId: string;
}
