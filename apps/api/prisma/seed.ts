import { PrismaClient, Category, Difficulty, TagKind, AssetStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Seeding database...');

  // 1. Admin user
  const adminPassword = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fxlibrary.com' },
    update: {},
    create: {
      email: 'admin@fxlibrary.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // 2. Tags
  const tagData: { name: string; kind: TagKind }[] = [
    { name: 'pyro', kind: 'CATEGORY' },
    { name: 'flip', kind: 'CATEGORY' },
    { name: 'vellum', kind: 'CATEGORY' },
    { name: 'rbd', kind: 'CATEGORY' },
    { name: 'particles', kind: 'CATEGORY' },
    { name: 'ocean', kind: 'TECHNIQUE' },
    { name: 'usd', kind: 'TECHNIQUE' },
    { name: 'tools', kind: 'FEATURE' },
    { name: 'retime-safe', kind: 'FEATURE' },
    { name: 'optimization', kind: 'FEATURE' },
  ];

  const tags: Record<string, string> = {};
  for (const t of tagData) {
    const tag = await prisma.tag.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
    tags[t.name] = tag.id;
  }
  console.log(`Created ${Object.keys(tags).length} tags`);

  // 3. Demo assets
  const assets = [
    {
      title: 'Campfire Pyro Setup',
      summary: 'Realistic campfire with ember particles and smoke trails.',
      category: Category.PYRO,
      difficulty: Difficulty.BEGINNER,
      descriptionMd: '# Campfire Pyro\nA complete pyro setup for realistic campfire effects.',
      howToMd: '## Setup\n1. Import the HDA\n2. Set fuel source\n3. Adjust temperature',
      breakdownMd: '## Breakdown\n- Fuel source from scatter points\n- Temperature-driven combustion',
      tags: ['pyro', 'particles'],
    },
    {
      title: 'Ocean Waves FLIP Sim',
      summary: 'Large-scale ocean simulation with foam and spray.',
      category: Category.FLIP,
      difficulty: Difficulty.ADVANCED,
      descriptionMd: '# Ocean Waves\nLarge-scale FLIP simulation for ocean surfaces.',
      howToMd: '## Setup\n1. Set ocean spectrum\n2. Configure boundary conditions\n3. Simulate',
      breakdownMd: '## Breakdown\n- Spectrum-based wave generation\n- Whitewater solver for foam',
      tags: ['flip', 'ocean'],
    },
    {
      title: 'Cloth Tearable Sim',
      summary: 'Vellum cloth with dynamic tearing and wind forces.',
      category: Category.VELLUM,
      difficulty: Difficulty.INTERMEDIATE,
      descriptionMd: '# Tearable Cloth\nVellum cloth simulation with stress-based tearing.',
      howToMd: '## Setup\n1. Create cloth geometry\n2. Configure tear threshold\n3. Add wind',
      breakdownMd: '## Breakdown\n- Stress threshold triggers edge removal\n- Wind force applied per-frame',
      tags: ['vellum', 'retime-safe'],
    },
    {
      title: 'Building Destruction RBD',
      summary: 'Procedural building destruction with debris and dust.',
      category: Category.RBD,
      difficulty: Difficulty.ADVANCED,
      descriptionMd: '# Building Destruction\nFull RBD pipeline for building collapse.',
      howToMd: '## Setup\n1. Fracture geometry\n2. Set constraint network\n3. Simulate',
      breakdownMd: '## Breakdown\n- Voronoi fracture with edge detail\n- Glue constraints with strength falloff',
      tags: ['rbd', 'optimization'],
    },
    {
      title: 'USD Scene Assembler',
      summary: 'Tool HDA for assembling USD stages with proper layering.',
      category: Category.USD,
      difficulty: Difficulty.INTERMEDIATE,
      descriptionMd: '# USD Assembler\nA tool for building USD stages in SOPs.',
      howToMd: '## Setup\n1. Drop in SOP context\n2. Wire geometry inputs\n3. Configure layers',
      breakdownMd: '## Breakdown\n- Uses LOPs under the hood\n- Proper sublayer composition',
      tags: ['usd', 'tools'],
    },
  ];

  for (const assetData of assets) {
    const { tags: assetTags, ...data } = assetData;
    const slug = slugify(data.title);

    const asset = await prisma.asset.upsert({
      where: { slug },
      update: {},
      create: {
        ...data,
        slug,
        status: AssetStatus.PUBLISHED,
        publishedAt: new Date(),
        downloadCount: Math.floor(Math.random() * 500),
      },
    });

    // Connect tags
    for (const tagName of assetTags) {
      await prisma.assetTag.upsert({
        where: {
          assetId_tagId: { assetId: asset.id, tagId: tags[tagName] },
        },
        update: {},
        create: {
          assetId: asset.id,
          tagId: tags[tagName],
        },
      });
    }

    // Create 2 versions per asset
    for (let v = 1; v <= 2; v++) {
      await prisma.assetVersion.upsert({
        where: {
          id: `${asset.id.slice(0, -2)}${v.toString().padStart(2, '0')}`,
        },
        update: {},
        create: {
          assetId: asset.id,
          versionString: `${v}.0`,
          houdiniMin: '19.5',
          houdiniMax: v === 2 ? '20.5' : '20.0',
          renderer: 'KARMA',
          os: 'ANY',
          notesMd: v === 2 ? 'Updated for Houdini 20.5 compatibility.' : 'Initial release.',
          filePath: `assets/${asset.id}/versions/v${v}/asset.zip`,
          fileSize: 1024 * 1024 * (v + 1),
          sha256: `placeholder_sha256_v${v}_${asset.id.slice(0, 8)}`,
        },
      });
    }

    // Create a placeholder preview
    await prisma.preview.upsert({
      where: {
        id: `${asset.id.slice(0, -2)}ff`,
      },
      update: {},
      create: {
        assetId: asset.id,
        type: 'IMAGE',
        url: `previews/${asset.id}/cover.jpg`,
        sortOrder: 0,
      },
    });

    console.log(`Asset: ${data.title} (${slug})`);
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
