import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class SignupInput {
  @Field(() => String)
  @IsEmail()
  @IsString()
  email: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @Field(() => String)
  @IsString()
  @MinLength(4)
  password: string;
}
