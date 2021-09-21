import { setupArgs } from './cli/core/args';
import { main } from './cli/main';

setupArgs().then(main);
