const { getPrisma } = require('../lib/db');
const { generateUniqueSlug, slugify } = require('../lib/slug');

function formatItinerary(itinerary) {
  if (!itinerary) return itinerary;
  const { pricingFrom, pricingCurrency, ...rest } = itinerary;
  return {
    ...rest,
    pricing: pricingFrom !== null && pricingFrom !== undefined
      ? { from: pricingFrom, currency: pricingCurrency }
      : undefined,
  };
}

function mapPricingInput(data) {
  if (data.pricing && typeof data.pricing === 'object') {
    const { pricing, ...rest } = data;
    return {
      ...rest,
      pricingFrom: pricing.from ?? null,
      pricingCurrency: pricing.currency ?? 'MAD',
    };
  }
  const rest = { ...data };
  delete rest.pricing;
  return rest;
}

exports.createItinerary = async (req, res) => {
  const prisma = getPrisma();
  const { days, ...rawData } = req.body;
  const data = mapPricingInput(rawData);
  if (!data.slug) {
    const base = slugify(data.title || 'itinerary');
    data.slug = await generateUniqueSlug(prisma, 'itinerary', base);
  }
  const itinerary = await prisma.itinerary.create({
    data: {
      ...data,
      days: days ? { create: days } : undefined,
    },
    include: { days: { orderBy: { day: 'asc' } } },
  });
  res.status(201).json(formatItinerary(itinerary));
};

exports.getItineraries = async (req, res) => {
  const prisma = getPrisma();
  const where = {};
  if (req.query.difficulty) where.difficulty = req.query.difficulty;
  if (req.query.search) where.title = { contains: req.query.search, mode: 'insensitive' };
  const itineraries = await prisma.itinerary.findMany({
    where,
    include: { days: { orderBy: { day: 'asc' } } },
    orderBy: { title: 'asc' },
  });
  res.json(itineraries.map(formatItinerary));
};

exports.getItinerary = async (req, res) => {
  const prisma = getPrisma();
  const itinerary = await prisma.itinerary.findFirst({
    where: { slug: req.params.slug },
    include: { days: { orderBy: { day: 'asc' } } },
  });
  if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
  res.json(formatItinerary(itinerary));
};

exports.updateItinerary = async (req, res) => {
  const prisma = getPrisma();
  const { days, ...rawData } = req.body;
  const data = mapPricingInput(rawData);
  const existing = await prisma.itinerary.findFirst({ where: { slug: req.params.slug } });
  if (!existing) return res.status(404).json({ error: 'Itinerary not found' });

  if (days) {
    await prisma.itineraryDay.deleteMany({ where: { itineraryId: existing.id } });
  }

  const itinerary = await prisma.itinerary.update({
    where: { id: existing.id },
    data: {
      ...data,
      ...(days ? { days: { create: days } } : {}),
    },
    include: { days: { orderBy: { day: 'asc' } } },
  });
  res.json(formatItinerary(itinerary));
};

exports.createDestination = async (req, res) => {
  const prisma = getPrisma();
  if (!req.body.slug) {
    const base = slugify(req.body.name || 'destination');
    req.body.slug = await generateUniqueSlug(prisma, 'destination', base);
  }
  const dest = await prisma.destination.create({ data: req.body });
  res.status(201).json(dest);
};

exports.getDestinations = async (req, res) => {
  const prisma = getPrisma();
  const destinations = await prisma.destination.findMany({ orderBy: { name: 'asc' } });
  res.json(destinations);
};

exports.getDestinationBySlug = async (req, res) => {
  const prisma = getPrisma();
  const dest = await prisma.destination.findFirst({ where: { slug: req.params.slug } });
  if (!dest) return res.status(404).json({ error: 'Destination not found' });
  res.json(dest);
};

exports.getItinerariesByDestination = async (req, res) => {
  const prisma = getPrisma();
  const itineraries = await prisma.itinerary.findMany({
    where: { destinations: { has: req.params.slug } },
    include: { days: { orderBy: { day: 'asc' } } },
    orderBy: { title: 'asc' },
  });
  res.json(itineraries.map(formatItinerary));
};

exports.updateDestination = async (req, res) => {
  const prisma = getPrisma();
  const existing = await prisma.destination.findFirst({ where: { slug: req.params.slug } });
  if (!existing) return res.status(404).json({ error: 'Destination not found' });
  const dest = await prisma.destination.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json(dest);
};

exports.getTestimonials = async (req, res) => {
  const prisma = getPrisma();
  const testimonials = await prisma.testimonial.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });
  res.json(testimonials);
};

exports.updateTestimonial = async (req, res) => {
  const prisma = getPrisma();
  const t = await prisma.testimonial.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(t);
};

exports.getTeam = async (req, res) => {
  const prisma = getPrisma();
  const team = await prisma.team.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  });
  res.json(team);
};

exports.updateTeamMember = async (req, res) => {
  const prisma = getPrisma();
  const member = await prisma.team.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(member);
};

exports.getSiteSettings = async (req, res) => {
  const prisma = getPrisma();
  let settings = await prisma.siteSettings.findFirst({ where: { key: 'site-settings' } });
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: { key: 'site-settings', data: {} } });
  }
  res.json(settings);
};

exports.updateSiteSettings = async (req, res) => {
  const prisma = getPrisma();
  let settings = await prisma.siteSettings.findFirst({ where: { key: 'site-settings' } });
  if (settings) {
    settings = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { data: req.body.data },
    });
  } else {
    settings = await prisma.siteSettings.create({
      data: { key: 'site-settings', data: req.body.data },
    });
  }
  res.json(settings);
};

exports.createBlog = async (req, res) => {
  const prisma = getPrisma();
  if (!req.body.slug) {
    const base = slugify(req.body.title || 'blog');
    req.body.slug = await generateUniqueSlug(prisma, 'blog', base);
  }
  const blog = await prisma.blog.create({ data: req.body });
  res.status(201).json(blog);
};

exports.getBlogs = async (req, res) => {
  const prisma = getPrisma();
  const where = {};
  if (req.query.includeArchived !== 'true') {
    where.archived = false;
  }
  if (req.query.tag) where.tags = { has: req.query.tag };
  if (req.query.search) where.title = { contains: req.query.search, mode: 'insensitive' };
  const blogs = await prisma.blog.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(blogs);
};

exports.getBlog = async (req, res) => {
  const prisma = getPrisma();
  const blog = await prisma.blog.findFirst({ where: { slug: req.params.slug } });
  if (!blog) return res.status(404).json({ error: 'Blog post not found' });
  res.json(blog);
};

exports.updateBlog = async (req, res) => {
  const prisma = getPrisma();
  const existing = await prisma.blog.findFirst({ where: { slug: req.params.slug } });
  if (!existing) return res.status(404).json({ error: 'Blog post not found' });
  const blog = await prisma.blog.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json(blog);
};

exports.deleteBlog = async (req, res) => {
  const prisma = getPrisma();
  const existing = await prisma.blog.findFirst({ where: { slug: req.params.slug } });
  if (!existing) return res.status(404).json({ error: 'Blog post not found' });
  await prisma.blog.delete({ where: { id: existing.id } });
  res.json({ message: 'Blog post deleted' });
};
