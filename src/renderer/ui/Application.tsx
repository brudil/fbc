import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { GetStarted } from './components/GetStarted';
import { loadData, databaseExists, Data } from '../../lib/store';
import { Progressor } from '../../lib/Progressor';
import { LoadingData } from './components/LoadingData';
import { Overview } from './components/Overview';
import styled from '@emotion/styled';
import { DataContext } from './DataContext';

enum Modes {
    Initial,
    Loading,
    Overview,
}

const ApplicationContainer = styled.div({
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    display: 'flex',
    flexDirection: 'column',
    flex: 'auto',
});

const ViewContainer = styled.div({
    flex: 'auto',
    display: 'flex',
    flexDirection: 'column'
});

export function Application() {
    const [mode, setMode] = useState(Modes.Initial);
    const [data, setData] = useState<Data>({ db: null });
    const [progress, setProgress] = useState({ percent: 0, lastAction: 'Looking at the folder'});

    useEffect(() => {
        databaseExists()
            .then(exists => {
                if (exists) {
                    setData({ db: exists });
                    setMode(Modes.Overview);
                }
            })
    }, []);

    const startLoad = (path: string) => {
        setMode(Modes.Loading);
        const p = new Progressor();
        p.addListener('progress', (v) => setProgress(v));
        loadData(path, p)
            .then((d) => {
                setData(d);
                setMode(Modes.Overview);
            })
    };

    return (
        <DataContext.Provider value={data}>
            <ApplicationContainer>
                <TitleBar />

                <ViewContainer>
                    {mode === Modes.Initial && <GetStarted onStart={startLoad} />}
                    {mode === Modes.Loading && <LoadingData progress={progress.percent} lastAction={progress.lastAction} />}
                    {mode === Modes.Overview && <Overview />}

                </ViewContainer>
            </ApplicationContainer>
        </DataContext.Provider>
    )
};