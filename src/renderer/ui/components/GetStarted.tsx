import React from 'react';
import Dropzone, { DropFilesEventHandler } from 'react-dropzone'
import styled from '@emotion/styled';

interface GetStartedProps {
    onStart(path: string): void;
}

const DropContainer = styled.div({
    padding: '2rem',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flex: 'auto',
});

const ContentContainer = styled.div({
    backgroundImage: 'repeating-linear-gradient(to right, lightgrey 0%, lightgrey 50%, transparent 50%, transparent 100%), repeating-linear-gradient(to right, lightgrey 0%, lightgrey 50%, transparent 50%, transparent 100%), repeating-linear-gradient(to bottom, lightgrey 0%, lightgrey 50%, transparent 50%, transparent 100%), repeating-linear-gradient(to bottom, lightgrey 0%, lightgrey 50%, transparent 50%, transparent 100%)',
    backgroundPosition: 'left top, left bottom, left top, right top',
    backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
    backgroundSize: '20px 3px, 20px 3px, 3px 20px, 3px 20px',
    display: 'flex',
    borderRadius: '12px',
    flexDirection: 'column',
    flex: 'auto',
    padding: '2rem',
    textAlign: 'center',
})

export const GetStarted: React.FC<GetStartedProps> = ({ onStart }) => {
    const onDrop: DropFilesEventHandler = (acceptedFiles, rejectedFiles) => {
        onStart(acceptedFiles[0].path);
    }
    
    return (
            <Dropzone onDrop={onDrop}>
        {({getRootProps, getInputProps, isDragActive}) => {
          return (
            <DropContainer
              {...getRootProps()}
            >
            <ContentContainer>

            <h2>Get started!</h2>

              <input {...getInputProps()} />
              {
                !isDragActive ?
                  <p>Drag your Facebook Data Folder here</p> :
                  <p>Drop to start!</p>
              }

</ContentContainer>
            </DropContainer>
          )
        }}
      </Dropzone>
    )
}