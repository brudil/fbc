import Knex from 'knex';

export interface AnalyserData {
    db: Knex;
}

export interface Analyser<T> {
    (data: AnalyserData): Promise<T>;
}