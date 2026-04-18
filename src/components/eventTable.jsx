import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventTable = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <div>
            <div>
                <h2>Podo Investigation Log</h2>
                <div>
                    <span>
                        Total Events: {events.length}
                    </span>
                </div>
            </div>

            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Summary</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td>
                                    No data available. Waiting for transmission...
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.id}>
                                    {/* Data rows will go here */}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventTable;
