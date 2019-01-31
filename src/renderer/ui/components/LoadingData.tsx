import React from 'react';
import styled from '@emotion/styled';

interface LoadingDataProps {
    progress: number;
    lastAction: string;
}

const LoadingContainer = styled.div({
    textAlign: 'center',
    padding: '2rem',
});

const OuterProgress = styled.div({
    width: '100%',
    height: '20px',
    overflow: 'hidden',
    borderRadius: '20px',
})

const InnerProgress = styled.div({
    height: '100%',
    backgroundColor: '#3D94EE',
    transition: 'width 300ms ease',
})

export const LoadingData = (props: LoadingDataProps) => {

    return (
        <LoadingContainer>
            <h2>Loading</h2>

            <OuterProgress><InnerProgress  style={{ width: `${props.progress}%` }}/></OuterProgress>
            <p>{props.lastAction}</p>
        </LoadingContainer>
    )
}