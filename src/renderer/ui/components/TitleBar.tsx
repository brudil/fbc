import React from 'react';
import styled from '@emotion/styled'

const TitleBarContainer = styled.header({
    background: '#EDECEE',
    padding: '0.2rem',
    paddingLeft: '80px',
    height: '40px',
    width: '100%',
    boxSizing: 'border-box',
    alignContent: 'center',
    justifyContent: 'center',
    WebkitAppRegion: 'drag',
    top: 0,
    position: 'sticky',
});
const Menu = styled.ul({
    display: 'flex',
    margin: 0,
    padding: 0,
    listStyle: 'none',
    justifyContent: 'center',
});

const MenuItem = styled.li({
    padding: '0 1rem',
});

export function TitleBar() {
    return (
        <TitleBarContainer>
            <Menu>
                <MenuItem>
                    Overview
                </MenuItem>
                <MenuItem>
                    Chats
                </MenuItem>
                <MenuItem>
                    People
                </MenuItem>
            </Menu>
        </TitleBarContainer>
    );
}