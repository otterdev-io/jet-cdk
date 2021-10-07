import lambdaDS from '../datasources/lambda';
import nodejs from '../../functions/nodejs';
import { tagOf } from '../..//lib';
import compose from 'compose-function';
import { resolver } from '..';

export default tagOf(compose(resolver, lambdaDS, nodejs));
