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
import { SortablePane, Pane } from '../react-sortable-pane';

import Thread from './Thread';

var timelineJson = require("../../hq2.json");


export default React.createClass({

    getInitialState() {
        return {
            timeline: timelineJson,
            eventsById: {},
            threads: [], // root nodes of the various threads of events we're tracking
            className: null,
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
            this.moveEvent(event, parentIds);
            last_event = event;
        });
        this.setState({ eventsById: this.state.eventsById });
    },

    moveEvent(event, parentIds) {
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
                    this.setState({ threads: this.state.threads.concat(event) });
                    newThread = true;
                }
                else {
                    // find out how many children our parent has. if we're not the only one, we fork.
                    if (parent.children) {
                        if (!newThread) {
                            // create a new thread
                            this.setState({ threads: this.state.threads.concat(event) });
                            newThread = true;
                        }
                        parent.children.push(event);
                    }
                    else {
                        parent.children = [event];
                    }
                }
            });
        }
        else {
            // create a new thread
            this.setState({ threads: this.state.threads.concat(event) });
        }
    },

    getPanes() {
        var panes = this.state.threads.map((thread) => {
                                    return (
                                        <Pane
                                            id={ thread.event_id }
                                            key={ thread.event_id }
                                            width={ 400 }
                                            maxWidth={ 800 }
                                            minWidth={ 200 }
                                        >
                                            <Thread thread={ thread } />
                                        </Pane>
                                    );
                                });
        panes.push(
            <Pane
                id="gutter"
                key="gutter"
                width={ 400 }
                maxWidth={ 800 }
                minWidth={ 200 }
                className="gutter"
            >
                gutter
            </Pane>
        );
        return panes;
    },

    render() {
        return (
            <div className="scroll">
                <SortablePane
                    direction="horizontal"
                    disableEffect={ true }
                    margin={ 10 }
                    onResize={ this.onResize }
                    onResizeStart={ ()=>{ this.setState({ className: 'noselect' })}}
                    onResizeStop ={ ()=>{ this.setState({ className: undefined })}}
                    onDragStart=  { ()=>{ this.setState({ className: 'noselect' })}}
                    onDragEnd=    { ()=>{ this.setState({ className: undefined })}}
                    className={ this.state.className }
                    onOrderChange={ undefined }
                    order={ undefined }
                >
                    { this.getPanes() }
                </SortablePane>
            </div>
        );
    }
})
