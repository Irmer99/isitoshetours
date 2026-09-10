const { IMAGE_LIMITS, DEFAULT_LIMIT, getLimit, isOverLimit } = require('../lib/imageLimits');

describe('imageLimits', () => {
  it('defines the expected per-context pixel limits', () => {
    expect(IMAGE_LIMITS).toEqual({
      hero: { width: 1920, height: 1080 },
      about: { width: 1200, height: 1500 },
      itinerary: { width: 1280, height: 720 },
      destination: { width: 1280, height: 720 },
      blog: { width: 1280, height: 720 },
    });
  });

  it('returns the default limit for an unknown context', () => {
    expect(getLimit('nope')).toEqual(DEFAULT_LIMIT);
  });

  it('detects dimensions that exceed a limit', () => {
    const hero = getLimit('hero');
    expect(isOverLimit({ width: 1920, height: 1080 }, hero)).toBe(false);
    expect(isOverLimit({ width: 1921, height: 1080 }, hero)).toBe(true);
    expect(isOverLimit({ width: 1920, height: 1081 }, hero)).toBe(true);
  });

  it('treats portrait about images under 1200x1500 as allowed', () => {
    const about = getLimit('about');
    expect(isOverLimit({ width: 1200, height: 1500 }, about)).toBe(false);
    expect(isOverLimit({ width: 1200, height: 1501 }, about)).toBe(true);
  });
});

describe('storage', () => {
  const SUPABASE_URL = 'https://xyz.supabase.co';

  beforeEach(() => {
    jest.resetModules();
    process.env.SUPABASE_URL = SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    process.env.SUPABASE_STORAGE_BUCKET = 'images';
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_STORAGE_BUCKET;
  });

  it('uploads the buffer and returns the public URL', async () => {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/images/pic.jpg`;
    const upload = jest.fn().mockResolvedValue({ error: null });
    const getPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl } });
    const from = jest.fn().mockReturnValue({ upload, getPublicUrl });

    jest.doMock('@supabase/supabase-js', () => ({
      createClient: jest.fn(() => ({ storage: { from } })),
    }));

    const { uploadImage } = require('../lib/storage');
    const result = await uploadImage(Buffer.from('fake-image-bytes'), {
      contentType: 'image/jpeg',
      originalName: 'pic.jpg',
    });

    expect(result.url).toBe(publicUrl);
    expect(from).toHaveBeenCalledWith('images');
    expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^images\/[0-9a-f-]+\.jpg$/), Buffer.from('fake-image-bytes'), {
      contentType: 'image/jpeg',
      upsert: false,
    });
    expect(getPublicUrl).toHaveBeenCalled();
  });

  it('throws a wrapped error when the storage upload fails', async () => {
    const upload = jest.fn().mockResolvedValue({ error: { message: 'bucket not found', statusCode: 404 } });
    const from = jest.fn().mockReturnValue({ upload });

    jest.doMock('@supabase/supabase-js', () => ({
      createClient: jest.fn(() => ({ storage: { from } })),
    }));

    const { uploadImage } = require('../lib/storage');
    await expect(uploadImage(Buffer.from('x'), {})).rejects.toThrow(
      'Supabase upload failed: bucket not found'
    );
  });

  it('throws when required env vars are missing', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { uploadImage } = require('../lib/storage');
    return expect(uploadImage(Buffer.from('x'), {})).rejects.toThrow(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
    );
  });

  it('generates a path that keeps the original extension', () => {
    const { generatePath } = require('../lib/storage');
    expect(generatePath('photo.PNG')).toMatch(/^images\/[0-9a-f-]{36}\.png$/);
    expect(generatePath('no-ext')).toMatch(/^images\/[0-9a-f-]{36}\.jpg$/);
  });
});
