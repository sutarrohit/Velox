# AWS Lambda Deployment — Walkthrough

## What Was Done

Integrated AWS CDK into `packages/server` so you can deploy your Hono backend to AWS Lambda while keeping the existing Bun dev workflow untouched.

### Files Created

| File | Purpose |
|---|---|
| [infra/stack.ts](file:///d:/Velox/packages/server/infra/stack.ts) | CDK stack — defines Lambda function (Node 22, 256MB, 30s timeout), Function URL, env var injection |
| [cdk.json](file:///d:/Velox/packages/server/cdk.json) | CDK config — uses `tsx` to run the stack (ESM-compatible) |

### Files Modified

| File | Changes |
|---|---|
| [lambda/index.ts](file:///d:/Velox/packages/server/lambda/index.ts) | Added `LambdaEvent`/`LambdaContext` type imports, `AppType` export |
| [package.json](file:///d:/Velox/packages/server/package.json) | Added `cdk:synth`, `cdk:deploy`, `cdk:diff`, `cdk:destroy` scripts + CDK devDeps |
| [tsconfig.json](file:///d:/Velox/packages/server/tsconfig.json) | Added `lambda/` and `infra/` to `include` |
| [.gitignore](file:///d:/Velox/packages/server/.gitignore) | Added `cdk.out/` |
| [turbo.json](file:///d:/Velox/turbo.json) | Added `cdk:deploy`, `cdk:synth`, `cdk:diff`, `cdk:destroy` tasks |

### Key Diffs

```diff:stack.ts
===
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.production if it exists
dotenv.config({ path: path.resolve(__dirname, "../.env.production") });

export class VeloxServerStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const serverRoot = path.resolve(__dirname, "..");

        const fn = new NodejsFunction(this, "VeloxServerFunction", {
            entry: path.join(__dirname, "../lambda/index.ts"),
            handler: "handler",
            runtime: lambda.Runtime.NODEJS_22_X,
            memorySize: 256,
            timeout: cdk.Duration.seconds(30),
            environment: {
                NODE_ENV: "production",
                FRONTEND_URL: process.env.FRONTEND_URL || "",
                FINNHUB_API_KEY: process.env.FINNHUB_API_KEY || "",
                GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
                LOG_LEVEL: process.env.LOG_LEVEL || "info",
                DATABASE_URL: process.env.DATABASE_URL || "",
                DIRECT_URL: process.env.DIRECT_URL || "",
            },
            bundling: {
                minify: true,
                sourceMap: true,
                target: "node22",
                format: cdk.aws_lambda_nodejs.OutputFormat.ESM,
                mainFields: ["module", "main"],
                // Let esbuild resolve @/* path aliases from tsconfig
                tsconfig: path.join(__dirname, "../tsconfig.json"),
                // ESM banner: needed for packages that use require()
                banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
            },
        });

        // Add a Function URL (no API Gateway needed)
        const fnUrl = fn.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE,
        });

        new cdk.CfnOutput(this, "FunctionUrl", {
            value: fnUrl.url,
            description: "Velox Server Lambda Function URL",
        });

        new cdk.CfnOutput(this, "FunctionName", {
            value: fn.functionName,
            description: "Lambda Function Name",
        });
    }
}

const app = new cdk.App();
new VeloxServerStack(app, "VeloxServerStack", {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || "us-east-1",
    },
});
```

```diff:package.json
{
    "name": "@velox/server",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "bun run --hot src/index.ts",
        "lint": "eslint . --max-warnings 0",
        "build": "bun build src/index.ts --outdir dist --target bun --packages external",
        "start": "bun run dist/server.js",
        "test": "vitest run",
        "test:watch": "vitest",
        "test:coverage": "vitest run --coverage"
    },
    "dependencies": {
        "@asteasolutions/zod-to-openapi": "^8.4.0",
        "@google/genai": "^1.43.0",
        "@hono/zod-openapi": "^1.2.1",
        "@prisma/adapter-pg": "^7.3.0",
        "@prisma/client": "^7.3.0",
        "@scalar/hono-api-reference": "^0.9.40",
        "@velox/typescript-config": "*",
        "axios": "^1.13.6",
        "dotenv": "^17.2.4",
        "dotenv-expand": "^12.0.3",
        "hono": "^4.11.9",
        "hono-openapi": "^1.2.0",
        "hono-pino": "^0.10.3",
        "hono-rate-limiter": "^0.5.3",
        "node-cache": "^5.1.2",
        "pg": "^8.18.0",
        "pino": "^10.3.1",
        "pino-pretty": "^13.1.3",
        "stoker": "^2.0.1",
        "zod": "^4.3.6"
    },
    "devDependencies": {
        "@types/bun": "latest",
        "@types/node": "^25.2.0",
        "@types/pg": "^8.16.0",
        "@velox/eslint-config": "*",
        "@vitest/coverage-v8": "3.2.4",
        "prisma": "^7.3.0",
        "vitest": "^3.0.0"
    }
}
===
{
    "name": "@velox/server",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "bun run --hot src/index.ts",
        "lint": "eslint . --max-warnings 0",
        "build": "bun build src/index.ts --outdir dist --target bun --packages external",
        "start": "bun run dist/server.js",
        "test": "vitest run",
        "test:watch": "vitest",
        "test:coverage": "vitest run --coverage",
        "cdk:synth": "cdk synth",
        "cdk:deploy": "cdk deploy --require-approval never",
        "cdk:diff": "cdk diff",
        "cdk:destroy": "cdk destroy"
    },
    "dependencies": {
        "@asteasolutions/zod-to-openapi": "^8.4.0",
        "@google/genai": "^1.43.0",
        "@hono/zod-openapi": "^1.2.1",
        "@prisma/adapter-pg": "^7.3.0",
        "@prisma/client": "^7.3.0",
        "@scalar/hono-api-reference": "^0.9.40",
        "@velox/typescript-config": "*",
        "axios": "^1.13.6",
        "dotenv": "^17.2.4",
        "dotenv-expand": "^12.0.3",
        "hono": "^4.11.9",
        "hono-openapi": "^1.2.0",
        "hono-pino": "^0.10.3",
        "hono-rate-limiter": "^0.5.3",
        "node-cache": "^5.1.2",
        "pg": "^8.18.0",
        "pino": "^10.3.1",
        "pino-pretty": "^13.1.3",
        "stoker": "^2.0.1",
        "zod": "^4.3.6"
    },
    "devDependencies": {
        "@types/bun": "latest",
        "@types/node": "^25.2.0",
        "@types/pg": "^8.16.0",
        "@velox/eslint-config": "*",
        "@vitest/coverage-v8": "3.2.4",
        "aws-cdk": "^2.200.0",
        "aws-cdk-lib": "^2.200.0",
        "constructs": "^10.4.2",
        "esbuild": "^0.25.0",
        "prisma": "^7.3.0",
        "tsx": "^4.19.0",
        "vitest": "^3.0.0"
    }
}
```

```diff:turbo.json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "env": ["DATABASE_URL", "NODE_ENV", "FRONTEND_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "dist/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "inputs": ["$TURBO_DEFAULT$", ".env*", "tsconfig.json"]
    },
    "test": {
      "cache": false
    },
    "db:migrate:dev": {
      "cache": false
    },
    "db:migrate:deploy": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    },
    "db:generate": {
      "cache": false
    },
    "db:studio": {
      "cache": false,
      "persistent": true
    },
    "generate": {
      "dependsOn": ["^generate"],
      "cache": false
    }
  }
}
===
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "env": ["DATABASE_URL", "NODE_ENV", "FRONTEND_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "dist/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "inputs": ["$TURBO_DEFAULT$", ".env*", "tsconfig.json"]
    },
    "test": {
      "cache": false
    },
    "db:migrate:dev": {
      "cache": false
    },
    "db:migrate:deploy": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    },
    "db:generate": {
      "cache": false
    },
    "db:studio": {
      "cache": false,
      "persistent": true
    },
    "generate": {
      "dependsOn": ["^generate"],
      "cache": false
    },
    "cdk:deploy": {
      "dependsOn": ["build"],
      "cache": false
    },
    "cdk:synth": {
      "cache": false
    },
    "cdk:diff": {
      "cache": false
    },
    "cdk:destroy": {
      "cache": false
    }
  }
}
```

## Issues Fixed During Implementation

1. **`ts-node` doesn't support ESM** — Your project uses `"type": "module"`. Switched CDK runner from `ts-node` to `tsx`.
2. **`__dirname` unavailable in ESM** — Replaced with `fileURLToPath(import.meta.url)` + `path.dirname()`.
3. **`nodeModules` requires Docker** — Removed Docker-dependent Prisma bundling hooks. esbuild bundles everything inline.

## Verification

| Check | Result |
|---|---|
| `bun run test` (vitest) | ✅ All test files pass |
| `npx cdk synth` | ✅ CloudFormation template generated successfully |

## How to Deploy

```bash
# 1. Create .env.production with your production env vars
cp .env .env.production
# Edit .env.production with production values

# 2. Configure AWS credentials
aws configure

# 3. Bootstrap CDK (first time only)
npx cdk bootstrap

# 4. Deploy
bun run cdk:deploy
```

The deploy output will print your **Lambda Function URL** — that's your production API endpoint.

### Other CDK Commands

| Command | What it does |
|---|---|
| `bun run cdk:synth` | Preview the CloudFormation template |
| `bun run cdk:diff` | See what will change before deploying |
| `bun run cdk:deploy` | Deploy to AWS |
| `bun run cdk:destroy` | Tear down the stack |
