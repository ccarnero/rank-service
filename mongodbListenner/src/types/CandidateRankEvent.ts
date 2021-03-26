import { RankDocumentEvent } from "./RankDocumentEvent";
import mongodb = require("mongodb");

export default class CandidateDocumentEvent extends RankDocumentEvent {
    name: String;
    key: String;
    
    constructor(objectId:string) {
        super();
        this.name='Candidate';
        this.key= objectId;
    }
}