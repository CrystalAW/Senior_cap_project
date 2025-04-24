import { TaskBDTuple } from "./tasks.model";

export interface googleCreds {
    type: string;
    client_id: string;
    client_secret: string;
    refresh_token: string;
}

export interface schedPayload {
    taskBDTupleList: TaskBDTuple[];
    additionalNotes: string;
    endTime: string;
    tz: string;
    creds: googleCreds;
}