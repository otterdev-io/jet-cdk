import {
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { DevExecutorSchema } from '../../executors/dev/schema';
import { AddToCdkAppGeneratorSchema } from './schema';

interface NormalizedSchema extends AddToCdkAppGeneratorSchema {
  project: string;
  projectRoot: string;
  outDir: string;
}

function normalizeOptions(
  tree: Tree,
  options: AddToCdkAppGeneratorSchema
): NormalizedSchema {
  const { root: projectRoot } = readProjectConfiguration(tree, options.project);
  const outDir = `dist/${projectRoot}/.jet`;

  return {
    ...options,
    project: options.project,
    projectRoot,
    outDir,
  };
}

export default async function (
  tree: Tree,
  options: AddToCdkAppGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  updateProjectConfiguration(tree, normalizedOptions.project, {
    root: normalizedOptions.projectRoot,
    targets: {
      dev: {
        executor: '@jet-cdk/nx-plugin:dev',
        options: {
          config: `${normalizedOptions.projectRoot}/jet.config.json5`,
          'out-dir': normalizedOptions.outDir,
        } as DevExecutorSchema,
      },
    },
  });
}
