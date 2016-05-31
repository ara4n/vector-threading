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
import { DropTarget } from 'react-dnd';

import DraggableEvent from './DraggableEvent';


const threadTarget = {
    canDrop() {
        return true;
    },

    drop(props, monitor, component) {
        console.log("dropped on thread");

        var item = monitor.getItem();
        props.forkThread(item.event);
    },

    hover(props, monitor, component) {
        var item = monitor.getItem();
    },
};


var ThreadPane = React.createClass({

    propTypes: {
        thread: React.PropTypes.object, // the thread being displayed
        parent: React.PropTypes.object, // parent thread component
        connectDropTarget: React.PropTypes.func.isRequired,
        isOver: React.PropTypes.bool,
    },

    getEvents() {
        var thread = this.props.thread;
        if (!thread) return [];
        var event = thread.event;
        var events = [ event ];

        // left-recurse down the thread graph
        while (event.children && event.children[0]) {
            event = event.children[0];
            events.push(event);
        }
        return events;
    },

    render() {
        var connectDropTarget = this.props.connectDropTarget;

        var thread = this.props.thread;
        var top = 0;
        // if (thread) {
        //     console.log("rendering pane with thread = " + thread + " and parent " + thread.parent);
        // }
        if (thread && thread.parent) {
            var dims = this.props.getDimsOfEventInThread(thread.parent, thread.event.parents[0].event_id);
            if (dims) {
                top = dims.top + dims.height;
                console.log("calculate new top as " + top);
            }
        }

        return connectDropTarget(
            <div className="thread" style={{ top: `${ top }px` }}>
                { this.getEvents().map((event) => {
                    return <DraggableEvent ref={ event.event_id } key={ event.event_id } event={ event } startWidth={ this.props.width }/>;
                  })
                }
            </div>
        );
    }
});

export default DropTarget("Event", threadTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    connectIsOver: monitor.isOver(),
}))(ThreadPane);
