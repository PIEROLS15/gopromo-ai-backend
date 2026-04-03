import { PrismaClient } from '@prisma/client';
import { resetSequence } from './shared/reset-sequence';

function toSeedTime(hour: string): Date {
  const [h, m] = hour.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m, 0));
}

export async function seedTourPackages(prisma: PrismaClient) {
  console.log('🌱 Seeding tour packages...');

  await prisma.tourImage.deleteMany();
  await prisma.tourPackage.deleteMany();

  await resetSequence(prisma, 'TourPackage_id_seq');
  await resetSequence(prisma, 'TourImage_id_seq');
  await resetSequence(prisma, 'TourItineraryDay_id_seq');
  await resetSequence(prisma, 'TourItineraryStep_id_seq');

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
      services: {
        travelInsurance: true,
        transport: true,
        feeding: true,
        lodging: false,
      },
    },
    {
      name: 'Exploración Cañón del Colca',
      description:
        'Avistamiento de cóndores y baños termales en el corazón de Arequipa.',
      pricePersona: 280.0,
      services: {
        travelInsurance: true,
        transport: true,
        feeding: false,
        lodging: false,
      },
    },
    {
      name: 'Selva Mágica Iquitos',
      description:
        'Navegación por el Amazonas y encuentro con comunidades locales.',
      pricePersona: 520.0,
      services: {
        travelInsurance: true,
        transport: true,
        feeding: true,
        lodging: true,
      },
    },
    {
      name: 'Ruta del Sol Puno',
      description:
        'Visita a las islas flotantes de los Uros y la isla de Taquile.',
      pricePersona: 310.0,
      services: {
        travelInsurance: true,
        transport: true,
        feeding: true,
        lodging: false,
      },
    },
    {
      name: 'Paracas & Huacachina Express',
      description: 'Sandboarding en las dunas y tour en las Islas Ballestas.',
      pricePersona: 190.0,
      services: {
        travelInsurance: true,
        transport: true,
        feeding: false,
        lodging: false,
      },
    },
    {
      name: 'Caminata Laguna 69',
      description:
        'Reto físico en el Parque Nacional Huascarán con vistas glaciares.',
      pricePersona: 150.0,
      services: {
        travelInsurance: true,
        transport: true,
        feeding: true,
        lodging: false,
      },
    },
    {
      name: 'Chan Chan & Huanchaco',
      description: 'Recorrido por la ciudad de barro más grande de América.',
      pricePersona: 120.0,
      services: {
        travelInsurance: false,
        transport: true,
        feeding: false,
        lodging: false,
      },
    },
    {
      name: 'Kuelap: La Fortaleza en el Cielo',
      description:
        'Viaje en teleférico hacia la impresionante fortaleza Chachapoyas.',
      pricePersona: 380.0,
      services: {
        travelInsurance: true,
        transport: true,
        feeding: false,
        lodging: true,
      },
    },
    {
      name: 'Valle Sagrado de los Incas',
      description: 'Pisac, Ollantaytambo y Chinchero en un solo día.',
      pricePersona: 220.0,
      services: {
        travelInsurance: false,
        transport: true,
        feeding: true,
        lodging: false,
      },
    },
    {
      name: 'Aventura en Lunahuaná',
      description: 'Canotaje y cata de vino en el valle de Cañete.',
      pricePersona: 140.0,
      services: {
        travelInsurance: true,
        transport: true,
        feeding: false,
        lodging: false,
      },
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
        active: true,
        travelInsurance: pkgData.services.travelInsurance,
        transport: pkgData.services.transport,
        feeding: pkgData.services.feeding,
        lodging: pkgData.services.lodging,
        availableMonday: true,
        availableTuesday: true,
        availableWednesday: i % 2 === 0,
        availableThursday: true,
        availableFriday: true,
        availableSaturday: i % 3 !== 0,
        availableSunday: i % 4 === 0,
        supplierId: suppliers[i % suppliers.length].id,
        districtId: districts[i % districts.length].id,
        categoryPackageId: categories[i % categories.length].id,
        educationLevelId: educationLevels[i % educationLevels.length].id,
        itineraryDays: {
          create: [
            {
              day: 1,
              title: 'Dia 1 - Llegada y actividades principales',
              steps: {
                create: [
                  {
                    title: 'Recojo del punto de encuentro',
                    hour: toSeedTime('06:30'),
                    description: 'Inicio del traslado de pasajeros.',
                    order: 1,
                  },
                  {
                    title: 'Actividad central del recorrido',
                    hour: toSeedTime('10:00'),
                    description:
                      'Desarrollo de la actividad principal del paquete.',
                    order: 2,
                  },
                ],
              },
            },
            {
              day: 2,
              title: 'Dia 2 - Cierre y retorno',
              steps: {
                create: [
                  {
                    title: 'Actividad complementaria',
                    hour: toSeedTime('08:30'),
                    description: 'Actividad de cierre antes del retorno.',
                    order: 1,
                  },
                  {
                    title: 'Retorno al punto de origen',
                    hour: toSeedTime('16:00'),
                    description: 'Traslado de retorno y fin del servicio.',
                    order: 2,
                  },
                ],
              },
            },
          ],
        },
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

  console.log(
    '✅ 10 Tour packages seeded successfully with images and itinerary',
  );
}
