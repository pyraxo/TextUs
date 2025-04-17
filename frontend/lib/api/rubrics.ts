import { fetchApi } from '@/lib/api/common';
import { RubricSettingsUpdate, RubricsSettings } from '@/types/rubrics';

export async function getRubrics(): Promise<RubricsSettings[]> {
  return fetchApi<RubricsSettings[]>('/rubrics');
}

export async function getRubric(id: string): Promise<RubricsSettings> {
  return fetchApi<RubricsSettings>(`/rubrics/${id}`);
}

export async function updateRubric(id: string, input: RubricSettingsUpdate): Promise<RubricsSettings> {
  return fetchApi<RubricsSettings>(`/rubrics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
} 