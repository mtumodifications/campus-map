import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";

import roomData from "../data/corkRooms";
import buildingData from "../data/corkBuildings";
import parkingData from "../data/corkParking";
import stairsData from "../data/corkStairs";

import "./map.css";

type Floor = "G" | "1" | "2";

const FLOOR_NAMES: Record<Floor, string> = {
    G: "Ground Floor",
    "1": "1st Floor",
    "2": "2nd Floor",
};

const ROOM_ZOOM_LEVEL = 18;
const ROOM_LABEL_ZOOM = 19;
const BUILDING_LABEL_ZOOM = 17;

export function CampusMap() {
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        let map: Leaflet.Map | undefined;
        let cancelled = false;

        async function initializeMap() {
            const [{ default: L }, turf] = await Promise.all([
                import("leaflet"),
                import("@turf/turf"),
            ]);

            if (cancelled || !mapRef.current) {
                return;
            }

            const leafletMap = L.map(mapRef.current, {
                zoomControl: false,
            });

            map = leafletMap;

            L.control
                .zoom({
                    position: "bottomright",
                })
                .addTo(leafletMap);

            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    maxZoom: 20,
                    maxNativeZoom: 19,
                    attribution: "© OpenStreetMap contributors",
                }
            ).addTo(leafletMap);

            const floorLayers: Record<Floor, L.GeoJSON> = {
                G: L.geoJSON([], {
                    style: styleRoom,
                    onEachFeature: onEachRoom,
                }),

                "1": L.geoJSON([], {
                    style: styleRoom,
                    onEachFeature: onEachRoom,
                }),

                "2": L.geoJSON([], {
                    style: styleRoom,
                    onEachFeature: onEachRoom,
                }),
            };

            const stairsLayers: Record<Floor, L.GeoJSON> = {
                G: L.geoJSON([], {
                    style: styleStairs,
                    onEachFeature: onEachStair,
                }),

                "1": L.geoJSON([], {
                    style: styleStairs,
                    onEachFeature: onEachStair,
                }),

                "2": L.geoJSON([], {
                    style: styleStairs,
                    onEachFeature: onEachStair,
                }),
            };

            let selectedRoomLayer: L.Path | null = null;
            let currentFloor: Floor = "G";

            /*
             * ------------------------------------------------------------
             * Helpers
             * ------------------------------------------------------------
             */

            function styleRoom(): L.PathOptions {
                return {
                    fillColor: "#E5F4F8",
                    weight: 0.8,
                    opacity: 1,
                    color: "#367FA3",
                    fillOpacity: 0.85,
                };
            }

            function styleSelectedRoom(): L.PathOptions {
                return {
                    fillColor: "#BFE3EE",
                    weight: 2.5,
                    color: "#164E73",
                    fillOpacity: 0.95,
                };
            }

            function styleStairs(): L.PathOptions {
                return {
                    fillColor: "#E5F4F8",
                    weight: 0.8,
                    opacity: 1,
                    color: "#367FA3",
                    fillOpacity: 0.85,
                };
            }

            function styleBuilding(): L.PathOptions {
                return {
                    fillColor: "#E13951",
                    weight: 1.2,
                    opacity: 1,
                    color: "#164E73",
                    fillOpacity: 1,
                };
            }

            function styleParkingZone(
                feature?: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
            ): L.PathOptions {
                const properties = feature?.properties ?? {};

                const isReserved = properties.Is_Reserved === true;
                const isBikeOnly = properties.Is_Bike_Only === true;

                return {
                    fillColor: isReserved
                        ? "#D96A7A"
                        : isBikeOnly
                            ? "#245A82"
                            : "#A8D9E8",
                    weight: 0.8,
                    opacity: 1,
                    color: isReserved
                        ? "#B83F54"
                        : isBikeOnly
                            ? "#164E73"
                            : "#367FA3",
                    fillOpacity: isBikeOnly ? 0.9 : 0.4,
                    dashArray: "5, 5",
                };
            }

            function getTopCenterOfPolygon(
                feature: GeoJSON.Feature
            ): [number, number] {
                const bbox = turf.bbox(feature);

                const west = bbox[0];
                const north = bbox[3];
                const east = bbox[2];

                return [
                    (west + east) / 2,
                    north,
                ];
            }

            function pointInside(
                feature: GeoJSON.Feature
            ): Leaflet.LatLng {
                const point = turf.pointOnFeature(feature);

                const [lng, lat] = point.geometry.coordinates;

                return L.latLng(lat, lng);
            }

            /*
             * ------------------------------------------------------------
             * Room labels
             * ------------------------------------------------------------
             */

            function createRoomNumberLabel(
                feature: GeoJSON.Feature
            ) {
                const properties = feature.properties ?? {};

                if (
                    !properties.Room_Number ||
                    properties.Room_Number === "N/A"
                ) {
                    return null;
                }

                const position = pointInside(feature);

                return L.marker(position, {
                    icon: L.divIcon({
                        className: "room-number-label-wrapper",

                        html: `
            <div class="room-number-label">
              ${properties.Room_Number}
            </div>
          `,

                        iconSize: [0, 0],
                        iconAnchor: [0, 0],
                    }),

                    interactive: true,
                });
            }

            /*
             * ------------------------------------------------------------
             * Room popup
             * ------------------------------------------------------------
             */

            function createRoomPopup(
                properties: Record<string, any>
            ) {
                const roomNumber =
                    properties.Room_Number ??
                    properties.Room_Name;

                const floor =
                    FLOOR_NAMES[properties.Level as Floor] ??
                    `Floor ${properties.Level ?? "N/A"}`;

                const hasRoomNumber =
                    properties.Room_Number &&
                    properties.Room_Number !== "N/A";

                return `
        <div class="room-popup">

          <div class="room-popup-header">
            <div class="room-popup-number">
              ${roomNumber}
            </div>
          </div>

          <div class="room-popup-body">

            ${hasRoomNumber
                        ? `
                  <div class="room-popup-label">
                    ROOM
                  </div>

                  <div class="room-popup-name">
                    ${properties.Room_Name ?? "Unnamed Room"}
                  </div>
                `
                        : ""
                    }

            <div class="room-popup-info">

              ${hasRoomNumber
                        ? `
                    <div class="room-popup-info-item">
                      <span class="room-popup-icon">🏢</span>

                      <div>
                        <div class="room-popup-info-label">
                          Room Number
                        </div>

                        <div class="room-popup-info-value">
                          ${properties.Room_Number}
                        </div>
                      </div>
                    </div>
                  `
                        : ""
                    }

              <div class="room-popup-info-item">
                <span class="room-popup-icon">📍</span>

                <div>
                  <div class="room-popup-info-label">
                    Floor
                  </div>

                  <div class="room-popup-info-value">
                    ${floor}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      `;
            }

            /*
             * ------------------------------------------------------------
             * Rooms
             * ------------------------------------------------------------
             */

            function onEachRoom(
                feature: GeoJSON.Feature,
                layer: L.Layer
            ) {
                const properties = feature.properties ?? {};

                if (properties.Room_Name === "VOID") {
                    return;
                }

                const roomLayer = layer as L.Path & {
                    roomNumberLabel?: L.Marker;
                };

                const roomLabel =
                    createRoomNumberLabel(feature);

                if (roomLabel) {
                    roomLayer.roomNumberLabel = roomLabel;
                }

                const popupPosition =
                    getTopCenterOfPolygon(feature);

                roomLayer.bindPopup(
                    createRoomPopup(properties),
                    {
                        maxWidth: 320,
                        minWidth: 280,
                        className: "custom-room-popup",
                        autoPan: true,
                    }
                );

                roomLayer.on("click", () => {
                    if (selectedRoomLayer && selectedRoomLayer !== roomLayer) {
                        selectedRoomLayer.setStyle(styleRoom());
                    }

                    selectedRoomLayer = roomLayer;

                    roomLayer.setStyle(styleSelectedRoom());

                    roomLayer.bringToFront();

                    roomLayer.openPopup(
                        L.latLng(
                            popupPosition[1],
                            popupPosition[0]
                        )
                    );
                });
            }

            /*
             * ------------------------------------------------------------
             * Stairs
             * ------------------------------------------------------------
             */

            function onEachStair(
                feature: GeoJSON.Feature,
                layer: L.Layer
            ) {
                const position = pointInside(feature);

                const stairLayer = layer as L.Path & {
                    stairsIcon?: L.Marker;
                };

                const stairsIcon = L.marker(position, {
                    icon: L.divIcon({
                        className: "stairs-icon-wrapper",

                        html: `
            <div class="stairs-icon">
              <svg
                width="18"
                height="18"
                fill="#164E73"
                viewBox="0 0 512.004 512.004"
              >
                <g>
                  <g>
                    <g>
                      <polygon points="
                        364.957,107.108
                        364.957,141.969
                        380.014,141.969
                        380.014,203.974
                        268.09,203.974
                        268.09,238.835
                        283.148,238.835
                        283.148,300.841
                        171.223,300.841
                        171.223,335.703
                        186.282,335.703
                        186.282,397.708
                        74.356,397.708
                        74.356,432.569
                        89.415,432.569
                        89.415,512.004
                        124.276,512.004
                        124.276,432.569
                        221.143,432.569
                        221.143,335.703
                        318.009,335.703
                        318.009,238.835
                        414.876,238.835
                        414.876,141.969
                        494.312,141.969
                        494.312,107.108
                      "/>

                      <rect
                        x="-36.523"
                        y="155.536"
                        transform="
                          matrix(
                            0.7071 -0.7071
                            0.7071 0.7071
                            -66.4634 185.4769
                          )
                        "
                        width="454.363"
                        height="34.861"
                      />
                    </g>
                  </g>
                </g>
              </svg>
            </div>
          `,

                        iconSize: [0, 0],
                        iconAnchor: [0, 0],
                    }),

                    interactive: false,
                });

                stairLayer.stairsIcon = stairsIcon;
            }

            /*
             * ------------------------------------------------------------
             * Parking
             * ------------------------------------------------------------
             */

            function onEachParkingZone(
                feature: GeoJSON.Feature,
                layer: L.Layer
            ) {
                const properties = feature.properties ?? {};

                const position = pointInside(feature);

                const parkingLayer = layer as L.Path & {
                    parkingIcon?: L.Marker;
                };

                let icon: string | null = null;

                if (properties.Is_Bike_Only) {
                    icon = "🚲";
                } else if (properties.Is_Reserved) {
                    icon = "🚫";
                }

                if (icon) {
                    parkingLayer.parkingIcon =
                        L.marker(position, {
                            icon: L.divIcon({
                                className:
                                    "parking-space-icon-wrapper",

                                html: `
                <div class="parking-space-icon">
                  ${icon}
                </div>
              `,

                                iconSize: [0, 0],
                                iconAnchor: [0, 0],
                            }),

                            interactive: false,
                        });
                }

                const yesNo = (value: unknown) =>
                    value ? "Yes" : "No";

                if (properties.Is_Bike_Only) {
                    layer.bindPopup(`
          <div style="min-width: 250px;">
            <h3 style="margin: 0 0 10px 0;">
              ${properties.Parking_Space_Name}
            </h3>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td><strong>Bike Only</strong></td>
                <td>${yesNo(properties.Is_Bike_Only)}</td>
              </tr>
            </table>
          </div>
        `);
                } else if (properties.Parking_Space_Name) {
                    layer.bindPopup(`
          <div style="min-width: 250px;">
            <h3 style="margin: 0 0 10px 0;">
              ${properties.Parking_Space_Name}
            </h3>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td><strong>Full Capacity</strong></td>
                <td>${properties.Full_Capacity ?? "N/A"}</td>
              </tr>

              <tr>
                <td><strong>Disabled Capacity</strong></td>
                <td>${properties.Disabled_Capacity ?? "N/A"}</td>
              </tr>

              <tr>
                <td><strong>Paid Parking</strong></td>
                <td>${yesNo(properties.Is_Paid)}</td>
              </tr>

              <tr>
                <td><strong>Reserved</strong></td>
                <td>${yesNo(properties.Is_Reserved)}</td>
              </tr>

              <tr>
                <td><strong>Disability Friendly</strong></td>
                <td>${yesNo(properties.Is_Disability_Friendly)}</td>
              </tr>

              <tr>
                <td><strong>Bike Only</strong></td>
                <td>${yesNo(properties.Is_Bike_Only)}</td>
              </tr>

              <tr>
                <td><strong>Visitor Parking</strong></td>
                <td>${yesNo(properties.Is_Visitor_Parking)}</td>
              </tr>

              <tr>
                <td><strong>Barrier</strong></td>
                <td>${yesNo(properties.Has_Barrier)}</td>
              </tr>
            </table>
          </div>
        `);
                }
            }

            /*
             * ------------------------------------------------------------
             * Buildings
             * ------------------------------------------------------------
             */

            const buildingLayer =
                L.geoJSON(buildingData as any, {
                    style: styleBuilding,

                    onEachFeature(feature, layer) {
                        const properties =
                            feature.properties ?? {};

                        const sectionName =
                            properties.Section_Name;

                        const description =
                            properties.Description;

                        if (!sectionName) {
                            return;
                        }

                        const position =
                            pointInside(feature);

                        const popupContent = `
            <div class="room-popup">

              <div class="room-popup-header">
                <div class="room-popup-number">
                  ${sectionName}
                </div>
              </div>

              <div class="room-popup-body">

                <div class="room-popup-label">
                  BUILDING
                </div>

                <div class="room-popup-name">
                  ${sectionName}
                </div>

                ${description
                                ? `
                      <div class="room-popup-info">
                        <div class="room-popup-info-item">

                          <span class="room-popup-icon">
                            📖
                          </span>

                          <div>
                            <div class="room-popup-info-label">
                              Description
                            </div>

                            <div class="room-popup-info-value">
                              ${description}
                            </div>
                          </div>

                        </div>
                      </div>
                    `
                                : ""
                            }

              </div>
            </div>
          `;

                        const label =
                            L.marker(position, {
                                icon: L.divIcon({
                                    className:
                                        "section-label-wrapper",

                                    html: `
                  <div class="section-label">
                    ${sectionName}
                  </div>
                `,

                                    iconSize: [0, 0],
                                    iconAnchor: [0, 0],
                                }),

                                interactive: true,
                            });

                        label.bindPopup(
                            popupContent,
                            {
                                maxWidth: 320,
                                minWidth: 280,
                                className:
                                    "custom-room-popup",
                            }
                        );

                        (
                            layer as L.Path & {
                                sectionLabel?: L.Marker;
                            }
                        ).sectionLabel = label;
                    },
                }).addTo(leafletMap);

            /*
             * ------------------------------------------------------------
             * Add data
             * ------------------------------------------------------------
             */

            for (const feature of roomData.features) {
                if (!feature.properties) continue;

                const level = Number(
                    feature.properties.Level
                );

                if (level === 0) {
                    floorLayers.G.addData(feature as any);
                } else if (level === 1) {
                    floorLayers["1"].addData(feature as any);
                } else if (level === 2) {
                    floorLayers["2"].addData(feature as any);
                }
            }

            for (const feature of stairsData.features) {
                if (!feature.properties) continue;

                const level = Number(
                    feature.properties.Level
                );

                if (level === 0) {
                    stairsLayers.G.addData(feature as any);
                } else if (level === 1) {
                    stairsLayers["1"].addData(feature as any);
                } else if (level === 2) {
                    stairsLayers["2"].addData(feature as any);
                }
            }

            const parkingLayer =
                L.geoJSON(parkingData as any, {
                    style: styleParkingZone,
                    onEachFeature: onEachParkingZone,
                }).addTo(leafletMap);

            parkingLayer.eachLayer((layer) => {
                const parkingLayer =
                    layer as L.Path & {
                        parkingIcon?: L.Marker;
                    };

                parkingLayer.parkingIcon?.addTo(leafletMap);
            });

            /*
             * ------------------------------------------------------------
             * Building labels
             * ------------------------------------------------------------
             */

            function updateBuildingLabels() {
                const shouldShow =
                    leafletMap.getZoom() >=
                    BUILDING_LABEL_ZOOM;

                buildingLayer.eachLayer((layer) => {
                    const building =
                        layer as L.Path & {
                            sectionLabel?: L.Marker;
                        };

                    const label =
                        building.sectionLabel;

                    if (!label) return;

                    if (shouldShow) {
                        if (!leafletMap.hasLayer(label)) {
                            label.addTo(leafletMap);
                        }
                    } else {
                        if (leafletMap.hasLayer(label)) {
                            leafletMap.removeLayer(label);
                        }
                    }
                });
            }

            /*
             * ------------------------------------------------------------
             * Room visibility
             * ------------------------------------------------------------
             */

            function updateRoomVisibility() {
                const zoom = leafletMap.getZoom();

                // Always remove ALL room floors first
                Object.values(floorLayers).forEach((layer) => {
                    leafletMap.removeLayer(layer);
                });

                // Only show the selected floor when sufficiently zoomed in
                if (zoom >= ROOM_ZOOM_LEVEL) {
                    floorLayers[currentFloor].addTo(leafletMap);
                }
            }


            /*
             * ------------------------------------------------------------
             * Room number labels
             * ------------------------------------------------------------
             */

            function updateRoomNumberLabels() {
                const zoom = leafletMap.getZoom();

                Object.entries(floorLayers)
                    .forEach(([floor, floorLayer]) => {
                        floorLayer.eachLayer((layer) => {
                            const room =
                                layer as L.Path & {
                                    roomNumberLabel?: L.Marker;
                                };

                            const label =
                                room.roomNumberLabel;

                            if (!label) return;

                            const isCurrentFloor =
                                floor === currentFloor;

                            const shouldShow =
                                isCurrentFloor &&
                                zoom >= ROOM_LABEL_ZOOM;

                            if (shouldShow) {
                                if (!leafletMap.hasLayer(label)) {
                                    label.addTo(leafletMap);
                                }
                            } else {
                                if (leafletMap.hasLayer(label)) {
                                    leafletMap.removeLayer(label);
                                }
                            }
                        });
                    });
            }

            /*
             * ------------------------------------------------------------
             * Stairs visibility
             * ------------------------------------------------------------
             */

            function updateStairsVisibility() {
                const zoom = leafletMap.getZoom();

                // Remove every stair floor and every stair icon
                Object.values(stairsLayers).forEach((layer) => {
                    leafletMap.removeLayer(layer);

                    layer.eachLayer((stair) => {
                        const item = stair as L.Path & {
                            stairsIcon?: L.Marker;
                        };

                        if (item.stairsIcon) {
                            leafletMap.removeLayer(item.stairsIcon);
                        }
                    });
                });

                if (zoom < ROOM_ZOOM_LEVEL) {
                    return;
                }

                // Add only the current floor
                const selectedLayer = stairsLayers[currentFloor];

                selectedLayer.addTo(leafletMap);

                selectedLayer.eachLayer((stair) => {
                    const item = stair as L.Path & {
                        stairsIcon?: L.Marker;
                    };

                    if (item.stairsIcon) {
                        item.stairsIcon.addTo(leafletMap);
                    }
                });
            }


            /*
             * ------------------------------------------------------------
             * Floor control
             * ------------------------------------------------------------
             */

            const FloorControl =
                L.Control.extend({
                    options: {
                        position: "bottomright",
                    },

                    onAdd() {
                        const container =
                            L.DomUtil.create(
                                "div",
                                "leaflet-bar floor-control"
                            );

                        const floors: Floor[] = [
                            "2",
                            "1",
                            "G",
                        ];

                        floors.forEach((floor) => {
                            const button =
                                L.DomUtil.create(
                                    "a",
                                    "",
                                    container
                                );

                            button.href = "#";
                            button.innerHTML = floor;
                            button.title =
                                `Floor ${floor}`;

                            button.onclick = (event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                currentFloor = floor;

                                // Remove all room layers
                                Object.values(floorLayers).forEach((layer) => {
                                    leafletMap.removeLayer(layer);
                                });

                                // Remove all stair layers
                                Object.values(stairsLayers).forEach((layer) => {
                                    leafletMap.removeLayer(layer);

                                    layer.eachLayer((stair) => {
                                        const item = stair as L.Path & {
                                            stairsIcon?: L.Marker;
                                        };

                                        if (item.stairsIcon) {
                                            leafletMap.removeLayer(item.stairsIcon);
                                        }
                                    });
                                });

                                // Remove all room number labels
                                Object.values(floorLayers).forEach((layer) => {
                                    layer.eachLayer((room) => {
                                        const item = room as L.Path & {
                                            roomNumberLabel?: L.Marker;
                                        };

                                        if (item.roomNumberLabel) {
                                            leafletMap.removeLayer(
                                                item.roomNumberLabel
                                            );
                                        }
                                    });
                                });

                                // Now show the newly selected floor
                                updateRoomVisibility();
                                updateStairsVisibility();
                                updateRoomNumberLabels();
                            };
                        });

                        return container;
                    },
                });

            leafletMap.addControl(
                new FloorControl()
            );

            /*
             * ------------------------------------------------------------
             * Initial state
             * ------------------------------------------------------------
             */

            leafletMap.fitBounds(
                buildingLayer.getBounds()
            );

            updateBuildingLabels();
            updateRoomVisibility();
            updateStairsVisibility();
            updateRoomNumberLabels();

            leafletMap.on("zoomend", () => {
                updateRoomVisibility();
                updateStairsVisibility();
                updateBuildingLabels();
                updateRoomNumberLabels();
            });
        }

        initializeMap();

        /*
         * ------------------------------------------------------------
         * Cleanup
         * ------------------------------------------------------------
         */

        return () => {
            cancelled = true;

            if (map) {
                map.remove();
                map = undefined;
            }
        };
    }, []);

    return (
        <div className="relative h-full w-full">
            <div
                ref={mapRef}
                id="map"
                className="h-full w-full"
            />

            {/* Map disclaimer */}
            {showDisclaimer && (
                <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] max-w-sm">
                    <div className="pointer-events-auto relative rounded-lg border border-black/10 bg-white/95 px-4 py-3 pr-10 text-xs leading-5 text-black/60 shadow-lg backdrop-blur-sm">

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setShowDisclaimer(false)}
                            aria-label="Close map disclaimer"
                            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black/70"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            >
                                <path d="M6 6L18 18" />
                                <path d="M18 6L6 18" />
                            </svg>
                        </button>

                        <p className="font-semibold text-black/80">
                            Map disclaimer
                        </p>

                        <p className="mt-1">
                            This is an independent student-built map.
                            Rooms, buildings, parking and other information
                            may be incomplete, outdated or inaccurate.
                            Please verify important information with
                            MTU.
                        </p>

                        <p className="mt-2 text-black/40">
                            MTUMods is not affiliated with,
                            endorsed by, or officially connected to
                            MTU.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
