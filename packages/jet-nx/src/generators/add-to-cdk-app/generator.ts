import {
  addDependenciesToPackageJson,
  generateFiles,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import path from 'path';
import { DeployExecutorSchema } from '../../executors/deploy/schema';
import { DevExecutorSchema } from '../../executors/dev/schema';
import { ListStagesExecutorSchema } from '../../executors/list-stages/schema';
import { AddToCdkAppGeneratorSchema } from './schema';
import * as versions from '../versions';

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
  const config = readProjectConfiguration(tree, normalizedOptions.project);
  updateProjectConfiguration(tree, normalizedOptions.project, {
    root: normalizedOptions.projectRoot,
    targets: {
      ...(config.targets ?? {}),
      dev: {
        executor: '@jet-cdk/jet-nx:dev',
        options: {
          'project-dir': normalizedOptions.projectRoot,
          config: `${normalizedOptions.projectRoot}/jet.config.json5`,
          'out-dir': normalizedOptions.outDir,
        } as DevExecutorSchema,
      },
      'list-stages': {
        executor: '@jet-cdk/jet-nx:list-stages',
        options: {
          'project-dir': normalizedOptions.projectRoot,
          config: `${normalizedOptions.projectRoot}/jet.config.json5`,
          'out-dir': normalizedOptions.outDir,
        } as ListStagesExecutorSchema,
      },
      deploy: {
        executor: '@jet-cdk/jet-nx:deploy',
        options: {
          'project-dir': normalizedOptions.projectRoot,
          config: `${normalizedOptions.projectRoot}/jet.config.json5`,
          'out-dir': normalizedOptions.outDir,
        } as DeployExecutorSchema,
      },
    },
  });
  addFiles(tree, normalizedOptions);
  return addDependenciesToPackageJson(
    tree,
    {
      '@jet-cdk/jet': versions.jet,
      '@jet-cdk/afterburner': versions.afterburner,
    },
    {
      '@types/aws-lambda': versions.typesAwsLambda,
    }
  );
}
