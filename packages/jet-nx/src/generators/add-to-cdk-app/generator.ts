import {
  addDependenciesToPackageJson,
  generateFiles,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import path from 'path';
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

function addFiles(host: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
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
  options: AddToCdkAppGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  updateProjectConfiguration(tree, normalizedOptions.project, {
    root: normalizedOptions.projectRoot,
    targets: {
      dev: {
        executor: '@jet-cdk/jet-nx:dev',
        options: {
          config: `${normalizedOptions.projectRoot}/jet.config.json5`,
          'out-dir': normalizedOptions.outDir,
        } as DevExecutorSchema,
      },
    },
  });
  addFiles(tree, normalizedOptions);
  return addDependenciesToPackageJson(
    tree,
    {
      '@jet-cdk/jet': '^0.0.1',
    },
    {}
  );
}
