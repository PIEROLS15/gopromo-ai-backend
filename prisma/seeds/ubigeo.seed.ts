import { PrismaClient } from '@prisma/client';

type UbigeoDistrictApi = {
  ubigeo: string;
  id: number;
  inei: string;
};

type UbigeoProvinceApi = Record<string, UbigeoDistrictApi>;

type UbigeoDepartmentApi = Record<string, UbigeoProvinceApi>;

type UbigeoApiResponse = Record<string, UbigeoDepartmentApi>;

export async function seedUbigeo(prisma: PrismaClient) {
  console.log('🌱 Seeding ubigeo...');

  const response = await fetch('https://free.e-api.net.pe/ubigeos.json');
  const data: UbigeoApiResponse = await response.json();

  let newDepartments = 0;
  let newProvinces = 0;
  let newDistricts = 0;

  for (const [departmentName, provinces] of Object.entries(data)) {
    let department = await prisma.department.findUnique({
      where: { name: departmentName },
    });

    if (!department) {
      department = await prisma.department.create({
        data: { name: departmentName },
      });
      newDepartments++;
    }

    for (const [provinceName, districts] of Object.entries(provinces)) {
      let province = await prisma.province.findFirst({
        where: {
          name: provinceName,
          departmentId: department.id,
        },
      });

      if (!province) {
        province = await prisma.province.create({
          data: {
            name: provinceName,
            departmentId: department.id,
          },
        });
        newProvinces++;
      }

      for (const [districtName, info] of Object.entries(districts)) {
        if (!info.ubigeo || info.ubigeo === '000000') continue;

        const exists = await prisma.district.findUnique({
          where: { ubigeo: info.ubigeo },
        });

        if (exists) continue;

        await prisma.district.create({
          data: {
            name: districtName,
            ubigeo: info.ubigeo,
            inei: info.inei,
            provinceId: province.id,
          },
        });

        newDistricts++;
      }
    }
  }

  console.log(`✅ Ubigeo seed completo:
  - Departamentos nuevos: ${newDepartments}
  - Provincias nuevas: ${newProvinces}
  - Distritos nuevos: ${newDistricts}`);
}
