import { Field, ArgsType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@ArgsType()
export class SearchArgs {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;
}
