'use strict';
import React from 'react';
import { createPortal } from 'react-dom';
import { PropTypes as T } from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import styled, { createGlobalStyle } from 'styled-components';

import { themeVal } from '../../atomic-components/utils/functions';
import { multiply } from '../../atomic-components/utils/math';
import collecticons from '../../atomic-components/collecticons';

import Button from '../../atomic-components/button';

const sizeMapping = {
  'small': '32rem',
  'medium': '48rem',
  'large': '64rem',
  'xlarge': '80rem'
};

const ModalInner = styled.div`
  padding-left: 1rem;
  padding-right: 1rem;
  position: relative;
  margin: ${multiply(themeVal('layout.globalSpacing'), 2)} 0;
  width: 100%;
  max-width: 48rem;

  > *:last-child {
    margin-bottom: 0;
  }

  /* Size attribute */
  ${({ size }) => `max-width: ${sizeMapping[size]};`}
`;

const ModalWrapper = styled.section`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9990;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;

  &.modal-enter {
    transform: translate3d(0, 0, 0);
    transition: opacity 0.32s ease 0s, visibility 0.32s linear 0s;
    opacity: 0;
    visibility: hidden;
  }

  &.modal-enter.modal-enter-active {
    opacity: 1;
    visibility: visible;
  }

  &.modal-exit {
    transition: opacity 0.32s ease 0s, visibility 0.32s linear 0s;
    opacity: 1;
    visibility: visible;
  }

  &.modal-exit.modal-exit-active {
    opacity: 0;
    visibility: hidden;
  }
`;

const ButtonDismiss = styled(Button)`
  position: absolute;
  top: ${multiply(themeVal('layout.globalSpacing'), 2)};
  right: ${multiply(themeVal('layout.globalSpacing'), 2)};
  z-index: 10;

  ::before {
    ${collecticons('xmark')}
    font-size: 1.25rem;
  }
`;

const BodyUnscrollable = createGlobalStyle`
  ${({ revealed }) => revealed && `
    body {
      overflow-y: hidden;
    }
  `}
`;

/**
 * React modal component.
 * The Modal component provides 3 sections for content.
 * - Header
 * - Body
 * - Footer
 *
 * A property is used to define the element rendered in each section respectively;
 * - headerComponent
 * - bodyComponent
 * - footerComponent
 *
 * For convenience the modal module exports several elements to be used as
 * defaults or as base for overrides by stayled-components.
 *
 * Available properties listed as parameters:
 *
 * @param {string} id An id for the modal
 * @param {bool} revealed Whether or not the modal is visible.
 * @param {string} className
 * @param {func} onOverlayClick Callback function for overlay click
 * @param {func} onCloseClick Callback function for close button click
 * @param {node} headerComponent Component for the header. Unless there's a
 *               specific need, the ModalHeader should be imported and used.
 * @param {node} bodyComponent Component for the body. Unless there's a
 *               specific need, the ModalBody should be imported and used.
 * @param {node} footerComponent Component for the footer. Unless there's a
 *               specific need, the ModalFooter should be imported and used.
 *
 * @example
 * const SpecialFooter = styled(ModalFooter)` color: papaia; `;
 *  <Modal
 *    id='modal'
 *    revealed={true}
 *    onCloseClick={() => {}}
 *    headerComponent={(
 *      <ModalHeader>
 *        <h1>This is the header</h1>
 *      </ModalHeader>
 *    )}
 *    bodyComponent={(
 *      <ModalBody>hello</ModalBody>
 *    )}
 *    footerComponent={(
 *      <SpecialFooter>footer</SpecialFooter>
 *    )}
 *  />
 */
export class Modal extends React.Component {
  constructor (props) {
    super(props);

    this.componentAddedBodyClass = false;

    this.onOverlayClick = this.onOverlayClick.bind(this);
    this.onCloseClick = this.onCloseClick.bind(this);
    this.keyListener = this.keyListener.bind(this);

    this.el = document.createElement('div');
    const uid = Math.random().toString(36).substr(2, 8);
    this.el.className = `modal-portal-${uid}`;
    this.rootEl = document.body;
    if (!this.rootEl) throw new Error('Portal root element does not exist.');
  }

  keyListener (e) {
    // ESC.
    if (this.props.revealed && e.keyCode === 27) {
      e.preventDefault();
      this.props.onCloseClick();
    }
  }

  componentDidMount () {
    document.addEventListener('keyup', this.keyListener);
    this.rootEl.appendChild(this.el);
  }

  componentWillUnmount () {
    document.removeEventListener('keyup', this.keyListener);
    this.rootEl.removeChild(this.el);
  }

  onOverlayClick (e) {
    // Prevent children from triggering this.
    if (e.target === e.currentTarget) {
      // Overlay click is disabled.
      // this.props.onOverlayClick.call(this, e);
    }
  }

  onCloseClick (e) {
    e.preventDefault();
    this.props.onCloseClick(e);
  }

  render () {
    const klasses = [
      'modal',
      ...(this.props.className || [])
    ];

    return createPortal((
      <CSSTransition
        in={this.props.revealed}
        appear={true}
        unmountOnExit={true}
        classNames='modal'
        timeout={{ enter: 300, exit: 300 }}>

        <ModalWrapper className={klasses.join(' ')} key={`modal-${this.props.id}`} onClick={this.onOverlayClick} id={this.props.id}>
          <BodyUnscrollable revealed={this.props.revealed} />
          <ModalInner className='modal__inner' size={this.props.size}>
            {this.props.headerComponent}
            {this.props.bodyComponent}
            {this.props.footerComponent}
          </ModalInner>
          <ButtonDismiss variation='base-plain' title='Close' onClick={this.onCloseClick} hideText>Dismiss</ButtonDismiss>
        </ModalWrapper>

      </CSSTransition>
    ), this.el);
  }
}

Modal.defaultProps = {
  revealed: false,
  size: 'medium',

  onOverlayClick: function (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('Modal', 'onOverlayClick handler not implemented');
    }
  },

  onCloseClick: function (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('Modal', 'onCloseClick handler not implemented');
    }
  }
};

if (process.env.NODE_ENV !== 'production') {
  Modal.propTypes = {
    id: T.string.isRequired,
    revealed: T.bool,
    className: T.string,
    size: T.string,
    onOverlayClick: T.func,
    onCloseClick: T.func,
    headerComponent: T.node.isRequired,
    bodyComponent: T.node.isRequired,
    footerComponent: T.node
  };
}

export const ModalHeader = styled.header`
  position: relative;
  text-align: center;
  margin-bottom: ${multiply(themeVal('layout.globalSpacing'), 3)};

  & > *:last-child {
    margin-bottom: 0;
  }
`;

export const ModalBody = styled.div`
  margin-bottom: ${multiply(themeVal('layout.globalSpacing'), 3)};

  & > *:last-child {
    margin-bottom: 0;
  }
`;

export const ModalFooter = (props) => <footer {...props} />;
