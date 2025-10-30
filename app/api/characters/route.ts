import { prisma } from '@/services/prisma';
import { validateCharacterSpec } from '@/utils/characters';

export async function GET() {
  try {
    const chars = await prisma.character.findMany({
      include: {
        superpowers: true,
        weaknesses: true,
        story: true as any,
        user: {
          select: {
            walletAddress: true,
            username: true
          }
        }
      }
    } as any);
    
    // Shuffle array randomly
    const shuffled = chars.sort(() => Math.random() - 0.5);
    
    const mapped = shuffled.map((c: any) => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      age: c.age,
      avatarImageUrl: c.avatarImageUrl,
      avatarImageBase64: c.avatarImageBase64,
      superpowers: c.superpowers.map((p: any) => p.value),
      weaknesses: c.weaknesses.map((w: any) => w.value),
      createdAt: c.createdAt,
      walletAddress: c.user.walletAddress,
      username: c.user.username,
      story: c.story ? {
        title: c.story.title,
        synopsis: c.story.synopsis,
        alignment: c.story.alignment,
        highlights: typeof c.story.highlights === 'string' ? JSON.parse(c.story.highlights) : c.story.highlights
      } : null
    }));
    return Response.json({ characters: mapped });
  } catch (e: any) {
    return new Response(null, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const spec = await request.json();
    
    // Get wallet address from request body
    const walletAddress = spec.walletAddress || spec.address;
    if (!walletAddress || typeof walletAddress !== 'string') {
      return new Response(JSON.stringify({ error: 'Wallet address required' }), { status: 400 });
    }

    // Find or create user by wallet address
    const user = await prisma.user.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      update: {},
      create: { walletAddress: walletAddress.toLowerCase() }
    });

    const userId = user.id;
    const count = await prisma.character.count({ where: { userId } });
    if (count >= 3) return new Response(JSON.stringify({ error: 'Max 3 characters per user' }), { status: 400 });
    
    const valid = validateCharacterSpec(spec);
    if (!valid.ok) return new Response(JSON.stringify({ error: valid.error }), { status: 400 });
    // Prepare optional base64 image
    let avatarImageBase64: string | null = null;
    if (typeof spec.avatarImageUrl === 'string' && spec.avatarImageUrl.length > 0) {
      if (spec.avatarImageUrl.startsWith('data:')) {
        avatarImageBase64 = spec.avatarImageUrl;
      } else {
        try {
          const res = await fetch(spec.avatarImageUrl);
          if (res.ok) {
            const buf = await res.arrayBuffer();
            const b64 = Buffer.from(buf).toString('base64');
            const contentType = res.headers.get('content-type') || 'image/png';
            avatarImageBase64 = `data:${contentType};base64,${b64}`;
          }
        } catch {}
      }
    }

    const created = await prisma.character.create({
      data: ({
        userId,
        name: spec.name,
        age: spec.age ?? null,
        avatarImageUrl: spec.avatarImageUrl ?? null,
        avatarImageBase64,
        superpowers: { create: spec.superpowers.map((v: string) => ({ value: v })) },
        weaknesses: { create: spec.weaknesses.map((v: string) => ({ value: v })) },
        ...(spec.story && spec.story.title && spec.story.synopsis && spec.story.alignment ? {
          story: {
            create: {
              title: spec.story.title || spec.name || 'Untitled',
              synopsis: spec.story.synopsis || '',
              alignment: spec.story.alignment || 'HERO',
              highlights: JSON.stringify(spec.story.highlights || [])
            }
          }
        } : {})
      } as any),
      include: { superpowers: true, weaknesses: true, story: true as any }
    } as any);
    const c: any = created as any;
    const response = {
      id: c.id,
      userId: c.userId,
      name: c.name,
      age: c.age,
      avatarImageUrl: c.avatarImageUrl,
      avatarImageBase64: c.avatarImageBase64 ?? null,
      superpowers: (c.superpowers || []).map((p: any) => p.value),
      weaknesses: (c.weaknesses || []).map((w: any) => w.value),
      createdAt: c.createdAt,
      story: c.story ? {
        title: c.story.title,
        synopsis: c.story.synopsis,
        alignment: c.story.alignment,
        highlights: typeof c.story.highlights === 'string' ? JSON.parse(c.story.highlights) : c.story.highlights
      } : null
    };
    return Response.json({ character: response });
  } catch (e: any) {
    console.error('[api/characters POST] Error', { message: e?.message, stack: e?.stack, error: e });
    if (e.message === '401') return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401 });
    const errorMessage = e?.message || 'Internal server error';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
