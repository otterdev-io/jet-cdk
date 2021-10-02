export const stackFilter = (
  stage: string,
  stacks: string[] | undefined,
  props: { user: string }
): string[] =>
  (stacks ?? ['*']).map(
    (stack) => `*/${stage.replace('{user}', props.user)}/${stack}`
  );
