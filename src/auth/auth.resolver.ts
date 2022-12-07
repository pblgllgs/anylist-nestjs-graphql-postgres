import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignupInput } from './dto/inputs/signup.input';
import { AuthResponse } from './types/auth-response.type';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { name: 'signup' })
  async signup(
    @Args('signupInput') signinInput: SignupInput,
  ): Promise<AuthResponse> {
    return this.authService.signup(signinInput);
  }

  // @Mutation(() => Auth, { name: 'login' })
  // async login(): Promise<any> {
  //   // return this.authService.login();
  // }

  // @Query(() => Token, { name: 'revalidate' })
  // async revalidateToken() {
  //   // return this.authService.revalidateToken();
  // }
}
