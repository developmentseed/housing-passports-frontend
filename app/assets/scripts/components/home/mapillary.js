'use strict';
import React from 'react';
import { PropTypes as T } from 'prop-types';
import * as Mapillary from 'mapillary-js';
import styled, { withTheme } from 'styled-components';
import throttle from 'lodash.throttle';

import { mapillaryClientId, environment } from '../../config';
import { visuallyHidden } from '../../atomic-components/utils';
import { lighten } from 'polished';

import AbsoluteContainer from '../../atomic-components/absolute-container';

const MapillaryFigure = styled.figure`
  width: 100%;
  height: 100%;
  margin: 0;

  > figcaption {
    ${visuallyHidden()}
  }
`;

class MapillaryView extends React.PureComponent {
  constructor (props) {
    super(props);

    this.markersSetupDone = false;

    this.onBearingChangeDebounced = throttle(
      bearing => this.props.onBearingChange(bearing),
      250
    );
  }

  componentDidMount () {
    const mlyConfig = {
      component: {
        cover: false,
        marker: {
          visibleBBoxSize: 30
        }
      }
    };

    this.mly = new Mapillary.Viewer(
      'mapillary-container',
      mapillaryClientId,
      null,
      mlyConfig
    );

    const [lon, lat] = this.props.coordinates;
    this.mly.moveCloseTo(lat, lon);

    // Update coordinates when the user navigates.
    this.mly.on(Mapillary.Viewer.nodechanged, node =>
      this.props.onCoordinatesChange([
        node.originalLatLon.lon,
        node.originalLatLon.lat
      ])
    );

    // Update the bearing on rotation.
    this.mly.on(Mapillary.Viewer.bearingchanged, this.onBearingChangeDebounced);

    const getMarkerIdAtPoint = async point => {
      const marker = await this.mly.getComponent('marker').getMarkerIdAt(point);
      return marker ? parseInt(marker.split('-')[1]) : null;
    };

    // Highlight the marker on mouse move.
    this.mly.on('mousemove', async e => {
      const id = await getMarkerIdAtPoint(e.pixelPoint);
      if (id !== this.props.highlightMarkerId) this.props.onMarkerHover(id);
    });

    this.mly.on('click', async e => {
      const id = await getMarkerIdAtPoint(e.pixelPoint);
      if (id !== null && id !== this.props.selectedMarkerId) {
        this.props.onMarkerClick(id);
      }
    });

    this.setupMarkers(this.props);
  }

  componentDidUpdate (prevProps) {
    this.setupMarkers(this.props);

    // When the view changes or when a feature is selected / de-selected
    // resize the map.
    if (
      this.props.vizView !== prevProps.vizView ||
      prevProps.selectedMarkerId === null ||
      this.props.selectedMarkerId === null
    ) {
      this.mly.resize();
    }

    const markerComponent = this.mly.getComponent('marker');
    // Store the markers to update.
    // Since ids are numeric we can use an array.
    let markers = [];

    const hlMarker = this.props.highlightMarkerId;
    const prevHlMarker = prevProps.highlightMarkerId;
    const selMarker = this.props.selectedMarkerId;
    const prevSelMarker = prevProps.selectedMarkerId;

    // Highlight the marker.
    // De-highlight the previous one.
    if (hlMarker !== prevHlMarker) {
      const prevHlMarkerComp = markerComponent.get(`rooftop-${prevHlMarker}`);
      if (prevHlMarker !== null && prevHlMarkerComp) {
        markers[prevHlMarker] = {
          id: prevHlMarker,
          latLon: prevHlMarkerComp.latLon,
          type: prevHlMarker === selMarker ? 'selected' : 'normal'
        };
      }
      const hlMarkerComp = markerComponent.get(`rooftop-${hlMarker}`);
      if (hlMarker !== null && hlMarkerComp) {
        markers[hlMarker] = {
          id: hlMarker,
          latLon: hlMarkerComp.latLon,
          type: 'hover'
        };
      }
    }

    // Select the marker.
    // De-select the previous one.
    if (selMarker !== prevSelMarker) {
      const prevSelMarkerComp = markerComponent.get(`rooftop-${prevSelMarker}`);
      if (prevSelMarker !== null && prevSelMarkerComp) {
        markers[prevSelMarker] = {
          id: prevSelMarker,
          latLon: prevSelMarkerComp.latLon,
          type: 'normal'
        };
      }
      const selMarkerComp = markerComponent.get(`rooftop-${selMarker}`);
      if (selMarker !== null && selMarkerComp) {
        markers[selMarker] = {
          id: selMarker,
          latLon: selMarkerComp.latLon,
          type: 'selected'
        };
      }
    }

    if (markers.length) {
      markerComponent.add(
        markers
          .filter(Boolean)
          .map(m => this.createMarker(m.id, m.latLon, m.type))
      );
    }

    // Fly to location if centerKey was updated.
    // This key is used to trigger an update in certain situations.
    // This is only used when a new rooftop gets selected.
    if (
      this.props.rooftopCoords &&
      this.props.centerKey !== prevProps.centerKey
    ) {
      const [lon, lat] = this.props.rooftopCoords;
      this.mly.moveCloseTo(lat, lon);
    }
  }

  /**
   * Create a mapillary marker
   *
   * @param {number} id Marker numeric index
   * @param {object} coords Coordinates { lon, lat }
   * @param {boolean} hover Whether or not the marker is hovered.
   */
  createMarker (id, coords, type) {
    const { primaryColor, secondaryColor } = this.props.theme.colors;
    const markerColor =
      type === 'hover'
        ? lighten(0.2, primaryColor)
        : type === 'selected'
          ? primaryColor
          : secondaryColor;

    return new Mapillary.MarkerComponent.SimpleMarker(`rooftop-${id}`, coords, {
      interactive: true,
      color: markerColor
    });
  }

  setupMarkers (props) {
    const { rooftopCentroids } = props;
    if (this.markersSetupDone || !rooftopCentroids) return;

    const { highlightMarkerId, selectedMarkerId } = this.props;
    const markers = rooftopCentroids.map(element => {
      const [lon, lat] = element.c;
      return this.createMarker(
        element.i,
        { lon, lat },
        highlightMarkerId === element.i
          ? 'hover'
          : selectedMarkerId === element.i
            ? 'selected'
            : 'normal'
      );
    });

    const markerComponent = this.mly.getComponent('marker');
    markerComponent.add(markers);
    markerComponent.on('dragstart', () => {
      // To get a marker at the cursor position we need to use the
      // getMarkerIdAt method which only works if the marker is created
      // as interactive. However creating and interactive marker results in it
      // being draggable and there is no apparent way of preventing this
      // while keep the getMarkerIdAt method working.
      // This v works... Go figure.
      markerComponent.deactivate();
      markerComponent.activate();
    });

    this.markersSetupDone = true;
  }

  render () {
    return (
      <MapillaryFigure>
        <AbsoluteContainer id='mapillary-container' />
        <figcaption>Street view</figcaption>
      </MapillaryFigure>
    );
  }
}

export default withTheme(MapillaryView);

if (environment !== 'production') {
  MapillaryView.propTypes = {
    theme: T.object,
    vizView: T.string,
    coordinates: T.array,
    rooftopCoords: T.array,
    centerKey: T.number,
    onCoordinatesChange: T.func,
    onBearingChange: T.func,
    onMarkerHover: T.func,
    onMarkerClick: T.func,
    rooftopCentroids: T.array,
    highlightMarkerId: T.number,
    selectedMarkerId: T.number
  };
}
