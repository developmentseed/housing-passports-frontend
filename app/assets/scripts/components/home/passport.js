'use strict';
import React from 'react';
import styled from 'styled-components';
import pick from 'lodash.pick';
import { Link } from 'react-router-dom';
import { PropTypes as T } from 'prop-types';
import { rgba } from 'polished';

import { environment, baseurl } from '../../config';
import { themeVal } from '../../atomic-components/utils/functions';
import { divide } from '../../atomic-components/utils/math';
import { antialiased } from '../../atomic-components/utils';

import {
  LoadingSkeleton,
  LoadingSkeletonGroup
} from '../common/loading-skeleton';
import CarouselModal from './carousel-modal';
import Heading from '../../atomic-components/heading';
import Dl from '../../atomic-components/definition-list';
import Button from '../../atomic-components/button';
import collecticons from '../../atomic-components/collecticons';

class Passport extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      galleryRevealed: false
    };

    this.onModalCloseClick = this.onModalCloseClick.bind(this);
    this.onGalleryImageClick = this.onGalleryImageClick.bind(this);
  }

  onModalCloseClick () {
    this.setState({ galleryRevealed: false });
  }

  onGalleryImageClick (e) {
    e.preventDefault();
    this.setState({ galleryRevealed: true });
  }

  renderSection (title, data) {
    return (
      <Section>
        <SectionHeading variation='secondary' size='small'>
          {title}
        </SectionHeading>
        <SectionDl type='horizontal'>
          {Object.keys(data).map(k => (
            <React.Fragment key={k}>
              <dt>{k.replace('_', ' ')}</dt>
              <dd>{data[k].toString()}</dd>
            </React.Fragment>
          ))}
        </SectionDl>
      </Section>
    );
  }

  renderData () {
    const data = this.props.rooftop.getData();

    const images = data.images.map(i => `${baseurl}/assets/graphics/street-view/${data.id}/${i}`);
    const [lon, lat] = this.props.rooftopCoords || ['n/a', 'n/a'];

    return (
      <PassportBody>
        <Section>
          <SectionHeading variation='secondary' size='small'>
            Location
          </SectionHeading>
          {!!images.length && (
            <SectionFigure>
              <SectionFigureLink
                href={`#passport-gallery-${data.id}`}
                title='Open photo gallery'
                onClick={this.onGalleryImageClick}
              >
                <SectionFigureThumb>
                  <img src={images[0]} alt='Passport gallery image cover' />
                </SectionFigureThumb>
                <SectionFigcaption>{images.length} photos</SectionFigcaption>
              </SectionFigureLink>
            </SectionFigure>
          )}
          <SectionDl type='horizontal'>
            <dt>Latitude</dt>
            <dd>{lat}</dd>
            <dt>Longitude</dt>
            <dd>{lon}</dd>
          </SectionDl>
        </Section>

        {this.renderSection(
          'Evaluation',
          pick(data, [
            'AREA',
            'AVG_SLOPE',
            'AVG_HEIGHT',
            'FLOORS',
            'ROOF_MATERIAL',
            'TERRAIN_SLOPE',
            'VOLUME'
          ])
        )}
        {this.renderSection(
          'StreetView detection',
          pick(data, [ 'construction_ml', 'design_ml', 'material_ml' ])
        )}
        {this.renderSection('Risk', pick(data, ['FLOOD', 'LANDSLIDE']))}

        <CarouselModal
          id={`passport-gallery-${data.id}`}
          images={images}
          revealed={this.state.galleryRevealed}
          onCloseClick={this.onModalCloseClick}
        />
      </PassportBody>
    );
  }

  render () {
    if (!this.props.visible) return null;

    const { isReady, hasError } = this.props.rooftop;

    return (
      <article className={this.props.className}>
        <PassportHeader>
          <PassportTitle>Passport</PassportTitle>
          <PassportToolbar>
            <PassportCenter
              variation='base-plain'
              hideText
              onClick={this.props.onRecenterClick}
              title='Recenter map views'
            >
              Center map here
            </PassportCenter>
            <VerticalDivider />
            <PassportClose
              element={Link}
              to={{ pathname: '/', search: this.props.searchQS }}
              variation='base-plain'
              hideText
              title='Close passport pane'
            >
              Close passport
            </PassportClose>
          </PassportToolbar>
        </PassportHeader>

        {!isReady() && (
          <LoadingSkeletonGroup style={{ padding: '1rem' }}>
            <LoadingSkeleton type='heading' width={1 / 5} />
            <LoadingSkeleton width={2 / 3} />
            <LoadingSkeleton width={2 / 3} />
            <LoadingSkeleton width={1 / 4} />
          </LoadingSkeletonGroup>
        )}

        {hasError() && <p>Passport not found</p>}

        {!hasError() && isReady() && this.renderData()}
      </article>
    );
  }
}

