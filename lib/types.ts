export type Employee = {
  id: number
  nom: string | null
  fonction: string | null
  extension: string | null
  contact: string | null
  email: string | null
  photo: string | null
  direction: string | null
  site: string | null
  manager: string | null
  favoris: boolean
}

export type Site = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  color: string
  image?: string
}
