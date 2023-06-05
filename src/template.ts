import { CliOptions } from './types';
import { OperationCollection, transformToHandlerCode, transformToResObject } from './transform';

const getSetupCode = (options?: CliOptions) => {
  if (options?.node || options?.reactNative) {
    return [`const server = setupServer(...handlers);`, `server.listen();`].join('\n');
  }

  return [`const worker = setupWorker(...handlers);`, `worker.start();`].join('\n');
};

const getImportsCode = (options?: CliOptions) => {
  const imports = [`import { setupWorker, rest } from 'msw';`, `import { faker } from '@faker-js/faker';`];

  if (options?.node) {
    imports.push(`import { setupServer } from 'msw/node'`);
  } else if (options?.reactNative) {
    imports.push(`import { setupServer } from 'msw/native'`);
  }

  return imports.join('\n');
};

export const mockTemplate = (operationCollection: OperationCollection, baseURL: string, options?: CliOptions) => `/**
* This file is AUTO GENERATED by [msw-auto-mock](https://github.com/zoubingwu/msw-auto-mock)
* Feel free to commit/edit it as you need.
*/
/* eslint-disable */
/* tslint:disable */
${getImportsCode(options)}

faker.seed(1);

const baseURL = '${baseURL}';
const MAX_ARRAY_LENGTH = ${options?.maxArrayLength ?? 20};

let i = 0;
const next = () => {
  if (i === Number.MAX_SAFE_INTEGER - 1) {
    i = 0;
  }
  return i++;
}

export const handlers = [
  ${transformToHandlerCode(operationCollection)}
];

${transformToResObject(operationCollection)}

// This configures a Service Worker with the given request handlers.
export const startWorker = () => {
  ${getSetupCode(options)}
}
`;
