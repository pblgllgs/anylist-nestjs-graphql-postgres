import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { join } from 'path';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    // * en caso de que tanto autenticación, querys y mutation se encuentren juntos
    // * y asi evitar que se tenga acceso a todo sin un token valido

    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [JwtService],
      useFactory: async (jwtService: JwtService) => {
        return {
          playground: false,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          plugins: [ApolloServerPluginLandingPageLocalDefault],
          context({ req }) {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) throw Error('Token needed');
            const payload = jwtService.decode(token);
            if (!payload) throw Error('Token not valid');
          },
        };
      },
    }),
    // * en uso normal, donde la autenticación esta en otro endpoint
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    // driver: ApolloDriver,
    // debug: false,
    // playground: false,
    // autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    // plugins: [ApolloServerPluginLandingPageLocalDefault],
    // }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
    }),
    ItemsModule,
    UsersModule,
    AuthModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
