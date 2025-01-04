<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Training REST API with NestJS

This is a training project built with [NestJS](https://github.com/nestjs/nest) framework to learn and practice building REST APIs. The application demonstrates best practices for creating scalable and maintainable backend services using TypeScript and NestJS.

## Features

- REST API endpoints following REST principles
- TypeScript for type safety and better developer experience
- Database integration with Prisma ORM
- Authentication and authorization with JWT and Passport
- Unit tests and E2E tests
- API documentation with Insomnia

## Project setup

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Set up your database connection in the `.env` file and `.env.test.local` file
4. Run docker with db `db:dev:restart`
5. Run the development server with `pnpm run start:dev`

## Testing

To run unit tests, use the following command:

```bash
pnpm test
```

Before running the tests, make sure to set up your database connection in the `.env` file and `.env.test.local` file.

Run the following command to initialize the database for tests:

```bash
pnpm pretest:e2e
```

To run E2E tests, use the following command:

```bash
pnpm test:e2e
```

## API

In the `api` folder, there is API documentation in JSON format exported from Insomnia.
