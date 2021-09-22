import { Tree } from '@nrwl/devkit';
import { CdkAppWithJetGeneratorSchema } from './schema';
import { cdkAppGenerator } from '@otterdev/nx-cdk/';
import addToCdkAppGenerator from '../add-to-cdk-app/generator';

export default async function (
  tree: Tree,
  options: CdkAppWithJetGeneratorSchema
) {
  await cdkAppGenerator(tree, options);
  await addToCdkAppGenerator(tree, { project: options.name });
}
