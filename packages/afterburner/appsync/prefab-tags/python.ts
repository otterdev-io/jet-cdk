import lambdaDS from '../datasources/lambda';
import python from '../../functions/python';
import { tagOf } from '../../lib';
import compose from 'compose-function';
import { resolver } from '..';

export default tagOf(compose(resolver, lambdaDS, python));