if (environment !== 'production') {
  Passport.propTypes = {
    onRecenterClick: T.func,
    className: T.string,
    rooftop: T.object,
    rooftopCoords: T.array,
    visible: T.bool,
    searchQS: T.string
  };
}

export default styled(Passport)`
  grid-column: 2;
  grid-row: 1 / span 2;
  position: relative;
  display: flex;
  flex-flow: column;
  z-index: 20;
  background: #fff;
  box-shadow: 0 0 0 1px ${themeVal('colors.baseAlphaColor')};
  overflow: hidden;
`;

const PassportHeader = styled.header`
  position: relative;
  z-index: 10;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  background: #fff;
  padding: ${themeVal('layout.globalSpacing')};
  box-shadow: 0 0 0 1px ${themeVal('colors.baseAlphaColor')};
  min-height: 4rem;
`;

const PassportTitle = styled.h1`
  font-family: ${themeVal('typography.headingFontFamily')};
  font-weight: ${themeVal('typography.headingFontWeight')};
  letter-spacing: 0.125em;
  font-size: 1rem;
  line-height: 1.25rem;
  text-transform: uppercase;
  color: ${themeVal('colors.primaryColor')};
  margin: 0;
`;

const PassportToolbar = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-left: auto;
  align-items: center;
`;

const PassportCenter = styled(Button)`
  &::before {
    ${collecticons('crosshair')}
  }
`;

const PassportClose = styled(Button)`
  &::before {
    ${collecticons('xmark')}
  }
`;

const PassportBody = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
`;

const VerticalDivider = styled.hr`
  border: 0;
  width: ${divide(themeVal('layout.globalSpacing'), 2)};
  height: ${themeVal('layout.globalSpacing')};
  margin: 0;
  background:
    transparent
    linear-gradient(
      90deg,
      ${themeVal('colors.baseAlphaColor')},
      ${themeVal('colors.baseAlphaColor')}
    )
    50% / ${themeVal('shape.borderWidth')} auto no-repeat;
`;

const Section = styled.section`
  display: flex;
  flex-flow: column;
  padding: ${themeVal('layout.globalSpacing')};

  &:not(:last-child) {
    box-shadow: 0 1px 0 0 ${themeVal('colors.baseAlphaColor')};
  }

  > *:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeading = styled(Heading)`
  margin: 0 0 1rem 0;
`;

const SectionDl = styled(Dl)`
  margin: 0;

  dt,
  dd {
    font-size: 0.75rem;
    line-height: 1rem;
  }

  dt {
    font-weight: ${themeVal('typography.headingFontRegular')};
  }

  dd {
    font-weight: ${themeVal('typography.baseFontBold')};
  }
`;

const SectionFigure = styled.figure`
  ${antialiased()}
  position: relative;
  order: -1;
  margin: 0 0 ${themeVal('layout.globalSpacing')} 0;
  color: #fff;
  font-size: 0.875rem;
  line-height: 1rem;
  font-weight: ${themeVal('typography.baseFontBold')};
`;

const SectionFigureLink = styled.a`
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding: ${themeVal('layout.globalSpacing')};
  min-height: 12rem;
  color: inherit;
`;

const SectionFigureThumb = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  margin: 0;
  border-radius: ${themeVal('shape.rounded')};
  overflow: hidden;
  background: ${themeVal('colors.baseAlphaColor')};

  > img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    z-index: 1;
    display: block;
  }

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    content: '';
    border-radius: ${themeVal('shape.rounded')};
    background:
      linear-gradient(
        -45deg,
        ${({ theme }) => rgba(theme.colors.baseColor, 0.32)} 0%,
        ${({ theme }) => rgba(theme.colors.baseColor, 0)} 100%
      );
    pointer-events: none;
  }
`;

const SectionFigcaption = styled.figcaption`
  position: relative;
  z-index: 3;
`;
