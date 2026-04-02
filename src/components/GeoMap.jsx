export default function GeoMap({ coords }) {
    if (!coords) return null;

    const { lat, lng } = coords;

    return (
        <iframe
            title="map"
            width="100%"
            height="250"
            style={{ border: 0, borderRadius: "10px" }}
            src={`https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=300&center=lonlat:${lng},${lat}&zoom=12&marker=lonlat:${lng},${lat};color:%23ff0000&apiKey=${import.meta.env.VITE_GEOAPIFY_KEY}`}
        ></iframe>
    );
}