import { createContext } from 'react';
import { Data } from '../../lib/store';

export const DataContext = createContext<Data>({ db: null });