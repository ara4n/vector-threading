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

import Event from './Event';

export default React.createClass({

    propTypes: {
        thread: React.PropTypes.object.isRequired, // root event of the thread being displayed
    },

    getThread() {
        var event = this.props.thread;
        var events = [event];
        // left-recurse down the thread graph
        while (event.children) {
            event = event.children[0];
            events.push(event);
        }
        return events;
    },

    render() {
        return (
            <div className="thread">
                { this.getThread().map((event) => {
                    return <Event key={ event.event_id } event={ event }/>;
                  })
                }
            </div>
        );
    }
})