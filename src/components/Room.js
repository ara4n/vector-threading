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
import { DragDropContext } from 'react-dnd';
import EventDragLayer from './EventDragLayer';
import HTML5Backend from 'react-dnd-html5-backend';
import { SortablePane, Pane } from '../react-sortable-pane';

import ThreadPane from './ThreadPane';

var timelineJson = require("../../hq2.json");


// pure model class for a thread of events.
class Thread {
    constructor(event, parent, top, bottom) {
        this.event = event;
        this.parent = parent;
        this.top = top;
        this.bottom = bottom;
    }
}

export default DragDropContext(HTML5Backend)(React.createClass({

    getInitialState() {
        return {
            timeline: timelineJson,
            eventsById: {},
            threads: [], // root nodes of the various threads of events we're tracking
            className: null,
            paneSizes: {},
        }
    },

    componentDidMount() {
        // walk the in-reply-to DAG and turn it into separate threads
        var last_event = {};
        this.state.timeline.chunk.forEach((event)=>{
            this.state.eventsById[event.event_id] = event;

            // no explicit in_reply_to header is interpreted as following the previous event
            var parentIds = event.in_reply_to || last_event.event_id;
            if (parentIds && parentIds.constructor !== Array) parentIds = [ parentIds ];
            this.moveEvent(event, parentIds, false);
            last_event = event;
        });
        this.setState({ eventsById: this.state.eventsById });
    },

    // moves an event to be the oldest or youngest child of its new parents
    moveEvent(event, parentIds, oldest) {
        // remove ourselves from our previous parents if any
        if (event.parents) {
            event.parents.forEach((parent) => {
                parent.children = parent.children.filter((child) => {
                    child.event_id !== event.event_id
                })
            });
        }
        // TODO: if we were the only event in our last thread, delete the thread?
        // TODO: if we now only have one parent, de-thread ourselves, delete the thread?

        event.parents = [];

        var newThread = false; // are we creating a new thread?
        if (parentIds) {
            parentIds.forEach((parentId) => {
                var parent = this.state.eventsById[parentId];
                event.parents.push(parent);
                if (!parent && !newThread) {
                    // create a new thread
                    var thread = new Thread(event, event.thread);
                    event.thread = thread;
                    this.setState({ threads: this.state.threads.concat(thread) });
                    newThread = true;
                }
                else {
                    // find out how many children our parent has. if we're not the only one, we fork.
                    if (parent.children) {
                        if (!newThread) {
                            // create a new thread
                            var thread = new Thread(event, event.thread);
                            event.thread = thread;
                            this.setState({ threads: this.state.threads.concat(thread) });
                            newThread = true;
                        }
                        if (oldest) {
                            parent.children.unshift(event);
                        }
                        else {
                            parent.children.push(event);
                        }
                    }
                    else {
                        parent.children = [event];
                    }
                }
            });
        }
        else {
            // create a new thread
            var thread = new Thread(event, event.thread);
            event.thread = thread;
            this.setState({ threads: this.state.threads.concat(thread) });
        }
    },

    forkThread(event) {
        // makes the child of this event its older sibling instead, thus making the child branch off into its own thread.
        // in future it could also upgrade the Thread that this event is in to being a real Thread rather than a gutter somehow.

        event.children.forEach(child=>{
            this.moveEvent(child, event.parents, true);
        });
        // having moved our children to be older siblings, remove them.
        event.children = [];
    },

    onResize(r) {
        var paneSizes = this.state.paneSizes;
        paneSizes[r.id] = { size: r.size };
        this.setState({ paneSizes: paneSizes });
    },

    getBottomOfEventInThread(thread, event_id) {
        // evil usage of refs to inspect children.
        // is this really better than plain old getElementById?
        var component = this.refs[thread.event.event_id];
        if (!component) {
            console.warn("no such thread " + thread.event.event_id);
            return;
        }
        var eventElement = component.refs[event_id];
        if (!eventElement) {
            console.warn("no such event " + event_id);
            return;
        }
        return eventElement.offsetTop() + eventElement.offsetHeight();
    },

    getPanes() {
        var panes = this.state.threads.map((thread) => {
                                    var event_id = thread.event.event_id;
                                    return (
                                        <Pane
                                            id={ event_id }
                                            key={ event_id }
                                            width={ 400 }
                                            maxWidth={ 800 }
                                            minWidth={ 200 }
                                        >
                                            <ThreadPane
                                                ref={ event_id }
                                                thread={ thread }
                                                getBottomOfEventInThread= { this.getBottomOfEventInThread }
                                                width={ this.state.paneSizes[event_id] ? this.state.paneSizes[event_id].size.width : 400 } />
                                        </Pane>
                                    );
                                });
        panes.push(
            <Pane
                id="gutter"
                key="gutter"
                width={ 200 }
                maxWidth={ 800 }
                minWidth={ 200 }
                height={ 1000 }
                className="gutter"
            >
                <ThreadPane
                    thread={ null }
                    forkThread={ this.forkThread }
                    width={ this.state.paneSizes['gutter'] ? this.state.paneSizes['gutter'].size.width : 200 }
                />
            </Pane>
        );
        return panes;
    },

    render() {
        return (
            <div className="scroll">
                <EventDragLayer/>
                <SortablePane
                    direction="horizontal"
                    disableEffect={ true }
                    margin={ 10 }
                    onResize={ this.onResize }
                    onResizeStart={ ()=>{ this.setState({ className: 'noselect' })}}
                    onResizeStop ={ ()=>{ this.setState({ className: undefined })}}
                    onDragStart=  { ()=>{ this.setState({ className: 'noselect' })}}
                    onDragEnd=    { ()=>{ this.setState({ className: undefined })}}
                    isSortable={ false }
                    isResizable={{ x: true, y: false, xy: false }}
                    className={ this.state.className }
                    onOrderChange={ undefined }
                    order={ undefined }
                >
                    { this.getPanes() }
                </SortablePane>
            </div>
        );
    }
}));
