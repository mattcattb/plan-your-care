import {useState, useRef} from "react";
import {useQuery} from "@tanstack/react-query";
import { getNearbyClinics, getAllClinics } from "../api/clinic";
import { Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { PlaceAutocompleteClassic } from "../components/PlaceAutocomplete";

const ClinicFinder = () => {
  const defaultCenter = { lat: 39.8283, lng: -98.5795 };
  const defaultZoomLevel = 4; // Define a constant for default zoom

  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(defaultZoomLevel); // Use defaultZoomLevel
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const [activeClinic, setActiveClinic] = useState(null);
  const [searchCenter, setSearchCenter] = useState(null);

  const mapRef = useRef(null);

  const {data: allClinics = [], isPending: clinicsPending, error: clinicsError} = useQuery({
    queryKey: ["clinics"],
    queryFn: getAllClinics,
  });
  const {data: nearClinics = [], isFetching: nearbyPending, error: nearbyError} = useQuery({
    queryKey: ["clinics", "nearby", searchCenter?.lat, searchCenter?.lng],
    queryFn: () => getNearbyClinics(searchCenter.lat, searchCenter.lng),
    enabled: Boolean(searchCenter),
  });

  const handlePlaceSelect = async (place) => {
    if (!place || !place.geometry) {
      setError("Selected place has no geometry.");
      return;
    }
    setError(null);
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setMapCenter({ lat, lng });
    setZoom(13); // Consistent zoom level for place selection and marker click

    setSearchCenter({lat, lng});
  };

  const handleMarkerClick = (clinic) => {
    setActiveClinic(clinic);
    setZoom(13); // Consistent zoom level
    setMapCenter({ lat: clinic.lat, lng: clinic.lng });
  };

  return (
    <div className="flex flex-col w-full items-center justify-start mt-11 px-4">
      <h2 className="text-5xl m-5 text-fuchsia-950 font-bold">Find Clinics Near You</h2>
      <div className="flex flex-col w-full max-w-[1200px] gap-7 justify-center">
        <PlaceAutocompleteClassic onPlaceSelect={handlePlaceSelect} />
        {error && <p style={{ color: "red" }}>{error}</p>}
        {(clinicsPending || nearbyPending) && <p>Loading clinics...</p>}
        {(clinicsError || nearbyError) && (
          <p className="text-red-900">Unable to load clinics: {(clinicsError || nearbyError).message}</p>
        )}

        <div>
          <Map
            style={{ width: "100%", height: "600px" }}
            center={mapCenter}
            zoom={zoom}
            // defaultCenter prop removed - using initial mapCenter state
            scrollwheel={true}
            defaultZoom={defaultZoomLevel} // Use defaultZoomLevel constant
            reuseMaps={true}
            onCenterChanged={(map) => setMapCenter(map.detail.center)} // Can destructure here if desired
            onZoomChanged={(map) => setZoom(map.detail.zoom)}       // Can destructure here if desired
            options={{
              gestureHandling: "greedy",
              draggable: true,
            }}
            ref={mapRef}
            mapId={"f581f64e2de5941c"}
          >
            {allClinics.map((clinic) => (
              <Marker
                key={clinic._id}
                position={{ lat: clinic.lat, lng: clinic.lng }}
                title={clinic.name}
                onClick={() => handleMarkerClick(clinic)}
              />
            ))}

            {activeClinic && (
              <InfoWindow
                position={{ lat: activeClinic.lat, lng: activeClinic.lng }}
                onCloseClick={() => setActiveClinic(null)}
              >
                <div>
                  <h3 className="text-black">{activeClinic.name}</h3>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>

        <div className="flex flex-col p-5 bg-gray-100 rounded-lg shadow-lg w-full h-auto overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4 text-black">Nearby Clinics</h3>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-center">
            {nearClinics.map((clinic) => (
              <li
                key={clinic._id}
                className="text-lg text-gray-800"
                onClick={() => handleMarkerClick(clinic)}
              >
                {clinic.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClinicFinder;
