/*
Copyright 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { PropTypes } from 'react';
import { DragLayer } from 'react-dnd';

import Event from './Event';

const layerStyles = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 100,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%'
};

function getItemStyles(props, initialWindowScrollY) {
    const { initialOffset, currentOffset } = props;
    if (!initialOffset || !currentOffset) {
        return {
            display: 'none'
        };
    }

    let { x, y } = currentOffset;
    y = initialOffset.y + initialWindowScrollY - window.scrollY;

    const transform = `translate(${x}px, ${y}px)`;
    return {
        position: 'relative',
        transform: transform,
        WebkitTransform: transform,
    };
}


var EventDragLayer = React.createClass({

    propTypes: {
        // Injected by React DnD:
        item: PropTypes.object,
        itemType: PropTypes.string,
        initialOffset: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }),
        currentOffset: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }),
        isDragging: PropTypes.bool.isRequired,
    },

    handleScroll: function(e) {
        this.forceUpdate();
    },

    componentDidMount: function() {
        window.addEventListener('scroll', this.handleScroll);
    },

    componentWillUnmount: function() {
        window.removeEventListener('scroll', this.handleScroll);
    },

    render() {
        const { item, itemType, isDragging } = this.props;

        if (!isDragging) {
            this.isDragging = false;
            return null;
        }
        else {
            if (!this.isDragging) {
                this.initialWindowScrollY = window.scrollY;
                this.isDragging = true;
            }
        }

        var itemStyles = getItemStyles(this.props, this.initialWindowScrollY);
        if (item.startWidth) {
            itemStyles['width'] = item.startWidth;
        }

        // FIXME: events should handle drawing their links, not the drag layer
        var connector;
        if (item.event.thread) {
            var dims = this.props.getDimsOfEventInThread(item.event.thread, item.event.parents[0].event_id);
            if (dims && (this.props.currentOffset.x - this.props.initialOffset.x) > dims.width) {
                var style = {
                    width: (this.props.currentOffset.x - this.props.initialOffset.x - dims.left - dims.width) + "px",
                    height: (dims.height * 2) + "px",
                    right: dims.width + "px",
                    bottom: "0px",
                };
                connector = <img className="connector" src="img/connector.svg" style={style}/>
            }
        }

        return (
            <div style={layerStyles}>
                <div style={ itemStyles }>
                    { connector }
                    <Event event={item.event} />
                </div>
            </div>
        );
    }
});


export default DragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
}))(EventDragLayer);
