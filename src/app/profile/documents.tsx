import { Redirect } from 'expo-router'

/** Eski adres: belgeler artık "Profesyonel profil" ekranının Belgeler sekmesinde. */
export default function DocumentsRoute() {
  return <Redirect href="/profile/professional?tab=belgeler" />
}
