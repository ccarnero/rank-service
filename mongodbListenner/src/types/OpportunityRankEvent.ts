import { RankDocumentEvent } from "./RankDocumentEvent";

class OpportunityRankEvent extends RankDocumentEvent {
    name: String;
    key: String;

    constructor(key:String) {
        super();
        this.name='Opportunity';
        this.key=key;
    }
}