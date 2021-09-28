import { generateFiles, names, offsetFromRoot, Tree } from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { CdkAppWithJetGeneratorSchema } from './schema';
import {
  cdkAppGenerator,
  CdkAppNormalizedSchema,
  cdkAppNormalizeOptions,
} from '@otterdev/nx-cdk';
import addToCdkAppGenerator from '../add-to-cdk-app/generator';
import path from 'path';

function addFiles(host: Tree, options: CdkAppNormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    host,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}
export default async function (
  tree: Tree,
  options: CdkAppWithJetGeneratorSchema
) {
  const cdk = await cdkAppGenerator(tree, options);
  const addToApp = await addToCdkAppGenerator(tree, { project: options.name });
  addFiles(tree, cdkAppNormalizeOptions(tree, options));
  return runTasksInSerial(cdk, addToApp);
}
