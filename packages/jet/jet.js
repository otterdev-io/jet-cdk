#!/usr/bin/env node

import { setupArgs } from './flight/core/args';
import { flight } from './flight';

setupArgs().then((args) => flight(true, args));
