// ─── Firebase Admin Seed Script (CommonJS) ─────────────────────────────────────
// Run on Windows CMD/PowerShell:
//
//   set FIREBASE_PROJECT_ID=your-project-id
//   set FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
//   set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
//   node scripts/seedCourses.cjs
//
// How to get credentials: Firebase Console > Project Settings > Service Accounts > Generate new private key

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// ── Load Environment Variables via Next.js Utility ───────────────────────────
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(path.join(__dirname, '..'));

// ── Init ──────────────────────────────────────────────────────────────────────
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey && privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.slice(1, -1);
}
privateKey = privateKey?.replace(/\\n/g, '\n');

if (!privateKey || !process.env.FIREBASE_PROJECT_ID) {
  console.error('❌ Missing env vars. Copy .env.example to .env and fill in Firebase Admin credentials.');
  console.error('   Get them from: Firebase Console > Project Settings > Service Accounts > Generate new private key');
  process.exit(1);
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});

const db = getFirestore(app);

// ── Course data from JSON ──────────────────────────────────────────────────────
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'courseData.json'), 'utf8')
);

const malaysianUniversityCourses = data.universities;

// ── Upload ───────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🚀 Firestore seed — Malaysia Courses\n');
  console.log(`Project: ${process.env.FIREBASE_PROJECT_ID}\n`);

  const mode = process.argv[2];
  if (mode === '--clear') {
    console.log('Clearing existing data...');
    const snap = await db.collection('malaysiaCourses').get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    console.log(`Cleared ${snap.size} docs.\n`);
  }

  for (const uni of malaysianUniversityCourses) {
    const uniRef = db.collection('malaysiaCourses').doc(uni.universityId);
    await uniRef.set({
      universityId: uni.universityId,
      universityName: uni.universityName,
      programs: uni.programs,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const totalCourses = uni.programs.reduce((s, p) => s + p.courses.length, 0);
    console.log(`  ✓ ${uni.universityName} — ${uni.programs.length} programs, ${totalCourses} courses`);
  }

  const totalCourses = malaysianUniversityCourses.reduce(
    (s, u) => s + u.programs.reduce((ss, p) => ss + p.courses.length, 0), 0,
  );
  console.log(`\n✅ Seeded ${malaysianUniversityCourses.length} universities, ${totalCourses} courses total.\n`);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
