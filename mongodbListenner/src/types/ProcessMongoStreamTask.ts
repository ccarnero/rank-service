import { RankDocumentEvent } from "./RankDocumentEvent";

type ProcessMongoStreamTask = (propertyName: string) => RankDocumentEvent;