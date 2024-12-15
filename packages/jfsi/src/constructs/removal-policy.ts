import { RemovalPolicy } from 'aws-cdk-lib';
import { isProduction } from './stage.js';

/**
 * Get the removal policy to use. Generally speaking, in production we want to
 * retain it. But otherwise, we can just remove it when we remove the stack.
 * @param app The SST App to check
 * @returns
 */
export const getRemovalPolicy = (app: { stage: string }): RemovalPolicy =>
  isProduction(app.stage) ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
