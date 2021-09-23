#!/usr/bin/env node

import { setupArgs } from './flight/core/args';
import { main } from './flight';

setupArgs().then(main);
