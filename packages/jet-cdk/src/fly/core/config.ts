export const stackFilter = (stage: string, props: { user: string }) =>
  `*/${stage.replace("{user}", props.user)}/*`;
