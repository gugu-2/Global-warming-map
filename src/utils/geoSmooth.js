// Chaikin's Algorithm for natural, realistic coastline smoothing
// Transforms discrete polygon coordinates into smooth, organic topographic contours.

export function chaikinSmooth(points, iterations = 2) {
  if (!points || points.length < 3) return points;

  let currentPoints = [...points];

  // If first and last point are the same, treat as closed loop
  const isClosed = (
    currentPoints[0][0] === currentPoints[currentPoints.length - 1][0] &&
    currentPoints[0][1] === currentPoints[currentPoints.length - 1][1]
  );

  for (let it = 0; it < iterations; it++) {
    const nextPoints = [];
    const len = isClosed ? currentPoints.length - 1 : currentPoints.length;

    for (let i = 0; i < len; i++) {
      const p0 = currentPoints[i];
      const p1 = currentPoints[(i + 1) % currentPoints.length];

      // 75% and 25% corner-cutting
      const q = [
        0.75 * p0[0] + 0.25 * p1[0],
        0.75 * p0[1] + 0.25 * p1[1]
      ];
      const r = [
        0.25 * p0[0] + 0.75 * p1[0],
        0.25 * p0[1] + 0.75 * p1[1]
      ];

      nextPoints.push(q);
      nextPoints.push(r);
    }

    if (isClosed) {
      nextPoints.push(nextPoints[0]); // maintain closure
    }

    currentPoints = nextPoints;
  }

  return currentPoints;
}
