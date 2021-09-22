#!/usr/bin/env node

import { setupArgs } from './fly/core/args';
import { main } from './fly';

setupArgs().then(main);
