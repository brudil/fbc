import { useEffect, useContext, useState } from 'react';
import { Analyser, AnalyserData } from '../../../lib/analysers/Analyser';
import { DataContext } from '../DataContext';

type ThenArg<T> = T extends Promise<infer U>
  ? U
  : T extends (...args: any[]) => Promise<infer U>
  ? U
  : T;

export const useAnalyser = <T>(analyser: Analyser<T>) => {
  const data = useContext(DataContext);
  const [result, setResult] = useState<{
    isLoading: boolean;
    data: null | ThenArg<ReturnType<Analyser<T>>>;
  }>({ data: null, isLoading: true });

  useEffect(() => {
    if (data.db !== null) {
      analyser(data as AnalyserData).then((result) => {
        setResult({ data: result, isLoading: false });
      });
    }
  }, [data.db !== null]);

  return result;
};
