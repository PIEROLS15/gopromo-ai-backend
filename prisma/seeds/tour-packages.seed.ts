import { PrismaClient } from '@prisma/client';
import { resetSequence } from './shared/reset-sequence';

export async function seedTourPackages(prisma: PrismaClient) {
  console.log('🌱 Seeding tour packages...');

  await prisma.tourImage.deleteMany();
  await prisma.tourPackage.deleteMany();

  await resetSequence(prisma, 'TourPackage_id_seq');
  await resetSequence(prisma, 'TourImage_id_seq');

  const suppliers = await prisma.supplier.findMany();
  const districts = await prisma.district.findMany({ take: 10 });
  const categories = await prisma.categoryPackage.findMany();
  const educationLevels = await prisma.educationLevel.findMany();

  if (
    suppliers.length === 0 ||
    districts.length === 0 ||
    categories.length === 0 ||
    educationLevels.length === 0
  ) {
    throw new Error(
      'Missing dependencies for tour packages seed. Seed suppliers, districts, categories and education levels first.',
    );
  }

  const tourPackagesData = [
    {
      name: 'Aventura en Machu Picchu',
      description:
        'Un viaje inolvidable a la ciudadela inca con guía especializado.',
      pricePersona: 450.0,
      activities: ['Caminata', 'Fotografía', 'Historia'],
      includes: ['Entradas', 'Transporte', 'Almuerzo'],
    },
    {
      name: 'Exploración Cañón del Colca',
      description:
        'Avistamiento de cóndores y baños termales en el corazón de Arequipa.',
      pricePersona: 280.0,
      activities: ['Observación de aves', 'Caminata', 'Relajación'],
      includes: ['Guía', 'Transporte', 'Desayuno'],
    },
    {
      name: 'Selva Mágica Iquitos',
      description:
        'Navegación por el Amazonas y encuentro con comunidades locales.',
      pricePersona: 520.0,
      activities: ['Navegación', 'Pesca', 'Caminata nocturna'],
      includes: ['Alojamiento', 'Alimentación completa', 'Traslados'],
    },
    {
      name: 'Ruta del Sol Puno',
      description:
        'Visita a las islas flotantes de los Uros y la isla de Taquile.',
      pricePersona: 310.0,
      activities: ['Navegación', 'Artesanía', 'Cultura viva'],
      includes: ['Lancha rápida', 'Guía bilingüe', 'Almuerzo típico'],
    },
    {
      name: 'Paracas & Huacachina Express',
      description: 'Sandboarding en las dunas y tour en las Islas Ballestas.',
      pricePersona: 190.0,
      activities: ['Buggy', 'Sandboard', 'Observación marina'],
      includes: ['Equipos deportivos', 'Transporte', 'Seguro de viaje'],
    },
    {
      name: 'Caminata Laguna 69',
      description:
        'Reto físico en el Parque Nacional Huascarán con vistas glaciares.',
      pricePersona: 150.0,
      activities: ['Trekking de altura', 'Fotografía de paisajes'],
      includes: ['Box lunch', 'Guía de montaña', 'Botiquín'],
    },
    {
      name: 'Chan Chan & Huanchaco',
      description: 'Recorrido por la ciudad de barro más grande de América.',
      pricePersona: 120.0,
      activities: ['Arqueología', 'Surf', 'Gastronomía'],
      includes: ['Entradas museos', 'Transporte local', 'Cata de ceviche'],
    },
    {
      name: 'Kuelap: La Fortaleza en el Cielo',
      description:
        'Viaje en teleférico hacia la impresionante fortaleza Chachapoyas.',
      pricePersona: 380.0,
      activities: ['Arqueología', 'Caminata ligera', 'Teleférico'],
      includes: ['Boletos teleférico', 'Guía experto', 'Traslados'],
    },
    {
      name: 'Valle Sagrado de los Incas',
      description: 'Pisac, Ollantaytambo y Chinchero en un solo día.',
      pricePersona: 220.0,
      activities: ['Mercado artesanal', 'Historia', 'Cultura'],
      includes: ['Transporte turístico', 'Almuerzo buffet', 'Guía'],
    },
    {
      name: 'Aventura en Lunahuaná',
      description: 'Canotaje y cata de vino en el valle de Cañete.',
      pricePersona: 140.0,
      activities: ['Canotaje', 'Rapel', 'Cata de vinos'],
      includes: ['Equipos de seguridad', 'Instructores', 'Transporte'],
    },
  ];

  for (let i = 0; i < 10; i++) {
    const pkgData = tourPackagesData[i];
    await prisma.tourPackage.create({
      data: {
        name: pkgData.name,
        description: pkgData.description,
        pricePersona: pkgData.pricePersona,
        days: 2 + (i % 5),
        minStudents: 5 + (i % 6),
        activities: pkgData.activities,
        includes: pkgData.includes,
        active: true,
        supplierId: suppliers[i % suppliers.length].id,
        districtId: districts[i % districts.length].id,
        categoryPackageId: categories[i % categories.length].id,
        educationLevelId: educationLevels[i % educationLevels.length].id,
        images: {
          create: [
            {
              url: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=800&q=80`,
            },
          ],
        },
      },
    });
  }

  console.log('✅ 10 Tour packages seeded successfully with images');
}
