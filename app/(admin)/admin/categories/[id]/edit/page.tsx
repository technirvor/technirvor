import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import CategoryEditForm from './category-edit-form';

interface Props {
  params: { id: string };
}

async function getCategory(id: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  } catch (error) {
    return null;
  }
  // Always return a value
  return null;
}

export default async function EditCategoryPage({ params }: Props) {
  const awaitedParams = await params;
  const category = await getCategory(awaitedParams.id);
  if (!category) {
    notFound();
    return null;
  }
  return <CategoryEditForm category={category} />;
}
