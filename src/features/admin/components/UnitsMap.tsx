import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface Unit {
    id: string;
    name: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
}

interface UnitsMapProps {
    units: Unit[];
}

const UnitsMap: React.FC<UnitsMapProps> = ({ units }) => {
    // Center of Brazil
    const center: [number, number] = [-14.235, -51.9253];
    const zoom = 4;

    const validUnits = units.filter(u => u.latitude !== null && u.longitude !== null);

    return (
        <div className="h-full w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', background: '#0A192F' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {validUnits.map((unit) => (
                    <Marker
                        key={unit.id}
                        position={[unit.latitude!, unit.longitude!]}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-navy-deep">{unit.name}</h3>
                                <p className="text-xs text-navy-deep/60">{unit.location}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default UnitsMap;
