import { Tree } from '@nrwl/devkit';
import { CdkAppWithJetGeneratorSchema } from './schema';
import appGenerator from '@otterdev/nx-cdk/src/generators/app/generator';
import addToCdkAppGenerator from '../add-to-cdk-app/generator';

export default async function (
  tree: Tree,
  options: CdkAppWithJetGeneratorSchema
) {
  await appGenerator(tree, options);
  await addToCdkAppGenerator(tree, { project: options.name });
}
