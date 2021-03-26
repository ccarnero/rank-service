import { Serializable } from "typescript-json-serializer";

@Serializable()
export abstract class RankDocumentEvent {
    abstract name: String;
    abstract key:String;
}