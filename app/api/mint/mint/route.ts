export async function POST() {
  try {
    return Response.json({ status: 'pending_onchain_integration' });
  } catch (e: any) {
    return new Response(null, { status: 500 });
  }
}


