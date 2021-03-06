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

export default React.createClass({

    propTypes: {
        event: React.PropTypes.object.isRequired,
    },

    render() {
        return (
            <div className="event">
                <div className="event_Sender">{ this.props.event.sender }</div>
                <div className="event_Body">{ this.props.event.content.body }</div>
            </div>
        );
    }
});
