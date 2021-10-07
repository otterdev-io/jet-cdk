import lambdaProxy from '../integrations/lambda-proxy';
import python from '../../functions/python';
import { tagOf } from '../..//lib';
import compose from 'compose-function';

export default tagOf(compose(lambdaProxy, python));
