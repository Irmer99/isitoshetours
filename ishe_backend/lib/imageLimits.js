const IMAGE_LIMITS = {
  hero: { width: 1920, height: 1080 },
  about: { width: 1200, height: 1500 },
  itinerary: { width: 1280, height: 720 },
  destination: { width: 1280, height: 720 },
  blog: { width: 1280, height: 720 },
};

const DEFAULT_LIMIT = { width: 2560, height: 2560 };

function getLimit(context) {
  return IMAGE_LIMITS[context] || DEFAULT_LIMIT;
}

function isOverLimit({ width, height }, limit) {
  return width > limit.width || height > limit.height;
}

module.exports = { IMAGE_LIMITS, DEFAULT_LIMIT, getLimit, isOverLimit };
