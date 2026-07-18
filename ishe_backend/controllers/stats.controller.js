const { getPrisma } = require('../lib/db');

exports.overview = async (req, res) => {
  const prisma = getPrisma();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    thisMonth,
    confirmedThisMonth,
    enquiriesThisMonth,
    totals,
    topItineraries,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth }, status: 'confirmed' } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth }, status: 'enquiry' } }),
    prisma.$queryRaw`SELECT COUNT(*)::int as count, COALESCE(SUM("total_amount"), 0)::float as total FROM "bookings" WHERE deleted = false`,
    prisma.$queryRaw`SELECT itinerary as "_id", COUNT(*)::int as count, SUM("total_amount")::float as revenue FROM "bookings" WHERE deleted = false GROUP BY itinerary ORDER BY count DESC LIMIT 10`,
  ]);

  res.json({
    bookingsThisMonth: thisMonth,
    confirmedThisMonth,
    enquiriesThisMonth,
    totalBookings: totals[0]?.count || 0,
    totalRevenue: totals[0]?.total || 0,
    topItineraries,
  });
};

exports.bookingsByRoute = async (req, res) => {
  const prisma = getPrisma();
  const data = await prisma.$queryRaw`SELECT itinerary as "_id", COUNT(*)::int as count, SUM("total_amount")::float as revenue FROM "bookings" WHERE deleted = false GROUP BY itinerary ORDER BY count DESC`;
  res.json(data);
};

exports.bookingsOverTime = async (req, res) => {
  const prisma = getPrisma();
  const range = Math.min(365, Math.max(1, parseInt(req.query.range) || 30));
  const since = new Date();
  since.setDate(since.getDate() - range);

  const data = await prisma.$queryRaw`SELECT DATE("created_at")::text as id, COUNT(*)::int as count, SUM("total_amount")::float as revenue FROM "bookings" WHERE deleted = false AND "created_at" >= ${since} GROUP BY DATE("created_at") ORDER BY id`;
  res.json(data);
};

exports.conversion = async (req, res) => {
  const prisma = getPrisma();
  const data = await prisma.$queryRaw`SELECT status as "_id", COUNT(*)::int as count FROM "bookings" WHERE deleted = false GROUP BY status`;

  const map = {};
  data.forEach((d) => { map[d._id] = d.count; });
  const enquiries = map.enquiry || 0;
  const confirmed = map.confirmed || 0;
  const rate = enquiries > 0 ? confirmed / enquiries : 0;

  res.json({ enquiries, confirmed, completed: map.completed || 0, cancelled: map.cancelled || 0, rate });
};
