import lambdaProxy from '../integrations/lambda-proxy';
import go from '../../functions/go';
import { tagOf } from '../../lib';
import compose from 'compose-function';

export default tagOf(compose(lambdaProxy, go));
