import { EventEmitter } from "events";

export class Progressor extends EventEmitter {
    private lastProgress = 0;
    private hasBuiltSchema = false;
    private hasLoadedFriends = false;
    private hasLoadedThreads = false;
    private totalMessages = 1;
    private loadedMessages = 0;
    private lastAction = 'Inspecting'

    constructor() {
        super();
      }

    builtSchema()  {
        this.hasBuiltSchema = true;
        this.lastAction = 'reticulating chat'
        this.emitIfUpdate();
    }

    loadedFriends()  {
        this.hasLoadedFriends = true;
        this.lastAction = 'checking out your friends'
        this.emitIfUpdate();
    }

    loadedThreads()  {
        this.hasLoadedThreads = true;
        this.lastAction = 'reading all that goss'
        this.emitIfUpdate();
    }

    setMessages(messages: number) {
        this.totalMessages = messages;
    }

    doneThread(messages: number, threadName: string) {
        this.loadedMessages = this.loadedMessages + messages;
        this.lastAction = `imported ${threadName}`
        this.emitIfUpdate();
    }

    calculateCurrentProgress() {
        return Math.round((( // totals 110%
               this.hasBuiltSchema ? 5 : 0) // 5%
            + (this.hasLoadedFriends ? 5 : 0) // 5%
            + (this.hasLoadedThreads ? 10 : 0) // 10%
            + (this.loadedMessages / this.totalMessages) * 90) * 1000  // 65%
        ) / 1000
    }

    emitIfUpdate() {
        const currentProgress = this.calculateCurrentProgress();
        if (this.lastProgress !== currentProgress) {
            this.emit('progress', { percent: currentProgress, lastAction: this.lastAction });
        }
    }

}