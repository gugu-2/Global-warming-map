// Simplified world continent boundaries for fast, offline rendering
// Format: Array of polygons, each is an array of [latitude, longitude] pairs.

export const CONTINENTS = [
  // Eurasia & Africa (Afro-Eurasia)
  {
    name: 'Eurasia',
    points: [
      [71.0, 28.0], [70.0, 60.0], [72.0, 110.0], [68.0, 165.0], [60.0, 170.0],
      [55.0, 160.0], [45.0, 140.0], [35.0, 120.0], [22.0, 114.0], [10.0, 105.0],
      [1.0, 104.0], [15.0, 95.0], [22.0, 90.0], [20.0, 80.0], [8.0, 77.0],
      [23.0, 70.0], [25.0, 60.0], [12.0, 44.0], [30.0, 32.0], [36.0, 36.0],
      [42.0, 28.0], [40.0, 23.0], [36.0, -5.0], [44.0, -9.0], [48.0, -4.0],
      [55.0, 8.0], [60.0, 5.0], [71.0, 28.0]
    ]
  },
  {
    name: 'Africa',
    points: [
      [36.0, -5.0], [37.0, 11.0], [32.0, 31.0], [30.0, 32.0], [12.0, 44.0],
      [11.0, 51.0], [0.0, 42.0], [-10.0, 40.0], [-25.0, 33.0], [-34.5, 20.0],
      [-34.0, 18.0], [-22.0, 14.0], [-5.0, 12.0], [4.0, 9.0], [5.0, 0.0],
      [4.5, -8.0], [12.0, -17.0], [21.0, -17.0], [30.0, -10.0], [36.0, -5.0]
    ]
  },
  {
    name: 'North America',
    points: [
      [70.0, -165.0], [72.0, -125.0], [60.0, -85.0], [58.0, -60.0], [45.0, -60.0],
      [42.0, -70.0], [30.0, -80.0], [25.0, -80.0], [28.0, -97.0], [20.0, -97.0],
      [15.0, -90.0], [9.0, -79.0], [15.0, -95.0], [23.0, -108.0], [32.0, -117.0],
      [48.0, -125.0], [60.0, -145.0], [65.0, -168.0], [70.0, -165.0]
    ]
  },
  {
    name: 'South America',
    points: [
      [12.0, -72.0], [10.0, -60.0], [5.0, -52.0], [-5.0, -35.0], [-23.0, -43.0],
      [-35.0, -55.0], [-54.0, -68.0], [-52.0, -75.0], [-35.0, -72.0], [-18.0, -70.0],
      [-5.0, -81.0], [8.0, -77.0], [12.0, -72.0]
    ]
  },
  {
    name: 'Australia',
    points: [
      [-11.0, 142.0], [-15.0, 145.0], [-25.0, 153.0], [-38.0, 145.0], [-35.0, 115.0],
      [-22.0, 114.0], [-14.0, 126.0], [-12.0, 136.0], [-11.0, 142.0]
    ]
  },
  {
    name: 'Greenland',
    points: [
      [83.0, -30.0], [80.0, -20.0], [70.0, -22.0], [60.0, -43.0], [65.0, -52.0],
      [76.0, -70.0], [82.0, -60.0], [83.0, -30.0]
    ]
  },
  {
    name: 'British Isles',
    points: [
      [58.0, -5.0], [56.0, -2.0], [51.0, 1.5], [50.0, -5.0], [54.0, -3.0], [58.0, -5.0]
    ]
  },
  {
    name: 'Japan',
    points: [
      [45.0, 142.0], [43.0, 145.0], [35.0, 140.0], [31.0, 131.0], [35.0, 134.0],
      [40.0, 140.0], [45.0, 142.0]
    ]
  },
  {
    name: 'Madagascar',
    points: [
      [-12.0, 49.0], [-16.0, 50.0], [-25.0, 47.0], [-25.0, 44.0], [-17.0, 44.0], [-12.0, 49.0]
    ]
  }
];

// Helper to convert Lat/Lng to 3D Cartesian coordinates on sphere of radius R
export function latLngToVector3(lat, lng, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return { x, y, z };
}

// Generate realistic procedural earth texture on HTML canvas (2048x1024)
export function createEarthCanvasTexture() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Deep Ocean Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0c1b33');
  oceanGrad.addColorStop(0.3, '#0b2046');
  oceanGrad.addColorStop(0.5, '#071630');
  oceanGrad.addColorStop(0.7, '#0b2046');
  oceanGrad.addColorStop(1, '#0c1b33');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Graticule Lines (Latitude & Longitude grid)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;

  // Latitudes
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  // Equator highlight
  const eqY = height / 2;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
  ctx.beginPath();
  ctx.moveTo(0, eqY);
  ctx.lineTo(width, eqY);
  ctx.stroke();

  // Longitudes
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // 3. Draw Continent Landmasses with Topographic shading
  function project(lat, lng) {
    return [
      ((lng + 180) / 360) * width,
      ((90 - lat) / 180) * height
    ];
  }

  CONTINENTS.forEach(cont => {
    ctx.beginPath();
    cont.points.forEach((pt, i) => {
      const [x, y] = project(pt[0], pt[1]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    // Land base fill with realistic terrain shades
    const landGrad = ctx.createLinearGradient(0, 0, 0, height);
    landGrad.addColorStop(0, '#e2e8f0'); // Tundra / ice
    landGrad.addColorStop(0.25, '#2d5a27'); // Northern forests
    landGrad.addColorStop(0.45, '#8c7d3b'); // Temperate & steppes
    landGrad.addColorStop(0.55, '#c29a4e'); // Sahara / desert bands
    landGrad.addColorStop(0.65, '#235920'); // Tropical rainforests
    landGrad.addColorStop(0.85, '#8c7d3b'); // Southern land
    landGrad.addColorStop(1, '#ffffff'); // Antarctica

    ctx.fillStyle = landGrad;
    ctx.fill();

    // Shallow continental shelf water glow
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Land border outline
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  return canvas;
}
