import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_VIDEOKE_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.VIDEOKE_SUPABASE_SECRET_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('fila_pedidos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ fila: data || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const { error } = await supabase
      .from('fila_pedidos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ sucesso: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}