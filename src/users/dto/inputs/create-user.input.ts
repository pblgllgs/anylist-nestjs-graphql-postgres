import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => ID, { description: 'Example field (placeholder)' })
  id: string;
}
