export interface Task {
    id: string;
    title: string;
    notes?: string;
    status?: 'needsAction' | 'completed';
    due?: string;
    completed?: string;
    updated?: string;
    selfLink?: string;
    parent?: string;
    position?: string;
}
export type TaskBDTuple = [Task, number];