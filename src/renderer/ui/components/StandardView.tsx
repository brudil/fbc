import React from 'react';
import styled from '@emotion/styled';

const StandardViewContainer = styled.div({
    padding: '2rem',
})

export const StandardView: React.FC = (props) => {
    return (
        <StandardViewContainer>
            {props.children}            
        </StandardViewContainer>
    );
}