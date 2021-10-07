import lambdaDS from '../datasources/lambda';
import go from '../..//functions/go';
import { tagOf } from '../..//lib';
import compose from 'compose-function';
import { resolver } from '..';

export default tagOf(compose(resolver, lambdaDS, go));
