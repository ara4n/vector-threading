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

import React from 'react';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import Event from './Event';

const eventSource = {
    canDrag(props, monitor) {
        return true;
    },

    beginDrag(props) {
        // Return the data describing the dragged item
        var item = {
            event: props.event,
            startWidth: props.startWidth,
        };

        console.log("event beginDrag for " + item.event.event_id);

        return item;
    },

    endDrag(props, monitor, component) {
        var item = monitor.getItem();

        console.log("event endDrag for " + item.event.event_id + " with didDrop=" + monitor.didDrop());
    },
};


var DraggableEvent = React.createClass({

    propTypes: {
        event: React.PropTypes.object.isRequired,
        // Injected by React DnD:
        isDragging: React.PropTypes.bool.isRequired,
        isOver: React.PropTypes.bool,
        connectDragSource: React.PropTypes.func,
        connectDragPreview: React.PropTypes.func,
    },

    componentDidMount() {
        // Use empty image as a drag preview so browsers don't draw it
        // and we can draw whatever we want on the custom drag layer instead.
        this.props.connectDragPreview(getEmptyImage(), {});
    },

    render() {
        var connectDragSource = this.props.connectDragSource;

//        console.log("rendering draggable event with isOver: " + this.props.isOver);

        var className = "draggableEvent";
        if (this.props.isDragging) {
            className = "draggableEvent vanish";
        }

        return connectDragSource((
            <div className={ className }>
                <Event event={ this.props.event }/>
            </div>
        ));
    }
});


export default DragSource("Event", eventSource, (connect, monitor) => ({
        // Call this function inside render()
        // to let React DnD handle the drag events:
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        // You can ask the monitor about the current drag state:
        isDragging: monitor.isDragging()
}))(DraggableEvent);
