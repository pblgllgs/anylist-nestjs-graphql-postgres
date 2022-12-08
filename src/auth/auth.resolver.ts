import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignupInput, LoginInput } from './dto/inputs';
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

  @Mutation(() => AuthResponse, { name: 'login' })
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  // @Query(() => String, { name: 'revalidate' })
  // async revalidateToken(@Args('token') token: string) {
  //   return this.authService.revalidateToken(token);
  // }
}
