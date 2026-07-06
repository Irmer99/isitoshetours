const Booking = require('../models/Booking');

exports.overview = async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    thisMonth,
    totals,
    topItineraries,
  ] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Booking.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $group: { _id: '$itinerary', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  res.json({
    bookingsThisMonth: thisMonth,
    totalBookings: totals[0]?.count || 0,
    totalRevenue: totals[0]?.total || 0,
    topItineraries,
  });
};

exports.bookingsByRoute = async (req, res) => {
  const data = await Booking.aggregate([
    { $group: { _id: '$itinerary', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    { $sort: { count: -1 } },
  ]);
  res.json(data);
};

exports.bookingsOverTime = async (req, res) => {
  const range = parseInt(req.query.range) || 30;
  const since = new Date();
  since.setDate(since.getDate() - range);

  const data = await Booking.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data);
};

exports.conversion = async (req, res) => {
  const data = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const map = {};
  data.forEach((d) => { map[d._id] = d.count; });
  const enquiries = map.enquiry || 0;
  const confirmed = map.confirmed || 0;
  const rate = enquiries > 0 ? ((confirmed / enquiries) * 100).toFixed(1) : 0;

  res.json({ enquiries, confirmed, completed: map.completed || 0, cancelled: map.cancelled || 0, conversionRate: `${rate}%` });
};
