// db/seed.js
// Seeds the database with the specialists/hospitals already shown on the
// existing frontend (so GET endpoints return data matching what the UI
// currently hardcodes) and creates one initial admin account.
//
// Usage: npm run seed   (after schema.sql has been applied)

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const specialists = [
  { slug: 'cardiologist',    name: 'Cardiologist',          icon: 'fa-heart-pulse',     description: 'Specialist in heart and blood vessel diseases.' },
  { slug: 'dermatologist',   name: 'Dermatologist',         icon: 'fa-hand-dots',       description: 'Specialist in skin, hair, and nail conditions.' },
  { slug: 'neurologist',     name: 'Neurologist',           icon: 'fa-brain',           description: 'Specialist in disorders of the brain and nervous system.' },
  { slug: 'ent',             name: 'ENT Specialist',        icon: 'fa-ear-listen',      description: 'Specialist in ear, nose, and throat conditions.' },
  { slug: 'gastro',          name: 'Gastroenterologist',    icon: 'fa-stomach',         description: 'Specialist in digestive system disorders.' },
  { slug: 'gp',              name: 'General Practitioner',  icon: 'fa-user-doctor',     description: 'Primary care for a broad range of conditions.' },
];

const hospitals = [
  { slug: 'luth',       name: 'Lagos University Teaching Hospital (LUTH)', state: 'Lagos',  specialists: ['cardiologist', 'gp', 'neurologist'] },
  { slug: 'reddington', name: 'Reddington Hospital',                       state: 'Lagos',  specialists: ['cardiologist', 'dermatologist', 'gp'] },
  { slug: 'stnicholas', name: 'St. Nicholas Hospital',                     state: 'Lagos',  specialists: ['gp', 'gastro', 'ent'] },
  { slug: 'national',   name: 'National Hospital Abuja',                   state: 'Abuja',  specialists: ['cardiologist', 'neurologist', 'gp'] },
  { slug: 'garki',      name: 'Garki Hospital',                            state: 'Abuja',  specialists: ['gp', 'ent'] },
  { slug: 'cedarcrest', name: 'Cedarcrest Hospitals',                      state: 'Abuja',  specialists: ['dermatologist', 'gastro', 'gp'] },
];

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('Seeding specialists...');
    const specialistIds = {};
    for (const s of specialists) {
      await conn.query(
        `INSERT INTO specialists (slug, name, description, icon)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), icon = VALUES(icon)`,
        [s.slug, s.name, s.description, s.icon]
      );
      const [[row]] = await conn.query('SELECT id FROM specialists WHERE slug = ?', [s.slug]);
      specialistIds[s.slug] = row.id;
    }

    console.log('Seeding hospitals...');
    for (const h of hospitals) {
      await conn.query(
        `INSERT INTO hospitals (slug, name, state, is_verified, is_active)
         VALUES (?, ?, ?, 1, 1)
         ON DUPLICATE KEY UPDATE name = VALUES(name), state = VALUES(state)`,
        [h.slug, h.name, h.state]
      );
      const [[row]] = await conn.query('SELECT id FROM hospitals WHERE slug = ?', [h.slug]);
      const hospitalId = row.id;

      for (const specSlug of h.specialists) {
        const specialistId = specialistIds[specSlug];
        if (!specialistId) continue;
        await conn.query(
          `INSERT IGNORE INTO hospital_specialists (hospital_id, specialist_id) VALUES (?, ?)`,
          [hospitalId, specialistId]
        );
      }
    }

    console.log('Seeding initial admin...');
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@medexpert.local';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
    const adminName = process.env.SEED_ADMIN_NAME || 'Super Admin';

    const [[existingAdmin]] = await conn.query('SELECT id FROM admins WHERE email = ?', [adminEmail]);
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
      await conn.query(
        `INSERT INTO admins (full_name, email, password_hash, role, is_active)
         VALUES (?, ?, ?, 'super_admin', 1)`,
        [adminName, adminEmail, passwordHash]
      );
      console.log(`Admin created: ${adminEmail} (change the password after first login)`);
    } else {
      console.log('Admin already exists, skipping.');
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
