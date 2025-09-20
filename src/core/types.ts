export interface TaskDefinition {
  id: string;
  title: string;
  steps: string[];
  depends_on?: string[];
  parallel?: boolean;
}

export interface LoadedTasks {
  tasks: TaskDefinition[];
  path: string;
}
