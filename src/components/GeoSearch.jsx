import { useState } from "react";
import axios from "axios";

const API_KEY = "4d66aff39cf5402e89fc699c0a0e0902";

export default function GeoSearch({ setLocation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchLocation = async (value) => {
    setQuery(value);

    if (value.length < 3) return;

    const res = await axios.get(
      `https://api.geoapify.com/v1/geocode/autocomplete`,
      {
        params: {
          text: value,
          apiKey: API_KEY,
        },
      }
    );

    setResults(res.data.features);
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => searchLocation(e.target.value)}
        placeholder="Search project location..."
        className="input-field"
      />

      {results.length > 0 && (
        <div className="absolute bg-white border w-full mt-1 rounded shadow z-10">
          {results.map((item, i) => (
            <div
              key={i}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setQuery(item.properties.formatted);
                setResults([]);

                setLocation({
                  address: item.properties.formatted,
                  lat: item.properties.lat,
                  lng: item.properties.lon,
                });
              }}
            >
              {item.properties.formatted}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}