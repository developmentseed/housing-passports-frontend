import T from 'prop-types';
import styled, { css } from 'styled-components';

import { environment } from '../config';
import { themeVal } from './utils/functions';

import Button from './button';

const ButtonGroup = styled.div`
  position: relative;
  display: inline-flex;

  > ${Button} {
    display: block;
    position: relative;
    margin: 0;
    z-index: 2;
  }

  ${({ orientation }) => orientation === 'horizontal' && css`
    flex-flow: row nowrap;

    > ${Button}:first-child:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      clip-path: inset(-100% 0 -100% -100%);
    }

    > ${Button}:last-child:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      clip-path: inset(-100% -100% -100% 0);
    }

    > ${Button}:not(:first-child):not(:last-child) {
      border-radius: 0;
      clip-path: inset(-100% 0);
    }

    > ${Button} + ${Button} {
      margin-left: -${themeVal('shape.borderWidth')};
    }
  `}

  ${({ orientation }) => orientation === 'vertical' && css`
    flex-flow: column;

    > ${Button}:first-child:not(:last-child) {
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      clip-path: inset(-100% -100% 0 -100%);
    }

    > ${Button}:last-child:not(:first-child) {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      clip-path: inset(0 -100% -100% -100%);
    }

    > ${Button}:not(:first-child):not(:last-child) {
      border-radius: 0;
      clip-path: inset(0 -100%);
    }

    > ${Button} + ${Button} {
      margin-top: -${themeVal('shape.borderWidth')};
    }
  `}
`;

if (environment !== 'production') {
  ButtonGroup.propTypes = {
    children: T.node,
    orientation: T.string
  };
}

export default ButtonGroup;
