import React from 'react';
import MarkerClusterer from './MarkerClusterer';
import defaultMapConfiguration from './defaultMapConfiguration';
import marker from './marker';
import hotelInfoHtml from './hotelInfoHtml';

/* global global */

const UNIT_TESTING = (typeof global.describe === 'function');

function newInfoWindow(hotel) {
    const maps = global.window.google.maps;

    return new maps.InfoWindow({content: hotelInfoHtml(hotel)});
}

export default React.createClass({
    propTypes: {hotels: React.PropTypes.array.isRequired},

    render() {
        return <div className='hotels-on-map'></div>;
    },

    componentDidMount() {
        if (UNIT_TESTING) {
            return;
        }

        this.initMap();
    },

    resetMap() {
        const element = this.getDOMNode();

        element.removeChild(element.querySelector('.gm-style'));
        this.map = null;
        this.initMap();
    },

    initMap() {
        const maps = global.window.google.maps;

        this.map = new maps.Map(this.getDOMNode(), defaultMapConfiguration());
        this.displayMarkers();
    },

    displayMarkers() {
        const markers = this.markers();

        if (markers.length === 1) {
            this.applyOneHotelConfiguration(markers);
        } else {
            const clusterer = new MarkerClusterer(this.map, markers, {gridSize: 30});

            clusterer.fitMapToMarkers(this.map, markers);
        }
    },

    markers() {
        return this.props.hotels.map(hotel => {
            const result = marker(hotel.geolocation);

            result.addListener('click', () => {
                newInfoWindow(hotel).open(this.map, result);
            });

            return result;
        });
    },

    applyOneHotelConfiguration(markers) {
        const maps = global.window.google.maps;
        const {geolocation: {latitude, longitude}} = this.props.hotels[0];

        this.map.setCenter({lat: latitude, lng: longitude});
        this.map.setZoom(13);

        markers[0].setMap(this.map);
        maps.event.trigger(markers[0], 'click');
    }
});
