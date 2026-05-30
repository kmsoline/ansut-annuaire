import { NextRequest, NextResponse } from 'next/server';
import { dbSelectOne, dbUpdate, dbDelete } from '@/lib/db';
import type { AfriNomadeDemande, LigneCotation } from '@/lib/afrinomade-types';
import { calcPrixClient } from '@/lib/afrinomade-types';
import { checkAdminAuth } from '@/lib/api-auth';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id } = await params;
  try {
    const demande = await dbSelectOne<AfriNomadeDemande>('afrinomade_demandes', `select=*&id=eq.${id}`);
    if (!demande) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    return NextResponse.json(demande);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await dbUpdate<AfriNomadeDemande>('afrinomade_demandes', `id=eq.${id}`, body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdminAuth())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id } = await params;
  try {
    await dbDelete('afrinomade_demandes', `id=eq.${id}`);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
