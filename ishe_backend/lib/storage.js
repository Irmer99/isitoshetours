const crypto = require('crypto');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

let client;

function getClient() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }
    client = createClient(url, serviceRoleKey);
  }
  return client;
}

function getBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'images';
}

function generatePath(originalName) {
  const ext = path.extname(originalName || '').toLowerCase() || '.jpg';
  return `images/${crypto.randomUUID()}${ext}`;
}

async function uploadImage(buffer, { contentType, originalName }) {
  const supabase = getClient();
  const bucket = getBucket();
  const filePath = generatePath(originalName);

  const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
    contentType: contentType || 'application/octet-stream',
    upsert: false,
  });
  if (error) {
    const wrapped = new Error(`Supabase upload failed: ${error.message}`);
    wrapped.status = error.statusCode || 500;
    throw wrapped;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { url: data.publicUrl };
}

module.exports = { getClient, getBucket, generatePath, uploadImage };
