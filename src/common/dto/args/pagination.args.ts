import { Field, ArgsType, Int } from '@nestjs/graphql';
import { IsInt, IsPositive, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 5 })
  @IsPositive()
  @IsInt()
  @Min(1)
  limit = 5;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @Min(0)
  offset = 0;
}
