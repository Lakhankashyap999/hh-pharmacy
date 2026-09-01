import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding H&H Pharmacy database...')

  // Create Admin
  const hashedPassword = await bcrypt.hash('HHPharmacy@2024', 12)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@hhpharmacy.in' },
    update: {},
    create: {
      name: 'Nishant Choudhary',
      email: 'admin@hhpharmacy.in',
      passwordHash: hashedPassword,
      phone: '7827558443',
      role: 'owner',
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: 'Pain Relief', nameHindi: 'दर्द निवारक', icon: '💊', color: '#EF4444', sortOrder: 1 } }),
    prisma.category.upsert({ where: { id: 2 }, update: {}, create: { id: 2, name: 'Fever & Cold', nameHindi: 'बुखार और सर्दी', icon: '🤒', color: '#F59E0B', sortOrder: 2 } }),
    prisma.category.upsert({ where: { id: 3 }, update: {}, create: { id: 3, name: 'Antibiotics', nameHindi: 'एंटीबायोटिक', icon: '🧬', color: '#8B5CF6', sortOrder: 3 } }),
    prisma.category.upsert({ where: { id: 4 }, update: {}, create: { id: 4, name: 'Vitamins & Nutrition', nameHindi: 'विटामिन और पोषण', icon: '🌿', color: '#10B981', sortOrder: 4 } }),
    prisma.category.upsert({ where: { id: 5 }, update: {}, create: { id: 5, name: 'Digestive Care', nameHindi: 'पाचन देखभाल', icon: '🫁', color: '#3B82F6', sortOrder: 5 } }),
    prisma.category.upsert({ where: { id: 6 }, update: {}, create: { id: 6, name: 'Skin Care', nameHindi: 'त्वचा देखभाल', icon: '🧴', color: '#EC4899', sortOrder: 6 } }),
    prisma.category.upsert({ where: { id: 7 }, update: {}, create: { id: 7, name: 'Baby Care', nameHindi: 'बच्चों की देखभाल', icon: '👶', color: '#F97316', sortOrder: 7 } }),
    prisma.category.upsert({ where: { id: 8 }, update: {}, create: { id: 8, name: 'Ayurvedic', nameHindi: 'आयुर्वेदिक', icon: '🌱', color: '#84CC16', sortOrder: 8 } }),
    prisma.category.upsert({ where: { id: 9 }, update: {}, create: { id: 9, name: 'Diabetes Care', nameHindi: 'मधुमेह देखभाल', icon: '🩸', color: '#06B6D4', sortOrder: 9 } }),
    prisma.category.upsert({ where: { id: 10 }, update: {}, create: { id: 10, name: 'Heart & BP', nameHindi: 'हृदय और रक्तचाप', icon: '❤️', color: '#DC2626', sortOrder: 10 } }),
    prisma.category.upsert({ where: { id: 11 }, update: {}, create: { id: 11, name: 'Eye & Ear', nameHindi: 'आंख और कान', icon: '👁️', color: '#7C3AED', sortOrder: 11 } }),
    prisma.category.upsert({ where: { id: 12 }, update: {}, create: { id: 12, name: 'Surgical & Devices', nameHindi: 'सर्जिकल', icon: '🩹', color: '#64748B', sortOrder: 12 } }),
  ])
  console.log('✅ Categories created:', categories.length)

  // Create Medicines with real Indian pharmacy medicines
  const medicines = [
    // Pain Relief
    {
      name: 'Crocin 650mg Tablet',
      nameHindi: 'क्रोसिन 650mg टैबलेट',
      genericName: 'Paracetamol 650mg',
      brand: 'Crocin',
      manufacturer: 'GSK Pharma',
      description: 'Crocin 650 tablet is used to treat fever and relieve mild to moderate pain including headache, muscle pain, toothache, and body pain.',
      usageInstructions: 'Take 1 tablet every 4-6 hours. Do not exceed 4 tablets (2600mg) in 24 hours. Can be taken with or without food.',
      sideEffects: 'Generally well-tolerated. Rare: nausea, skin rash. Overdose can cause liver damage.',
      mrp: 100, sellingPrice: 85, discountPercent: 15,
      unitType: 'strip', unitsPerPack: 15,
      drugSchedule: 'OTC', categoryId: 1, imageUrl: null,
    },
    {
      name: 'Dolo 650mg Tablet',
      nameHindi: 'डोलो 650mg टैबलेट',
      genericName: 'Paracetamol 650mg',
      brand: 'Dolo',
      manufacturer: 'Micro Labs Ltd',
      description: 'Dolo 650 is a paracetamol tablet used for fever and mild to moderate pain. One of the most prescribed medicines in India.',
      usageInstructions: 'Take 1 tablet every 4-6 hours when required. Maximum 4 tablets per day.',
      sideEffects: 'Nausea, vomiting (rare). Do not use with alcohol.',
      mrp: 35, sellingPrice: 30, discountPercent: 14,
      unitType: 'strip', unitsPerPack: 15,
      drugSchedule: 'OTC', categoryId: 1, imageUrl: null,
    },
    {
      name: 'Combiflam Tablet',
      nameHindi: 'कॉम्बीफ्लाम टैबलेट',
      genericName: 'Ibuprofen 400mg + Paracetamol 325mg',
      brand: 'Combiflam',
      manufacturer: 'Sanofi India',
      description: 'Combiflam is used for fever, headache, toothache, muscle pain, joint pain, and menstrual pain. Combination of ibuprofen and paracetamol.',
      usageInstructions: 'Take 1-2 tablets with food every 4-6 hours. Do not exceed 3 doses per day.',
      sideEffects: 'Stomach upset, nausea. Avoid in kidney/liver disease, peptic ulcer.',
      mrp: 110, sellingPrice: 95, discountPercent: 14,
      unitType: 'strip', unitsPerPack: 20,
      drugSchedule: 'OTC', categoryId: 1, imageUrl: null,
    },
    {
      name: 'Volini Gel 30g',
      nameHindi: 'वोलिनी जेल 30g',
      genericName: 'Diclofenac + Methyl Salicylate + Menthol',
      brand: 'Volini',
      manufacturer: 'Sun Pharma',
      description: 'Volini gel provides fast relief from joint pain, muscle pain, back pain, and sports injuries with its unique 3-in-1 formula.',
      usageInstructions: 'Apply a thin layer on affected area and gently massage 3-4 times daily.',
      sideEffects: 'Skin irritation, redness (rare). Avoid contact with eyes.',
      mrp: 165, sellingPrice: 140, discountPercent: 15,
      unitType: 'tube', unitsPerPack: 1,
      drugSchedule: 'OTC', categoryId: 1, imageUrl: null,
    },
    // Fever & Cold
    {
      name: 'Sinarest Tablet',
      nameHindi: 'सिनारेस्ट टैबलेट',
      genericName: 'Paracetamol + Phenylephrine + Chlorpheniramine',
      brand: 'Sinarest',
      manufacturer: 'Centaur Pharmaceuticals',
      description: 'Sinarest is used for symptomatic relief of cold, runny nose, nasal congestion, body ache, and fever associated with common cold.',
      usageInstructions: 'Take 1 tablet 3-4 times a day after meals. Avoid driving as it may cause drowsiness.',
      sideEffects: 'Drowsiness, dry mouth, blurred vision. Avoid alcohol.',
      mrp: 42, sellingPrice: 36, discountPercent: 14,
      unitType: 'strip', unitsPerPack: 10,
      drugSchedule: 'OTC', categoryId: 2, imageUrl: null,
    },
    {
      name: 'Vicks VapoRub 50ml',
      nameHindi: 'विक्स वेपोरब 50ml',
      genericName: 'Camphor + Menthol + Eucalyptus Oil',
      brand: 'Vicks VapoRub',
      manufacturer: 'Procter & Gamble',
      description: 'Vicks VapoRub is an ointment used for temporary relief of cough and nasal congestion due to common cold.',
      usageInstructions: 'Rub on chest, throat, and back. Can also be used in hot water for steam inhalation.',
      sideEffects: 'Do not apply near eyes or inside nose. Keep away from children under 2 years.',
      mrp: 95, sellingPrice: 80, discountPercent: 16,
      unitType: 'bottle', unitsPerPack: 1,
      drugSchedule: 'OTC', categoryId: 2, imageUrl: null,
    },
    // Antibiotics (Schedule H)
    {
      name: 'Amoxicillin 500mg Capsule',
      nameHindi: 'अमोक्सिसिलिन 500mg कैप्सूल',
      genericName: 'Amoxicillin 500mg',
      brand: 'Mox',
      manufacturer: 'Ranbaxy/Sun Pharma',
      description: 'Amoxicillin is a penicillin antibiotic used to treat bacterial infections including throat infection, ear infection, urinary tract infection, and pneumonia.',
      usageInstructions: 'Take as prescribed by doctor. Usually 500mg every 8 hours for 5-7 days. Complete the full course.',
      sideEffects: 'Diarrhea, nausea, skin rash. Allergic reaction possible in penicillin-sensitive patients.',
      mrp: 120, sellingPrice: 102, discountPercent: 15,
      unitType: 'strip', unitsPerPack: 10,
      drugSchedule: 'H', requiresPrescription: true, categoryId: 3, imageUrl: null,
    },
    {
      name: 'Azithromycin 500mg Tablet',
      nameHindi: 'एज़िथ्रोमाइसिन 500mg टैबलेट',
      genericName: 'Azithromycin 500mg',
      brand: 'Azithral',
      manufacturer: 'Alembic Pharmaceuticals',
      description: 'Azithromycin is a macrolide antibiotic used for respiratory tract infections, skin infections, ear infections, and sexually transmitted diseases.',
      usageInstructions: 'Take 1 tablet daily for 3-5 days as prescribed. Take 1 hour before or 2 hours after meals.',
      sideEffects: 'Nausea, diarrhea, stomach pain. Rare: heart rhythm problems.',
      mrp: 85, sellingPrice: 72, discountPercent: 15,
      unitType: 'strip', unitsPerPack: 5,
      drugSchedule: 'H', requiresPrescription: true, categoryId: 3, imageUrl: null,
    },
    // Vitamins
    {
      name: 'Limcee 500mg Chewable Tablet',
      nameHindi: 'लिमसी 500mg चबाने वाली टैबलेट',
      genericName: 'Ascorbic Acid (Vitamin C) 500mg',
      brand: 'Limcee',
      manufacturer: 'Abbott India',
      description: 'Limcee provides Vitamin C which acts as an antioxidant, boosts immunity, helps in iron absorption, and promotes collagen synthesis.',
      usageInstructions: 'Chew 1 tablet daily or as directed by physician. Can be taken with or without food.',
      sideEffects: 'Generally safe. High doses may cause diarrhea, kidney stones.',
      mrp: 55, sellingPrice: 47, discountPercent: 15,
      unitType: 'strip', unitsPerPack: 15,
      drugSchedule: 'OTC', categoryId: 4, imageUrl: null,
    },
    {
      name: 'Becosules Capsule',
      nameHindi: 'बेकोसूल्स कैप्सूल',
      genericName: 'Vitamin B Complex + Vitamin C',
      brand: 'Becosules',
      manufacturer: 'Pfizer India',
      description: 'Becosules is a multivitamin capsule containing Vitamin B complex and Vitamin C. Used for nutritional deficiencies, mouth ulcers, and weakness.',
      usageInstructions: 'Take 1 capsule daily after meals. Can be taken long-term.',
      sideEffects: 'Urine may turn yellow (harmless). Rare: stomach upset.',
      mrp: 125, sellingPrice: 106, discountPercent: 15,
      unitType: 'strip', unitsPerPack: 20,
      drugSchedule: 'OTC', categoryId: 4, imageUrl: null,
    },
    // Digestive
    {
      name: 'Digene Gel 200ml',
      nameHindi: 'डाइजीन जेल 200ml',
      genericName: 'Magnesium Hydroxide + Aluminium Hydroxide',
      brand: 'Digene',
      manufacturer: 'Abbott India',
      description: 'Digene is an antacid used for relief from acidity, heartburn, stomach pain, bloating and gas. Available in gel and tablet form.',
      usageInstructions: 'Take 2 teaspoons (10ml) after meals and at bedtime. Shake well before use.',
      sideEffects: 'Constipation or diarrhea with prolonged use. Do not use in kidney disease.',
      mrp: 135, sellingPrice: 115, discountPercent: 15,
      unitType: 'bottle', unitsPerPack: 1,
      drugSchedule: 'OTC', categoryId: 5, imageUrl: null,
    },
    {
      name: 'Hajmola Regular 120 Tablets',
      nameHindi: 'हाजमोला रेगुलर 120 टैबलेट',
      genericName: 'Digestive Herbs & Salts',
      brand: 'Hajmola',
      manufacturer: 'Dabur India',
      description: 'Hajmola is an Ayurvedic digestive tablet that provides relief from indigestion, loss of appetite, flatulence, and stomach discomfort.',
      usageInstructions: 'Chew 1-2 tablets after meals. Can be taken 3 times a day.',
      sideEffects: 'Generally safe. Not for children below 3 years.',
      mrp: 50, sellingPrice: 42, discountPercent: 16,
      unitType: 'bottle', unitsPerPack: 1,
      drugSchedule: 'OTC', categoryId: 5, imageUrl: null,
    },
    // Skin Care
    {
      name: 'Betadine 5% Ointment 20g',
      nameHindi: 'बेटाडाइन 5% ऑइंटमेंट 20g',
      genericName: 'Povidone Iodine 5%',
      brand: 'Betadine',
      manufacturer: 'Win-Medicare',
      description: 'Betadine ointment is an antiseptic used for wound care, cuts, burns, and skin infections. Kills bacteria, fungi, and viruses.',
      usageInstructions: 'Apply directly to affected area 1-2 times daily. Clean wound before application.',
      sideEffects: 'Skin irritation in some people. Avoid in thyroid disorders.',
      mrp: 80, sellingPrice: 68, discountPercent: 15,
      unitType: 'tube', unitsPerPack: 1,
      drugSchedule: 'OTC', categoryId: 6, imageUrl: null,
    },
    // Baby Care
    {
      name: 'Calpol 250mg Suspension 60ml',
      nameHindi: 'कैलपोल 250mg सस्पेंशन 60ml',
      genericName: 'Paracetamol 250mg/5ml',
      brand: 'Calpol',
      manufacturer: 'GSK Pharma',
      description: 'Calpol pediatric suspension is used for fever and mild to moderate pain in children. Safe and effective for infants and children.',
      usageInstructions: 'Dose based on weight/age as per doctor advice. Shake well before use.',
      sideEffects: 'Generally safe when used as directed. Allergic reactions rare.',
      mrp: 52, sellingPrice: 44, discountPercent: 15,
      unitType: 'bottle', unitsPerPack: 1,
      drugSchedule: 'OTC', categoryId: 7, imageUrl: null,
    },
    // Ayurvedic
    {
      name: 'Dabur Chyawanprash 1kg',
      nameHindi: 'डाबर च्यवनप्राश 1kg',
      genericName: 'Chyawanprash Avaleha',
      brand: 'Dabur',
      manufacturer: 'Dabur India Ltd',
      description: 'Dabur Chyawanprash is a traditional Ayurvedic health supplement that boosts immunity, provides energy, and promotes overall wellness with 41 natural herbs.',
      usageInstructions: 'Take 1-2 teaspoons twice daily with milk or water.',
      sideEffects: 'Generally safe. Diabetic patients should consult doctor.',
      mrp: 290, sellingPrice: 246, discountPercent: 15,
      unitType: 'bottle', unitsPerPack: 1,
      drugSchedule: 'OTC', categoryId: 8, imageUrl: null,
    },
    {
      name: 'Patanjali Ashwagandha Capsule',
      nameHindi: 'पतंजलि अश्वगंधा कैप्सूल',
      genericName: 'Withania Somnifera Extract',
      brand: 'Patanjali',
      manufacturer: 'Patanjali Ayurved Ltd',
      description: 'Ashwagandha capsules help reduce stress and anxiety, improve energy levels, enhance concentration and cognitive function, and boost immunity.',
      usageInstructions: 'Take 1-2 capsules twice daily with warm milk or water.',
      sideEffects: 'Generally safe. May cause stomach upset in some. Avoid in pregnancy.',
      mrp: 120, sellingPrice: 102, discountPercent: 15,
      unitType: 'strip', unitsPerPack: 20,
      drugSchedule: 'OTC', categoryId: 8, imageUrl: null,
    },
    // Diabetes
    {
      name: 'Metformin 500mg Tablet',
      nameHindi: 'मेटफॉर्मिन 500mg टैबलेट',
      genericName: 'Metformin Hydrochloride 500mg',
      brand: 'Glycomet',
      manufacturer: 'USV Pvt Ltd',
      description: 'Metformin is the first-line medication for Type 2 diabetes. It reduces blood sugar levels and is also used in PCOD/PCOS management.',
      usageInstructions: 'Take as directed by doctor. Usually with meals to reduce stomach upset.',
      sideEffects: 'Nausea, diarrhea (common initially). Rare: lactic acidosis. Monitor kidney function.',
      mrp: 38, sellingPrice: 32, discountPercent: 15,
      unitType: 'strip', unitsPerPack: 10,
      drugSchedule: 'H', requiresPrescription: true, categoryId: 9, imageUrl: null,
    },
    // Heart & BP
    {
      name: 'Amlodipine 5mg Tablet',
      nameHindi: 'एम्लोडिपाइन 5mg टैबलेट',
      genericName: 'Amlodipine Besylate 5mg',
      brand: 'Amlokind',
      manufacturer: 'Mankind Pharma',
      description: 'Amlodipine is a calcium channel blocker used to treat high blood pressure (hypertension) and chest pain (angina). Helps prevent heart attacks and strokes.',
      usageInstructions: 'Take 1 tablet daily as prescribed by doctor. Same time each day.',
      sideEffects: 'Ankle swelling, flushing, dizziness. Do not stop suddenly.',
      mrp: 55, sellingPrice: 47, discountPercent: 15,
      unitType: 'strip', unitsPerPack: 10,
      drugSchedule: 'H', requiresPrescription: true, categoryId: 10, imageUrl: null,
    },
    // Eye & Ear
    {
      name: 'Otrivin Nasal Drops 10ml',
      nameHindi: 'ओट्रिविन नेजल ड्रॉप्स 10ml',
      genericName: 'Xylometazoline 0.1%',
      brand: 'Otrivin',
      manufacturer: 'Novartis India',
      description: 'Otrivin nasal drops provide fast relief from nasal congestion, stuffy nose, and blocked nose due to common cold, sinusitis, and allergies.',
      usageInstructions: '2-3 drops in each nostril 2-3 times daily. Do not use for more than 3 days continuously.',
      sideEffects: 'Burning, stinging sensation. Rebound congestion with prolonged use.',
      mrp: 62, sellingPrice: 53, discountPercent: 15,
      unitType: 'bottle', unitsPerPack: 1,
      drugSchedule: 'OTC', categoryId: 11, imageUrl: null,
    },
    // Surgical
    {
      name: 'Band-Aid Classic Strips 10s',
      nameHindi: 'बैंड-एड क्लासिक स्ट्रिप्स 10s',
      genericName: 'Adhesive Bandage',
      brand: 'Band-Aid',
      manufacturer: 'Johnson & Johnson',
      description: 'Band-Aid adhesive bandages protect cuts, scrapes, and blisters. Water-resistant, breathable material keeps wounds clean.',
      usageInstructions: 'Clean wound, dry thoroughly, and apply Band-Aid. Change daily or when wet/dirty.',
      sideEffects: 'Skin irritation in some. Not for deep wounds.',
      mrp: 65, sellingPrice: 55, discountPercent: 15,
      unitType: 'strip', unitsPerPack: 1,
      drugSchedule: 'OTC', categoryId: 12, imageUrl: null,
    },
    {
      name: 'Glucometer Strips OneTouch 25s',
      nameHindi: 'ग्लूकोमीटर स्ट्रिप्स वनटच 25s',
      genericName: 'Blood Glucose Test Strip',
      brand: 'OneTouch Select Plus',
      manufacturer: 'Johnson & Johnson',
      description: 'Blood glucose test strips compatible with OneTouch Select Plus glucometers. For self-monitoring of blood glucose in diabetes patients.',
      usageInstructions: 'Insert strip in glucometer, apply blood sample from fingertip. Read result in 5 seconds.',
      sideEffects: 'N/A - diagnostic device',
      mrp: 550, sellingPrice: 468, discountPercent: 15,
      unitType: 'bottle', unitsPerPack: 1,
      drugSchedule: 'OTC', categoryId: 9, imageUrl: null,
    },
  ]

  for (const med of medicines) {
    const existing = await prisma.medicine.findFirst({ where: { name: med.name } })
    if (!existing) {
      const created = await prisma.medicine.create({ data: med })
      // Create a batch for each medicine
      await prisma.medicineBatch.create({
        data: {
          medicineId: created.id,
          batchNumber: `BATCH-${created.id.toString().padStart(4, '0')}-2024`,
          expiryDate: new Date('2027-06-30'),
          totalQuantity: 200,
          currentQuantity: 200,
          purchasePrice: med.sellingPrice * 0.7,
        },
      })
      // Create location
      const shelves = ['Shelf A', 'Shelf B', 'Shelf C', 'Counter Shelf']
      const racks = ['Rack 1', 'Rack 2', 'Rack 3']
      const sections = ['Top', 'Middle', 'Bottom']
      const covers = ['Blue Cover', 'Green Label', 'Red Label', 'Yellow Tag', 'White Tray']
      await prisma.medicineLocation.create({
        data: {
          medicineId: created.id,
          shelfLabel: shelves[Math.floor(Math.random() * shelves.length)],
          rackNumber: racks[Math.floor(Math.random() * racks.length)],
          section: sections[Math.floor(Math.random() * sections.length)],
          coverLabel: covers[Math.floor(Math.random() * covers.length)],
        },
      })
    }
  }
  console.log('✅ Medicines seeded:', medicines.length)
  console.log('\n🎉 Database seeded successfully!')
  console.log('📧 Admin email: admin@hhpharmacy.in')
  console.log('🔑 Admin password: HHPharmacy@2024')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
