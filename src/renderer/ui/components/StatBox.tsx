import React from 'react';
import styled from '@emotion/styled';
import FitText from '@kennethormandy/react-fittext';

const Container = styled.div({
  color: '#6638F0',
  padding: '1rem',
  textAlign: 'center',
  boxShadow: '0 2px 10px rgba(30, 30, 30, 0.1)',
  borderRadius: '6px',
  marginRight: '1rem',
  marginBottom: '1rem',
  width: '200px',
  display: 'flex',
  flexDirection: 'column',
});

const Value = styled.div({
  fontSize: '3rem',
  fontWeight: 600,
  flex: 'auto',
});

const Subline = styled.div({
  fontSize: '1rem',
});

interface StatBoxProps {
  value: { isLoading: boolean; data: any };
  subline: string;
  formatter?(v: any): any;
  fitText?: boolean;
}

export const StatBox: React.FC<StatBoxProps> = (props) => {
  const Text = props.fitText === true ? FitText : React.Fragment;

  return (
    <Container>
      <Value>
        <Text>
          {props.value.isLoading
            ? ''
            : props.formatter
            ? props.formatter(props.value.data)
            : props.value.data}
        </Text>
      </Value>
      <Subline>{props.subline}</Subline>
    </Container>
  );
};
