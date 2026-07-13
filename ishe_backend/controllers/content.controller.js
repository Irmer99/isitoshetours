const Itinerary = require('../models/Itinerary');
const Destination = require('../models/Destination');
const Testimonial = require('../models/Testimonial');
const Team = require('../models/Team');
const SiteSettings = require('../models/SiteSettings');

exports.createItinerary = async (req, res) => {
  const itinerary = await Itinerary.create(req.body);
  res.status(201).json(itinerary);
};

exports.getItineraries = async (req, res) => {
  const filter = {};
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };
  const itineraries = await Itinerary.find(filter).sort({ title: 1 });
  res.json(itineraries);
};

exports.getItinerary = async (req, res) => {
  const itinerary = await Itinerary.findOne({ slug: req.params.slug });
  if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
  res.json(itinerary);
};

exports.updateItinerary = async (req, res) => {
  const itinerary = await Itinerary.findOneAndUpdate(
    { slug: req.params.slug },
    req.body,
    { new: true, runValidators: true }
  );
  if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
  res.json(itinerary);
};

exports.createDestination = async (req, res) => {
  const dest = await Destination.create(req.body);
  res.status(201).json(dest);
};

exports.getDestinations = async (req, res) => {
  const destinations = await Destination.find().sort({ name: 1 });
  res.json(destinations);
};

exports.getDestinationBySlug = async (req, res) => {
  const dest = await Destination.findOne({ slug: req.params.slug });
  if (!dest) return res.status(404).json({ error: 'Destination not found' });
  res.json(dest);
};

exports.getItinerariesByDestination = async (req, res) => {
  const itineraries = await Itinerary.find({ destinations: req.params.slug }).sort({ title: 1 });
  res.json(itineraries);
};

exports.updateDestination = async (req, res) => {
  const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!dest) return res.status(404).json({ error: 'Destination not found' });
  res.json(dest);
};

exports.getTestimonials = async (req, res) => {
  const testimonials = await Testimonial.find({ active: true }).sort({ order: 1 });
  res.json(testimonials);
};

exports.updateTestimonial = async (req, res) => {
  const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!t) return res.status(404).json({ error: 'Testimonial not found' });
  res.json(t);
};

exports.getTeam = async (req, res) => {
  const team = await Team.find({ active: true }).sort({ order: 1 });
  res.json(team);
};

exports.updateTeamMember = async (req, res) => {
  const member = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!member) return res.status(404).json({ error: 'Team member not found' });
  res.json(member);
};

exports.getSiteSettings = async (req, res) => {
  let settings = await SiteSettings.findOne({ key: 'site-settings' });
  if (!settings) {
    settings = await SiteSettings.create({ key: 'site-settings', data: {} });
  }
  res.json(settings);
};

exports.updateSiteSettings = async (req, res) => {
  let settings = await SiteSettings.findOneAndUpdate(
    { key: 'site-settings' },
    { data: req.body.data },
    { new: true, upsert: true }
  );
  res.json(settings);
};
