#!/usr/bin/env node

import { setupArgs } from './cli/core/args';
import { main } from './cli';

setupArgs().then(main);
