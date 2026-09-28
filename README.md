# MTUMods Campus Map

An open-source, student-built campus map for Munster Technological University (MTU), starting with the Cork campus.

The project helps students quickly find classrooms, buildings, stairs, and parking areas without having to navigate the campus manually.

> **Disclaimer:** This is an independent student project. MTUModifications is not affiliated with, endorsed by, or officially connected to Munster Technological University.

## Features

- Interactive OpenStreetMap-based campus map
- Building locations and names
- Room locations and room numbers
- Floor selection for multi-floor buildings

## Tech Stack

- React
- TypeScript
- React Router
- Leaflet
- OpenStreetMap
- Turf.js
- Tailwind CSS

## Project Structure

A simplified overview of the project:

```
campus-map/
├── public/
├── src/
│   ├── components/
│   │   └── CampusMap.tsx
│   ├── data/
│   │   ├── corkBuildings.*
│   │   ├── corkParking.*
│   │   ├── corkRooms.*
│   │   └── corkStairs.*
│   ├── pages/
│   │   └── Home.tsx
│   └── ...
├── package.json
└── README.md
```

The exact file structure may vary depending on the current state of the project.

## Getting Started

### Prerequisites

You'll need:

- Node.js
- npm, pnpm, or another compatible package manager
- Git

### Clone the repository

```bash
git clone https://github.com/mtumodifications/campus-map.git
cd campus-map
```

### Install dependencies

Using npm:

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The development server will print the local URL in your terminal.

### Build for production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Map Data

The map currently uses GeoJSON-based datasets for the Cork campus.

The main datasets are:

| Dataset       | Purpose                               |
| ------------- | ------------------------------------- |
| corkRooms     | Classroom and room geometries         |
| corkBuildings | Building geometries and information   |
| corkParking   | Parking areas and attributes          |
| corkStairs    | Stair locations and floor information |

### Room data

Rooms are associated with a floor using their Level property:

```
0 → Ground Floor
1 → 1st Floor
2 → 2nd Floor
```

Room data may include properties such as:

- `Room_Number`
- `Room_Name`
- `Level`

Rooms named `VOID` are excluded from the visible room layer.

### Parking data

Parking areas can contain information such as:

- Parking space name
- Full capacity
- Disabled capacity
- Paid parking
- Reserved status
- Disability-friendly status
- Bike-only status
- Visitor parking
- Barrier information

The map uses different visual styles for general, reserved, and bike-only parking areas.

## Map Behaviour

The map intentionally changes what is displayed depending on the current zoom level.

### Buildings

Building labels appear when the map is zoomed to level 17 or higher.

### Rooms

Room polygons appear at zoom level 18 or higher.

### Room numbers

Room number labels appear at zoom level 19 or higher.

### Stairs

Stair locations are displayed alongside the selected floor once the map reaches the room zoom level.

This keeps the map relatively uncluttered when viewing the campus from a distance.

### Floor Selection

The floor control allows users to switch between:

- Ground Floor (G)
- 1st Floor (1)
- 2nd Floor (2)

Only the selected floor's room and stair data is displayed when sufficiently zoomed in.

## OpenStreetMap

The map uses OpenStreetMap tiles.

Map data is © OpenStreetMap contributors.

Please ensure that any deployment continues to comply with the OpenStreetMap tile [usage policy](https://operations.osmfoundation.org/policies/tiles/) and attribution requirements.

### Contributing

Contributions are welcome.

You can help by:

- Adding missing rooms
- Correcting inaccurate room locations
- Updating building information
- Updating parking information
- Adding missing stairs
- Improving the map UI
- Fixing bugs
- Improving accessibility
- Adding support for additional MTU campuses
- Improving documentation

## Development workflow

1. Fork the repository.

2. Clone your fork.

3. Install the dependencies.

4. Create a branch for your changes.

    ```bash
    git checkout -b feature/my-change
    ```

5. Make and test your changes locally.

6. Commit your changes.

    ```bash
    git add .
    git commit -m "Describe your change"
    ```

7. Push your branch.

    ```bash
    git push origin feature/my-change
    ```

8. Open a pull request.

Please provide a clear description of what you changed and, where appropriate, screenshots or examples.

## Adding or Updating Map Data

When modifying GeoJSON data, please ensure that:

- Coordinates are valid GeoJSON coordinates.
- Features contain the properties expected by the application.
- Floor levels use the existing Level convention.
- Room numbers and names are consistent with the source information.
- Existing features are not accidentally removed.
- Changes are checked visually in the map before submitting a pull request.

Because the map is intended to help students navigate campus, please take particular care when changing room or building locations.

## Disclaimer

This project is an independent student-built resource.

Information displayed by the map may be incomplete, outdated, or inaccurate. Room locations, building information, parking information, accessibility information, and other map data should not be treated as official MTU information.

For important information, please verify details with Munster Technological University.

MTUModifications is not affiliated with, endorsed by, or officially connected to Munster Technological University.

## License

See the repository's [license](LICENSE) file for the terms under which this project may be used, modified, and distributed.

If you contribute to the project, your contribution will be subject to the project's applicable license and contribution terms.

## Project

MTUMods Campus Map

Part of MTUModifications, an independent student-run project building useful tools and resources for students at Munster Technological University.

- Website: https://mtumods.com
- GitHub: https://github.com/mtumodifications
