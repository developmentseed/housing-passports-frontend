'use strict';
import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import mapboxgl from 'mapbox-gl';

import { mbtoken, environment } from '../config';
import { visuallyHidden } from '../atomic-components/utils';
import mapboxStyle from '../vendor/mapbox';
import AbsoluteContainer from '../atomic-components/absolute-container';

// set once
mapboxgl.accessToken = mbtoken;

const MapboxStyle = createGlobalStyle` ${mapboxStyle()} `;

const MapboxFigure = styled.figure`
  width: 100%;
  height: 100%;
  margin: 0;

  > figcaption {
    ${visuallyHidden()}
  }
`;

export default class MapboxView extends React.Component {
  // constructor (props) {
  //   super(props);

  //   this.popoverRenderer = this.popoverRenderer.bind(this);
  // }

  componentDidMount () {
    this.initMap();
  }

  componentDidUpdate (prevProps) {
  }

  initMap () {
    this.map = new mapboxgl.Map({
      center: [0, 0],
      container: this.refs.mapEl,
      style: 'mapbox://styles/mapbox/light-v9',
      zoom: 2,
      pitchWithRotate: false,
      renderWorldCopies: false,
      dragRotate: false,
      logoPosition: 'bottom-right'
    });

    // Disable map rotation using right click + drag.
    this.map.dragRotate.disable();

    // Disable map rotation using touch rotation gesture.
    this.map.touchZoomRotate.disableRotation();

    // Disable scroll zoom
    this.map.scrollZoom.disable();

    // Add zoom controls.
    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

    // Remove compass.
    document.querySelector('.mapboxgl-ctrl .mapboxgl-ctrl-compass').remove();

    this.map.on('load', () => {
      this.mapLoaded = true;
      this.initMapStyle(this.props);
    });
  }

  initMapStyle (props) {
    // if (!this.mapLoaded) {
    //   return;
    // }
  }

  // onPopoverCloseClick (e) {
  //   e.preventDefault();
  //   MBPopover.hide();
  // }

  // popoverRenderer ({ geoIso }) {
  //   return (
  //     <MapPopoverContent
  //       onCloseClick={this.onPopoverCloseClick}
  //     />
  //   );
  // }

  render () {
    return (
      <MapboxFigure>
        <MapboxStyle />
        <AbsoluteContainer ref='mapEl' />
        <figcaption>Map</figcaption>
      </MapboxFigure>
    );
  }
}

if (environment !== 'production') {
  MapboxView.propTypes = {
  };
}
