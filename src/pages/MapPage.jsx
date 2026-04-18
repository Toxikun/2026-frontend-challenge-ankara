import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSurveillanceData } from '../hooks/useSurveillanceData';
import RawDataModal from '../components/RawDataModal';

// Fix Leaflet's default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create a custom red icon for post-disappearance events
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Center of Ankara
const ANKARA_CENTER = [39.9208, 32.8541];

// Deterministic pseudo-random number generator string -> float between 0 and 1
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    const result = (Math.sin(hash) + 1) / 2;
    return result;
};

// Generate deterministic coordinates near Ankara based on location name
const getCoordsForLocation = (locationName) => {
    if (!locationName || locationName === 'Unknown') return null;

    // Spread markers around Ankara center dynamically based on string hash
    const latOffset = (hashString(locationName + "lat") - 0.5) * 0.05;
    const lngOffset = (hashString(locationName + "lng") - 0.5) * 0.05;

    return [ANKARA_CENTER[0] + latOffset, ANKARA_CENTER[1] + lngOffset];
};

const DISAPPEARANCE_TIME = '21:11';

// Helper to compare times "HH:MM"
const isPostDisappearance = (eventTime) => {
    if (!eventTime) return false;
    const timeVal = eventTime.split(' ')[1] || eventTime;
    return timeVal > DISAPPEARANCE_TIME;
};

const MapPage = () => {
    const { events, loading } = useSurveillanceData();
    const [selectedRawData, setSelectedRawData] = useState(null);

    // Filter events with valid locations and assign coordinates
    const mappedEvents = useMemo(() => {
        const withCoords = events
            .filter(e => e.location && e.location !== 'Unknown')
            .map(e => ({
                ...e,
                coords: getCoordsForLocation(e.location)
            }))
            .filter(e => e.coords !== null);

        // Group slightly overlapped coordinates (jitter) if multiple events are exactly in the same place
        const coordCounts = {};
        return withCoords.map((e, index) => {
            const coordKey = `${e.coords[0]}_${e.coords[1]}`;
            if (!coordCounts[coordKey]) coordCounts[coordKey] = 0;
            const offset = (coordCounts[coordKey] * 0.0001); // slight offset for overlapping items
            coordCounts[coordKey]++;

            return {
                ...e,
                displayCoords: [e.coords[0] + offset, e.coords[1] + offset]
            };
        });
    }, [events]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin text-blue-500 rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
            <header className="flex-none">
                <h1 className="text-3xl font-bold text-white tracking-tight">Geospatial Analysis</h1>
                <p className="text-slate-400 mt-2">Interactive map of all logged events and activities. Red markers indicate post-disappearance events.</p>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex-1 relative isolate">
                {/* z-0 ensures map doesn't overlap sidebar dropdowns */}
                <div className="absolute inset-0 z-0">
                    <MapContainer
                        center={ANKARA_CENTER}
                        zoom={13}
                        style={{ height: '100%', width: '100%', background: '#0f172a' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        />

                        {mappedEvents.map((event) => {
                            const isLate = isPostDisappearance(event.timestamp);
                            return (
                                <Marker
                                    key={event.id}
                                    position={event.displayCoords}
                                    icon={isLate ? redIcon : new L.Icon.Default()}
                                >
                                    <Popup className="custom-popup">
                                        <div className="p-1 space-y-3 min-w-[200px]">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isLate ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500'}`}>
                                                        {event.timestamp.split(' ')[1] || event.timestamp}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase text-slate-500">
                                                        {event.type}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-slate-800 text-base">{event.location}</h3>
                                            </div>

                                            <div className="bg-slate-100 rounded-lg p-2">
                                                <p className="text-sm text-slate-600">
                                                    <span className="font-semibold text-slate-900">Involved:</span> {event.involvedParty}
                                                </p>
                                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                    <span className="font-semibold text-slate-900">Details:</span> {event.summary}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => setSelectedRawData(event.raw)}
                                                className="w-full text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                                View Raw JSON
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>

            {selectedRawData && (
                <RawDataModal
                    isOpen={!!selectedRawData}
                    data={selectedRawData}
                    title="Map Location Data"
                    onClose={() => setSelectedRawData(null)}
                />
            )}
        </div>
    );
};

export default MapPage;
