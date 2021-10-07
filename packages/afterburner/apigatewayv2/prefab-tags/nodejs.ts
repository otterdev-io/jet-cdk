import lambdaProxy from '../integrations/lambda-proxy';
import nodejs from '../../functions/nodejs';
import { tagOf } from '../..//lib';
import compose from 'compose-function';

export default tagOf(compose(lambdaProxy, nodejs));
