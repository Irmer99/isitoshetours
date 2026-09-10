function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(prisma, model, baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  let existing = await prisma[model].findFirst({ where: { slug } });
  while (existing) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    existing = await prisma[model].findFirst({ where: { slug } });
  }
  return slug;
}

module.exports = { slugify, generateUniqueSlug };
