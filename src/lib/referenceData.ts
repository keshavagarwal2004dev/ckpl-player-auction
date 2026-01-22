import { supabase } from './supabase'
import { PlayerCategory, Sport } from '@/types/auction'

export interface ReferenceIds {
  sports: Record<Sport, number>
  categories: Record<PlayerCategory, number>
}

let cachedRefs: ReferenceIds | null = null

const sportNameMap: Record<string, Sport> = {
  Basketball: 'basketball',
  Football: 'football',
}

const categoryNameMap: Record<string, PlayerCategory> = {
  National: 'national',
  State: 'state',
  District: 'district',
  School: 'school',
  Others: 'others',
}

export const categoryKeyToLabel: Record<PlayerCategory, string> = {
  national: 'National',
  state: 'State',
  district: 'District',
  school: 'School',
  others: 'Others',
}

export async function getReferenceIds(): Promise<ReferenceIds> {
  if (cachedRefs) {
    console.log('🔵 [getReferenceIds] Using cached refs:', cachedRefs)
    return cachedRefs
  }

  try {
    console.log('🔵 [getReferenceIds] Fetching sports and categories from Supabase...')
    const [sportsRes, categoriesRes] = await Promise.all([
      supabase.from('sports').select('id,name'),
      supabase.from('categories').select('id,name'),
    ])

    if (sportsRes.error) {
      console.error('🔴 [getReferenceIds] Sports fetch error:', sportsRes.error)
      throw sportsRes.error
    }
    if (categoriesRes.error) {
      console.error('🔴 [getReferenceIds] Categories fetch error:', categoriesRes.error)
      throw categoriesRes.error
    }

    const sports: Record<Sport, number> = {} as Record<Sport, number>
    const categories: Record<PlayerCategory, number> = {} as Record<PlayerCategory, number>

    sportsRes.data?.forEach((row) => {
      const key = sportNameMap[row.name]
      if (key) sports[key] = row.id
    })

    categoriesRes.data?.forEach((row) => {
      const key = categoryNameMap[row.name]
      if (key) categories[key] = row.id
    })

    cachedRefs = { sports, categories }
    console.log('🟢 [getReferenceIds] SUCCESS! Cached refs:', cachedRefs)
    return cachedRefs
  } catch (error) {
    console.error('🔴 [getReferenceIds] FAILED:', error)
    throw error
  }
}

export function mapSportName(name?: string | null): Sport | null {
  if (!name) return null
  return sportNameMap[name] ?? null
}

export function mapCategoryName(name?: string | null): PlayerCategory | null {
  if (!name) return null
  return categoryNameMap[name] ?? null
}
