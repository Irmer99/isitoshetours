const {
  updateSiteSettingsSchema,
  createItinerarySchema,
  createBlogSchema,
  updateBlogSchema,
} = require('../validators/content.validator');
const {
  loginSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('../validators/auth.validator');

describe('Content validators — site settings', () => {
  it('accepts a valid homepage payload', () => {
    const result = updateSiteSettingsSchema.safeParse({
      data: {
        heroSlides: [{ image: 'https://images.unsplash.com/photo-1', tagline: 'Gorilla Trekking' }],
        aboutTitle: 'About Isitoshe Tours',
        aboutParagraphs: ['Paragraph one'],
        aboutImages: ['https://images.unsplash.com/photo-2'],
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects a hero slide with a non-URL image', () => {
    const result = updateSiteSettingsSchema.safeParse({
      data: { heroSlides: [{ image: 'not-a-url', tagline: 'x' }] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a hero slide with an empty tagline', () => {
    const result = updateSiteSettingsSchema.safeParse({
      data: { heroSlides: [{ image: 'https://x.com/a.jpg', tagline: '' }] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-URL about image', () => {
    const result = updateSiteSettingsSchema.safeParse({
      data: { aboutImages: ['relative/path.png'] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects more than 15 hero slides', () => {
    const slides = Array.from({ length: 16 }, (_, i) => ({
      image: `https://x.com/${i}.jpg`,
      tagline: `Slide ${i}`,
    }));
    const result = updateSiteSettingsSchema.safeParse({ data: { heroSlides: slides } });
    expect(result.success).toBe(false);
  });

  it('allows arbitrary non-homepage keys to pass through', () => {
    const result = updateSiteSettingsSchema.safeParse({
      data: { customSetting: 'some-value' },
    });
    expect(result.success).toBe(true);
  });
});

describe('Content validators — images', () => {
  it('accepts an itinerary with valid image URLs', () => {
    const result = createItinerarySchema.safeParse({
      title: 'Gorilla Trek',
      slug: 'gorilla-trek',
      images: ['https://x.com/1.jpg', 'https://x.com/2.jpg'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an itinerary with an invalid image URL', () => {
    const result = createItinerarySchema.safeParse({
      title: 'Gorilla Trek',
      slug: 'gorilla-trek',
      images: ['not-a-url'],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a blog with a valid cover image and omits invalid fields when optional', () => {
    const result = createBlogSchema.safeParse({
      title: 'Post',
      slug: 'post',
      coverImage: 'https://x.com/cover.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a blog with a non-URL cover image', () => {
    const result = createBlogSchema.safeParse({
      title: 'Post',
      slug: 'post',
      coverImage: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('allows omitting optional cover image on blog update', () => {
    const result = updateBlogSchema.safeParse({ title: 'Updated' });
    expect(result.success).toBe(true);
  });
});

describe('Auth validators', () => {
  it('accepts valid login credentials', () => {
    const result = loginSchema.safeParse({
      email: 'admin@isitoshetours.com',
      password: 'Str0ng!Pass',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'nope', password: 'Str0ng!Pass' });
    expect(result.success).toBe(false);
  });

  it('rejects login attempts with a non-empty website honeypot field', () => {
    const result = loginSchema.safeParse({
      email: 'admin@isitoshetours.com',
      password: 'Str0ng!Pass',
      website: 'spam',
    });
    expect(result.success).toBe(false);
  });

  it('accepts login attempts with an empty website honeypot field', () => {
    const result = loginSchema.safeParse({
      email: 'admin@isitoshetours.com',
      password: 'Str0ng!Pass',
      website: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a reset password that lacks an uppercase letter', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'abc123',
      password: 'lowercase1!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a reset password that lacks a number', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'abc123',
      password: 'Uppercase!',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a reset password meeting all requirements', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'abc123',
      password: 'Str0ng!Pass',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a change-password payload with a short new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'current',
      newPassword: 'short1!',
    });
    expect(result.success).toBe(false);
  });
});
