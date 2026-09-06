import { PrismaClient, UserRole, ContentType, ContentFormat } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Djeli\'S mock data...');

  // 1. Create Admins & Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const superadmin = await prisma.user.upsert({
    where: { email: 'chezdemba@gmail.com' },
    update: { role: UserRole.SUPERADMIN },
    create: {
      email: 'chezdemba@gmail.com',
      passwordHash,
      role: UserRole.SUPERADMIN,
      profiles: {
        create: { name: 'Demba (Super Admin)' },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'superadmin@djelis.com' },
    update: { role: UserRole.SUPERADMIN },
    create: {
      email: 'superadmin@djelis.com',
      passwordHash,
      role: UserRole.SUPERADMIN,
      profiles: {
        create: { name: 'Super Admin' },
      },
    },
  });

  const partner = await prisma.user.upsert({
    where: { email: 'partner@kunda.com' },
    update: {},
    create: {
      email: 'partner@kunda.com',
      passwordHash,
      role: UserRole.PARTNER,
      profiles: {
        create: { name: 'Kunda Productions' },
      },
    },
  });

  // 2. Create Partner profile
  const partnerProfile = await prisma.partner.create({
    data: {
      companyName: 'Kunda Productions ML',
      contactName: 'Mamadou Diabaté',
      contactEmail: 'contact@kunda.com',
      status: 'APPROVED',
    },
  });

  const creator1 = await prisma.creator.create({
    data: {
      partnerId: partnerProfile.id,
      displayName: 'Sidiki Diabaté',
      bio: 'Artiste kora et chanteur malien renommé.',
    },
  });

  const creator2 = await prisma.creator.create({
    data: {
      partnerId: partnerProfile.id,
      displayName: 'Fatoumata Diawara',
      bio: 'Chanteuse et actrice malienne de renommée internationale.',
    },
  });

  // 3. Create Categories
  const catVideo = await prisma.category.create({
    data: { name: 'DjaaSoo (Vidéo)', slug: 'djaasoo' },
  });

  const catAudio = await prisma.category.create({
    data: { name: 'DjeliSon (Audio)', slug: 'djelison' },
  });

  // Genres
  const genreCinema = await prisma.genre.create({
    data: { categoryId: catVideo.id, name: 'Cinéma & Films', slug: 'cinema' },
  });

  const genreTheatre = await prisma.genre.create({
    data: { categoryId: catVideo.id, name: 'Théâtre', slug: 'theatre' },
  });

  const genreMusic = await prisma.genre.create({
    data: { categoryId: catAudio.id, name: 'Musique', slug: 'musique' },
  });

  const genrePodcast = await prisma.genre.create({
    data: { categoryId: catAudio.id, name: 'Podcasts', slug: 'podcasts' },
  });

  // 4. Create Plans
  const planJour = await prisma.plan.create({
    data: { name: 'Pass Jour', durationDays: 1, priceFcfa: 150, priceEuro: 0.25 },
  });

  const planWeekEnd = await prisma.plan.create({
    data: { name: 'Pass Week-end', durationDays: 3, priceFcfa: 350, priceEuro: 0.50 },
  });

  const planMois = await prisma.plan.create({
    data: { name: 'Pass Mois', durationDays: 30, priceFcfa: 2000, priceEuro: 4.99 },
  });

  // 5. Create Contents (DjaaSoo / Video)
  const film1 = await prisma.content.create({
    data: {
      categoryId: catVideo.id,
      genreId: genreCinema.id,
      creatorId: creator2.id,
      title: 'Le Trône du Mandé',
      slug: 'le-trone-du-mande',
      synopsis: 'L\'épopée historique du grand empire du Mandé et la lutte pour le pouvoir de Soundiata Keïta.',
      thumbnailUrl: 'https://images.djelis.com/mande.jpg',
      type: ContentType.VIDEO,
      format: ContentFormat.SINGLE,
      isPremium: true,
      rightsTerritories: {
        createMany: {
          data: [
            { countryCode: 'ML', isAllowed: true },
            { countryCode: 'SN', isAllowed: true },
            { countryCode: 'CI', isAllowed: true },
            { countryCode: 'FR', isAllowed: true },
          ],
        },
      },
    },
  });

  const serie1 = await prisma.content.create({
    data: {
      categoryId: catVideo.id,
      genreId: genreCinema.id,
      title: 'Abidjan de Nuit',
      slug: 'abidjan-de-nuit',
      synopsis: 'Série dramatique suivant les destins croisés de quatre jeunes dans la capitale économique ivoirienne.',
      thumbnailUrl: 'https://images.djelis.com/abidjan.jpg',
      type: ContentType.VIDEO,
      format: ContentFormat.EPISODIC,
      isPremium: true,
      episodes: {
        createMany: {
          data: [
            { title: 'Épisode 1: L\'Arrivée', episodeNumber: 1, duration: 2400, cfStreamId: 'cf-stream-id-ep1' },
            { title: 'Épisode 2: Premier pas', episodeNumber: 2, duration: 2450, cfStreamId: 'cf-stream-id-ep2' },
          ],
        },
      },
    },
  });

  // 6. Create Contents (DjeliSon / Audio)
  const music1 = await prisma.content.create({
    data: {
      categoryId: catAudio.id,
      genreId: genreMusic.id,
      creatorId: creator1.id,
      title: 'Diarabi',
      slug: 'diarabi-sidiki',
      synopsis: 'Single acoustique exclusif à la kora par Sidiki Diabaté.',
      thumbnailUrl: 'https://images.djelis.com/diarabi.jpg',
      type: ContentType.AUDIO,
      format: ContentFormat.SINGLE,
      isPremium: false,
    },
  });

  const podcast1 = await prisma.content.create({
    data: {
      categoryId: catAudio.id,
      genreId: genrePodcast.id,
      title: 'Paroles de Sages',
      slug: 'paroles-de-sages',
      synopsis: 'Récits traditionnels contés par les derniers griots du pays Mandingue.',
      thumbnailUrl: 'https://images.djelis.com/sages.jpg',
      type: ContentType.AUDIO,
      format: ContentFormat.EPISODIC,
      episodes: {
        createMany: {
          data: [
            { title: 'Chapitre 1: Le Baobab Sacré', episodeNumber: 1, duration: 900, cfStreamId: 'audio-stream-id-ch1' },
            { title: 'Chapitre 2: L\'Enfant et le Python', episodeNumber: 2, duration: 1100, cfStreamId: 'audio-stream-id-ch2' },
          ],
        },
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
